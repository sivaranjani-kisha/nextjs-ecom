// app/api/filter_group/bulk-upload/route.js
import dbConnect from "@/lib/db";
import Filter from "@/models/ecom_filter_group_infos";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Bulk upload API called");
    
    // Dynamic import for xlsx to avoid ES module issues
    const XLSX = await import('xlsx');
    
    await dbConnect();
    const formData = await req.formData();
    const file = formData.get("excel");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Read Excel file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log("Data from Excel:", data);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data found in file" }, { status: 400 });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        const { filtergroup_name, status = "Active" } = row;

        if (!filtergroup_name) {
          throw new Error("Filter group name is required");
        }

        let filtergroup_slug = filtergroup_name.toLowerCase().replace(/\s+/g, "-");

        let existingFilter = await Filter.findOne({ filtergroup_slug });
        if (existingFilter) {
          throw new Error(`Filter group "${filtergroup_name}" already exists`);
        }

        const validStatus = ["Active", "Inactive"].includes(status) ? status : "Active";

        const newFilter = new Filter({
          filtergroup_name,
          filtergroup_slug,
          status: validStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newFilter.save();
        results.successful++;
        console.log(`Created: ${filtergroup_name}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          error: error.message,
          data: row
        });
        console.log(`Failed row ${rowNumber}:`, error.message);
      }
    }

    return NextResponse.json({
      message: `Bulk upload completed: ${results.successful} successful, ${results.failed} failed`,
      details: results
    });

  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json({ 
      error: "Failed to process bulk upload", 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Bulk upload API is running!",
    status: "OK" 
  });
}