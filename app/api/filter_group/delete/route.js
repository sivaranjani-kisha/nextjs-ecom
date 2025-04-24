import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Filtergroup from "@/models/ecom_filter_group_infos";

export async function POST(req) {
    await dbConnect();

    try {
        const { filtergroupId } = await req.json();
    
        if (!filtergroupId) {
          return NextResponse.json({ error: "Filter group ID is required" }, { status: 400 });
        }
    
        const filtergroup = await Filtergroup.findByIdAndDelete(filtergroupId);
        if (!filtergroup) {
          return NextResponse.json({ error: "Filter group not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Filter group deleted successfully" });
      } catch (error) {
        console.error("Error deleting Filter:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}