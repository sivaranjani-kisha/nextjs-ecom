import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Offer from "@/models/ecom_offer_info";
import Product from "@/models/product"; // Assuming path is correct

export async function GET() {
  try {
    await connectDB();

    // Fetch the specific active offer with code 'off_code_1'
    const offer = await Offer.findOne({
      offer_code: "off_code_1",
      fest_offer_status: "active",
    });

    if (!offer || !offer.offer_product?.length) {
      return NextResponse.json({ success: false, message: "No valid offer found" });
    }

    // Fetch products matching the offer_product IDs
    const products = await Product.find({ _id: { $in: offer.offer_product } });

    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    console.error("Error fetching offer products:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch offer products" }, { status: 500 });
  }
}
