// app/api/categoryproduct/nav/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CategoryProduct from "@/models/categoryproduct";

export async function GET() {
  try {
    await connectDB();

    // Fetch all active category products with populated subcategory info
    const categoryProducts = await CategoryProduct.find({ status: "Active" })
      .populate({
        path: "subcategoryId",
        model: "ecom_category_infos",
        select: "category_name category_slug image navImage status", // ✅ only needed fields
      })
      .sort({ position: 1 });

    return NextResponse.json(categoryProducts);
  } catch (error) {
    console.error("Error fetching nav categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation categories" },
      { status: 500 }
    );
  }
}
