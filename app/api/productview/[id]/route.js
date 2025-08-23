import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProductView from "@/models/productView";

// 🔹 Get single product view
export async function GET(request, context) {
  await dbConnect();
  try {
    const { id } = context.params;   // ✅ Correct way to read id

    const productView = await ProductView.findById(id)
      .populate("category", "category_name")
      .populate("products", "name price");

    if (!productView) {
      return NextResponse.json(
        { success: false, message: "ProductView not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: productView });
  } catch (err) {
    console.error("❌ Error fetching ProductView:", err.message);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 Update product view
export async function PUT(request, context) {
  await dbConnect();
  try {
    const { id } = context.params;   // ✅ Correct way
    const body = await request.json();
    const { products, status } = body;

    const productView = await ProductView.findById(id);
    if (!productView) {
      return NextResponse.json(
        { success: false, message: "ProductView not found" },
        { status: 404 }
      );
    }

    if (Array.isArray(products)) productView.products = products;
    if (status) productView.status = status;

    await productView.save();
    await productView.populate("category", "category_name");
   

    return NextResponse.json({ success: true, data: productView });
  } catch (err) {
    console.error("❌ Error updating ProductView:", err.message);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
