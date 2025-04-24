import  connectToDatabase  from "@/lib/db";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase(); // Ensure DB connection

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const name = searchParams.get("name");
    const item_code = searchParams.get("item_code");
    const status = searchParams.get("status");

    let filter = {};

    if (category) filter.category = category;
    if (name) filter.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
    if (item_code) filter.item_code = item_code;
    if (status) filter.status = status;

    const products = await Product.find(filter).lean(); // Fetch filtered products

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}




// import connectToDatabase from "@/lib/db";
// import Product from "@/models/product";
// import { NextResponse } from "next/server";

// export async function GET(req, { params }) {
//   try {
//     await connectToDatabase();

//     const { slug } = params; // Get slug from URL params

//     if (!slug) {
//       return NextResponse.json({ error: "Missing product slug" }, { status: 400 });
//     }
// console.log(slug);
//     const product = await Product.findOne({ slug }).lean();

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json(product, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
