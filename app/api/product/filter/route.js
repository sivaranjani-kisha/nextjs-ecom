import dbConnect from "@/lib/db";
import Product from "@/models/product";
import ProductFilter from "@/models/ecom_productfilter_info";

export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    console.log(searchParams);
    const categoryId = searchParams.get('categoryId');
    const brandIds = searchParams.get('brands')?.split(',') || [];
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 1000000;
    const filterIds = searchParams.get('filters')?.split(',') || [];
    
    // Base query - always filter by category
    let query = { sub_category: categoryId, status: "Active" };
    
    // Add brand filters if any
    if (brandIds.length > 0) {
      query.brand = { $in: brandIds };
    }
    
    // Price range filter (considers both price and special_price)
    query.$or = [
      { 
        $and: [
          { special_price: { $ne: null } },
          { special_price: { $gte: minPrice, $lte: maxPrice } }
        ]
      },
      { 
        $and: [
          { special_price: null },
          { special_price: { $gte: minPrice, $lte: maxPrice } }
        ]
      }
    ];
    
    // First fetch products matching brand and price filters
    let products = await Product.find(query)
      .populate('brand', 'brand_name brand_slug')
      .lean();
    
    // Apply additional filters if any
    if (filterIds.length > 0) {
      const productIds = products.map(p => p._id);
      
      // Get all product-filter relationships that match our criteria
      const productFilters = await ProductFilter.find({
        product_id: { $in: productIds },
        filter_id: { $in: filterIds }
      });
      
      // Group filters by product
      const filtersByProduct = productFilters.reduce((acc, pf) => {
        const productId = pf.product_id.toString();
        if (!acc[productId]) acc[productId] = new Set();
        acc[productId].add(pf.filter_id.toString());
        return acc;
      }, {});
      
      // Filter products to only those that have ALL selected filters
      products = products.filter(product => {
        const productId = product._id.toString();
        const productFilterIds = filtersByProduct[productId] || new Set();
        //return filterIds.every(fid => productFilterIds.has(fid));
        return filterIds.some(fid => productFilterIds.has(fid));
      });
    }
    
    return Response.json(products);
  } catch (error) {
    console.error('Error in /api/product/filter:', error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}