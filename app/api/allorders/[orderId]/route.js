// app/api/allorders/[orderId]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/ecom_order_info';  // ✅ Import the Mongoose model

export async function GET(request, context) {
  const { params } = await context;
  const { orderId } = params;

  try {
    await dbConnect(); // ✅ Connect to MongoDB

    const order = await Order.findById(orderId); // ✅ Use the Order model

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("API Error fetching order by ID:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
