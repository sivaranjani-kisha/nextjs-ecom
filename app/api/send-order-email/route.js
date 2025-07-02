import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";

export  async function POST(req) {


  const { orderDetails, customerEmail, adminEmail } =await req.json();

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // or your email service
       port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // This bypasses the certificate validation
  }
    });

    // Customer email
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
    //   cc: adminEmail,
      subject: 'Your Order Confirmation',
      html: `
        <h1>Thank you for your order!</h1>
        <p>Order Number: ${orderDetails.order_number}</p>
        <p>Total Amount: ₹${orderDetails.order_amount.toFixed(2)}</p>
        <p>Payment Method: ${orderDetails.payment_method}</p>
        <h2>Order Items:</h2>
        <ul>
          ${orderDetails.order_item.map(item => `
            <li>${item.name} - ₹${item.price.toFixed(2)} x ${item.quantity}</li>
          `).join('')}
        </ul>
        <p>We'll process your order shortly.</p>
      `,
    };

    // Admin email
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'New Order Received',
      html: `
        <h1>New Order Received</h1>
        <p>Order Number: ${orderDetails.order_number}</p>
        <p>Customer: ${orderDetails.order_username}</p>
        <p>Email: ${customerEmail}</p>
        <p>Total Amount: ₹${orderDetails.order_amount.toFixed(2)}</p>
        <h2>Order Items:</h2>
        <ul>
          ${orderDetails.order_item.map(item => `
            <li>${item.name} - ₹${item.price.toFixed(2)} x ${item.quantity}</li>
          `).join('')}
        </ul>
      `,
    };

    // Send both emails
    const res =await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ status: 200},{ success: true,message:res });
  } catch (error) {
    console.error('Error sending emails:', error);
    // res.status(500).json({ success: false, error: 'Failed to send emails' });
     return NextResponse.json({ success: false, error: error.message,message:res }, { status: 500 });
  }
}