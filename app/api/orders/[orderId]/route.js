import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/ecom_order_info";

export async function PUT(req, { params }) {
  await dbConnect();
  const { orderId } = params;

  try {
    // Check if order exists and is pending
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.order_status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Only pending orders can be cancelled" },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { order_status: "cancelled" },
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