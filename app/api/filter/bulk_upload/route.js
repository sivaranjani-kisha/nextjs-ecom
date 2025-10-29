import dbConnect from "@/lib/db";
import FilterGroup from "@/models/ecom_filter_group_infos";
import Filter from "@/models/ecom_filter_infos";
import * as xlsx from "xlsx";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("excel");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const errors = [];
    let addedCount = 0;
    let updatedCount = 0;

    for (let [index, row] of rows.entries()) {
      const { filter_group_name, filter_name, status = "Active" } = row;
      const filterGroupName = row.filter_group_name?.trim() || row.filtergroup_name?.trim();
const filterName = row.filter_name?.trim() || row.filtername?.trim();
const statusValue = row.status?.trim() || "Active";

     
if (!filterGroupName || !filterName) {
  errors.push({
    row: index + 2,
    error: "Missing filter_group_name or filter_name",
  });
  continue;
}

let filterGroup = await FilterGroup.findOne({
  filtergroup_name: filterGroupName,
});

if (!filterGroup) {
  filterGroup = await FilterGroup.create({
    filtergroup_name: filterGroupName,
    filtergroup_slug: filterGroupName.toLowerCase().replace(/\s+/g, "-"),
    status: "Active",
  });
}

      // ✅ Check for existing filter correctly
      let existingFilter = await Filter.findOne({
        filter_name: filter_name.trim(),
        filter_group: filterGroup._id,
      });

      if (existingFilter) {
        // Update only if status changed
        if (existingFilter.status !== status.trim()) {
          existingFilter.status = status.trim() || "Active";
          await existingFilter.save();
        }
        updatedCount++;
      } else {
        await Filter.create({
          filter_name: filter_name.trim(),
          filter_slug: filter_name.trim().toLowerCase().replace(/\s+/g, "-"),
          filter_group: filterGroup._id,
          status: status.trim() || "Active",
        });
        addedCount++;
      }
    }

    return NextResponse.json(
      {
        message: `Upload completed: ${addedCount} added, ${updatedCount} updated.`,
        details: errors,
      },
      { status: errors.length ? 207 : 201 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
      error: "Upload failed. Please try again.",
      message: err.message,
      stack: err.stack, // include for debugging
    },
    );
  }
}
