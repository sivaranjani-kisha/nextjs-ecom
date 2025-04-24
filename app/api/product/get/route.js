import dbConnect from "@/lib/db";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import Wishlist from "@/models/ecom_wishlist_info";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    const wishlistedItems = await Wishlist.find({}, 'productId userId').lean(); // adjust projection as needed
    

    // Create a map of productId => wishlist data
    const wishlistMap = new Map();
    wishlistedItems.forEach(item => {
      wishlistMap.set(item.productId.toString(), item);
    });

    // Attach wishlist data to each product
    const productsWithWishlist = products.map(product => {
      const wishlist = wishlistMap.get(product._id.toString()) || null;
      return {
        ...product,
        wishlist
      };
    });

    return NextResponse.json(productsWithWishlist, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
