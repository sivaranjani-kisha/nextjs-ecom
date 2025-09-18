import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/ecom_order_info";

export async function PUT(req, { params }) {
  await dbConnect();
  const { orderId } = params;

  try {
    const { status } = await req.json(); // ✅ get new status from request

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ✅ Update with new status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { order_status: status },
      { new: true }
    );

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
