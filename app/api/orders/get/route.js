import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/ecom_order_info";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    let query = {};

    if (status && status !== "all") {
      query.order_status = status;
    }

    const orders = await Order.find(query);
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
