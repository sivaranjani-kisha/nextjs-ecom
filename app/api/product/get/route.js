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


const filterMap = new Map();
ProductFilteritems.forEach(item => {
  filterMap.set(item.product_id.toString(), item); // Ensure key is string
});

// Map filter_id => Filter details
const filtersMap = new Map();
Filteritems.forEach(item => {
  filtersMap.set(item._id.toString(), item); // Ensure key is string
});


    // Attach wishlist data to each product
    // const productsWithWishlist = products.map(product => {
    //   const wishlist = wishlistMap.get(product._id.toString()) || null;
    //   const filtersdata = filterMap.get("product_id":product._id) || null;
    //   return {
    //     ...product,
    //     wishlist,
    //     filtersdata
    //   };
    // });

const productsWithWishlist = products.map(product => {
  const wishlist = wishlistMap.get(product._id.toString()) || null;
   const filtersdata = filterMap.get(product._id.toString()) || null;

  // Get full filter details using filter_id
  let filterDetails = null;
  if (filtersdata && filtersdata.filter_id) {
    filterDetails = filtersMap.get(filtersdata.filter_id.toString()) || null;
  }

  return {
    ...product,
    wishlist,
    filtersdata,
    filterDetails // Full filter info available here
  };
});


    return NextResponse.json(productsWithWishlist, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
