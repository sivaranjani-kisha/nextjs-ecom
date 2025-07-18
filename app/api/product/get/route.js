import dbConnect from "@/lib/db";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import Wishlist from "@/models/ecom_wishlist_info";
import Filter from '@/models/ecom_filter_infos';
import ProductFilter from '@/models/ecom_productfilter_info';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    const wishlistedItems = await Wishlist.find({}, 'productId userId').lean(); // adjust projection as needed

   const ProductFilteritems = await ProductFilter.find({}).lean();
const Filteritems = await Filter.find({}).lean();

    // Create a map of productId => wishlist data
    const wishlistMap = new Map();
    wishlistedItems.forEach(item => {
      wishlistMap.set(item.productId.toString(), item);
    });


// Map product_id => [ Product_filter items ]
const filterMap = new Map();
ProductFilteritems.forEach(item => {
  const key = item.product_id.toString();
  if (!filterMap.has(key)) {
    filterMap.set(key, []);
  }
  filterMap.get(key).push(item);
});

// Map filter_id => Filter details
const filtersMap = new Map();
Filteritems.forEach(item => {
  filtersMap.set(item._id.toString(), item);
});

// Add filters and wishlist to products
const productsWithWishlist = products.map(product => {
  const wishlist = wishlistMap.get(product._id.toString()) || null;

  const filtersdata = filterMap.get(product._id.toString()) || [];

  // Full filter details
  const filterDetails = filtersdata
    .map(f => filtersMap.get(f.filter_id?.toString()))
    .filter(Boolean);

  return {
    ...product,
    wishlist,
    filterDetails, // ✅ all full filter info here
  };
});



    return NextResponse.json(productsWithWishlist, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
