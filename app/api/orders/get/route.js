import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/ecom_order_info";
import jwt from "jsonwebtoken";


export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
     const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
          return NextResponse.json(
            { error: "Authorization token required" },
            { status: 401 }
          );
        }
    
        // Verify token and get user ID (you'll need your JWT verification logic)
        // This is a placeholder - replace with your actual token verification
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
    const status = searchParams.get("status");
    let query = {};

    if (status && status !== "all") {
      query.order_status = status;
    }

    if(userId){
      query.user_id = userId;
    }

    const orders = await Order.find(query);
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
