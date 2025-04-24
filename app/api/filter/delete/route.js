import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Filter from "@/models/ecom_filter_infos";

export async function POST(req) {
    await dbConnect();

    try {
        const { filterId } = await req.json();
    
        if (!filterId) {
          return NextResponse.json({ error: "Filter ID is required" }, { status: 400 });
        }
    
        const filter = await Filter.findByIdAndDelete(filterId);
        if (!filter) {
          return NextResponse.json({ error: "Filter not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Filter deleted successfully" });
      } catch (error) {
        console.error("Error deleting Filter:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}