import dbConnect from "@/lib/db";
import EcomOrderInfo from "@/models/ecom_order_info";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();

    const {
      user_id,
      order_username,
      order_phonenumber,
      order_item,
      order_amount,
      order_deliveryaddress,
      payment_method,
      payment_type,
      order_status,
      delivery_type,
      payment_id,
      order_number,
      order_details,
      payment_status,
      user_adddeliveryid,
      email_address,
    } = body;

    // Validate required fields
    if (!user_id || !email_address || !order_phonenumber || (order_item.length == 0) || !order_amount) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const newOrder = new EcomOrderInfo({
      user_id,
      order_username,
      order_phonenumber,
      order_item,
      order_amount,
      order_deliveryaddress,
      payment_method,
      payment_type,
      delivery_type,
      payment_id,
      order_number,
      order_details,
      user_adddeliveryid,
      email_address,
      order_status: order_status || "pending",
      payment_status: payment_status || "unpaid"
    });

    await newOrder.save();
    return Response.json({ success: true, message: "Order added successfully", order: newOrder }, { status: 201 });

  } catch (error) {
    return Response.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
