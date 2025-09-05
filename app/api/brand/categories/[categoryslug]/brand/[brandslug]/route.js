import dbConnect from "@/lib/db";
import Brand from "@/models/ecom_brand_info";
import Product from "@/models/product";
import ProductFilter from "@/models/ecom_productfilter_info";
import Filter from "@/models/ecom_filter_infos";
import FilterGroup from "@/models/ecom_filter_group_infos";
import ecom_category_info from "@/models/ecom_category_info";
 
async function getCategoryTree(parentId, productCategoryIds = null) {
  const categories = await ecom_category_info.find({ parentid: parentId }).lean();
 
  let filteredCategories = [];
  for (const category of categories) {
    // If we have product category IDs, only include categories that have products
    if (productCategoryIds) {
      if (productCategoryIds.includes(category._id.toString())) {
        category.subCategories = await getCategoryTree(category._id, productCategoryIds);
        filteredCategories.push(category);
      } else {
        // Check if any subcategories have products
        const children = await getCategoryTree(category._id, productCategoryIds);
        if (children.length > 0) {
          category.subCategories = children;
          filteredCategories.push(category);
        }
      }
    } else {
      // If no product filtering, include all categories
      category.subCategories = await getCategoryTree(category._id);
      filteredCategories.push(category);
    }
  }
 
  return filteredCategories;
}
 
export async function GET(request, { params }) {
  try {
    await dbConnect();
 
    const { categoryslug, brandslug } = await params; // Corrected parameter name
    console.log("Fetching data for:", categoryslug, brandslug);
   
    // Fetch category
    const category = await ecom_category_info.findOne({ category_slug: categoryslug });
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }
   
    // Fetch brand
    const brand = await Brand.findOne({ brand_slug: brandslug }); // Use slug, not brandslug
    if (!brand) {
      return Response.json({ error: "Brand not found" }, { status: 404 });
    }
 
    // First get all products for this brand to determine which categories have products
    const allBrandProducts = await Product.find({
      brand: brand._id,
      status: "Active"
    }).select('sub_category').lean();
   
    if (!allBrandProducts || allBrandProducts.length === 0) {
      return Response.json({
        category,
        brand,
        products: [],
        categories: [],
        filters: []
      });
    }
   
    // Get all subcategory IDs that have products for this brand
    const productSubCategoryIds = [...new Set(
      allBrandProducts.map(p => p.sub_category?.toString()).filter(Boolean)
    )];
   
    // Get products for this brand and category (including subcategories)
    const products = await Product.find({
      brand: brand._id.toString(),
      $or: [
        { category: category._id.toString() },
        { sub_category: { $in: productSubCategoryIds } }
      ],
      status: "Active"
    }).populate('brand', 'brand_name brand_slug');
   
    // Build category tree with only categories that have products
    const categoryTree = await getCategoryTree(
      category._id,
      productSubCategoryIds
    );
   
    // Extract product IDs for filtering
    const productIds = products.map(product => product._id);
    const productFilters = await ProductFilter.find({ product_id: { $in: productIds } });
   
    // Extract unique filter IDs
    const filterIds = [...new Set(productFilters.map(pf => pf.filter_id))];
    const filters = await Filter.find({ _id: { $in: filterIds } }).populate({
      path: 'filter_group',
      select: 'filtergroup_name -_id',
      model: FilterGroup
    }).lean();
   
    // Format filters
    const formattedFilters = filters.map(filter => ({
      ...filter,
      filter_group_name: filter.filter_group?.filtergroup_name || 'No Group',
      filter_group: filter.filter_group?._id
    }));
 
    return Response.json({
      category,
      brand,
      products,
      categories: categoryTree,
      filters: formattedFilters
    });
  } catch (error) {
    console.error("Error in category-brand API:", error);
    return Response.json({ error: "Error fetching category brand details" }, { status: 500 });
  }
}