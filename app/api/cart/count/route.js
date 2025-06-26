// api/cart/count/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/ecom_cart_info_old_jun20";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    // Get user ID from token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ count: 0 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const cart = await Cart.findOne({ userId });
    return NextResponse.json({
      count: cart?.totalItems || 0
    });

  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}