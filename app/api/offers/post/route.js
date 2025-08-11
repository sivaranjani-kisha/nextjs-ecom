import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Offer from "@/models/ecom_offer_info";

export async function GET() {
    try {
        await connectDB(); 
        const offers = await Offer.find({});
        return NextResponse.json({ success: true, data: offers });
    } catch (error) {
        console.error("Error fetching offers:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch offers" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();  // Parse request body
          // Validate offer limit if enabled
        if (body.limit_enabled) {
            if (!body.offer_limit || body.offer_limit <= 0) {
                return NextResponse.json(
                    { success: false, error: "Offer limit must be a positive number when limit is enabled" },
                    { status: 400 }
                );
            }
        }

       // console.log(body);
        if (body.selected_users && !Array.isArray(body.selected_users)) {
            return NextResponse.json(
                { success: false, error: "selected_users must be an array" },
                { status: 400 }
            );
        }
        //const newOffer = new Offer(body);
          const newOffer = new Offer({
            ...body,
            offer_limit: body.limit_enabled ? body.offer_limit : null
        });
        
        await newOffer.save();
        
        return NextResponse.json({ success: true, message: "Offer created successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Error creating offer:", error);
        return NextResponse.json({ success: false, error: "Failed to create offer" }, { status: 500 });
    }
}