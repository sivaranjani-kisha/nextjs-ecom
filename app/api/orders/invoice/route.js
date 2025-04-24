// @ts-ignore
import PDFDocument from "pdfkit";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import EcomOrderInfo from "@/models/ecom_order_info";
import path from "path";

export async function GET(request) {
  console.log("API Hit: Generating Invoice...");

  const { searchParams } = new URL(request.url);
  const order_id = searchParams.get("order_id");

  if (!order_id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const order = await EcomOrderInfo.aggregate([
      {
        $match: {
          order_id
        }
      },
      {
        $lookup: {
          "from": "products",
          "let": { "productId": { $toObjectId: "$product_id"}},
          "pipeline": [
            { "$match": { "$expr": { "$eq": [ "$_id", "$$productId" ] } } }
          ],
          "as": "productInfo"
        }
      }
    ]);

    console.log("order", JSON.stringify(order));

    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create a PDF in memory
    const doc = new PDFDocument({
      font: path.resolve(process.cwd(), "public/fonts/Roboto.ttf"),
    });

    let buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => console.log("PDF Generated Successfully"));

    // Add logo and title on the top-left corner
    const logoPath = path.resolve(process.cwd(), "public/assets/images/logo-sm.png");
    const logoHeight = 50; // Adjust logo height as needed
    doc.image(logoPath, 50, 50, { width: 50, height: logoHeight });
    doc.fontSize(20).text("MySite", 110, 60); // Adjust the position as needed

    // Add address on the top-right corner
    const address = "2821 Kensington Road,\nAvondale Estates, GA 30002 USA.";
    doc.fontSize(12).text(address, 400, 50, { align: "right" });

    // Add Order ID and Order Date on the left
    const orderDetailsY = 50 + logoHeight + 20; // Below the logo and address
    doc.fontSize(12)
      .text(`Order ID: ${order[0]?.order_id}`, 50, orderDetailsY) // Order ID
      .text(`Order Date: ${new Date(order[0]?.createdAt).toLocaleDateString()}`, 50, orderDetailsY + 20); // Order Date below Order ID

    // Billed To section
    const billedToY = orderDetailsY + 60; // Below the order details
    doc.fontSize(12).text("Billed To:", 50, billedToY);
    doc.text("Joe Smith", 50, billedToY + 20);
    doc.text("795 Folsom Ave", 50, billedToY + 40);
    doc.text("San Francisco, CA 94107", 50, billedToY + 60);
    doc.text("P: (123) 456-7890", 50, billedToY + 80);

    // Shipped To section
    const shippedToX = 300; // Adjust the X position as needed
    doc.fontSize(12).text("Shipped To:", shippedToX, billedToY);
    doc.text("Joe Smith", shippedToX, billedToY + 20);
    doc.text("795 Folsom Ave", shippedToX, billedToY + 40);
    doc.text("San Francisco, CA 94107", shippedToX, billedToY + 60);
    doc.text("P: (123) 456-7890", shippedToX, billedToY + 80);

    // Add customer details
    const detailsY = billedToY + 120; // Below the "Billed To" and "Shipped To" sections
    
     
    const orderArr = [];

    for (const iterator of order[0]?.productInfo) {
      orderArr.push([`${iterator.name}`, `6`, `15`, `Rs.${iterator.price}/-`]);
    }

    console.log("orderArr", orderArr);

    // Add table
    const table = {
      headers: ["Title", "Quantity", "Tax", "Total"],
      rows: [
        ...orderArr
      ],
    };

    const startY = detailsY + 100; // Below the customer details
    const startX = 50;
    const rowHeight = 30;
    const colWidth = 120;
    const padding = 10;

    // Draw table headers with borders
    doc.fontSize(12);
    table.headers.forEach((header, i) => {
      doc.rect(startX + i * colWidth, startY, colWidth, rowHeight).stroke();
      doc.text(header, startX + i * colWidth + padding, startY + padding, {
        width: colWidth - 2 * padding,
        align: "center",
      });
    });

    // Draw table rows with borders
    doc.fontSize(12);
    table.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        doc.rect(startX + colIndex * colWidth, startY + (rowIndex + 1) * rowHeight, colWidth, rowHeight).stroke();
        doc.text(cell, startX + colIndex * colWidth + padding, startY + (rowIndex + 1) * rowHeight + padding, {
          width: colWidth - 2 * padding,
          align: "left",
        });
      });
    });

    // Add subtotal
    const subtotalY = startY + (table.rows.length + 2) * rowHeight;
    doc.text(`Subtotal: $${order[0]?.price}`, startX, subtotalY);

    // Add terms and conditions
    const termsY = subtotalY + 30;
    doc.text("Terms and Conditions:", startX, termsY);
    doc.text("1. All accounts are to be paid within 7 days from receipt of invoice.", startX, termsY + 20);
    doc.text("2. To be paid by cheque or credit card or direct payment online.", startX, termsY + 40);
    doc.text("3. If account is not paid within 7 days the credits details supplied as confirmation of work undertaken will be charged the agreed quoted fee noted above.", startX, termsY + 60);

    doc.end();

    // Wait for PDF to be fully generated
    const pdfData = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    // Return the PDF as a response
    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice_${order_id}.pdf`,
      },
    });

  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}