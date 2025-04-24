import dbConnect from "@/lib/db";
import Category from "@/models/ecom_category_info";
import { NextResponse } from "next/server";
import md5 from "md5";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    await dbConnect();

    // Parse formData instead of req.body
    const formData = await req.formData();
    const category_name = formData.get("category_name");
    const parentid = formData.get("parentid") || "none";
    const status = formData.get("status") || "Active";
    const show_on_home = formData.get("show_on_home") || "No"; // Add this line
    const file = formData.get("image");
console.log(show_on_home)
    if (!category_name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let category_slug = category_name.toLowerCase().replace(/\s+/g, "-");
    let md5_cat_name = md5(category_slug);

    // Check if category already exists
    let existingCategory = await Category.findOne({ category_slug });
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    // Save the image locally if provided
    let image_url = "";
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");

      // Ensure the directory exists
      await writeFile(path.join(uploadDir, file.name), buffer);
      console.log('====================================');
      console.log(file);
      console.log('====================================');
      image_url = `http://localhost:3000/uploads/categories/${file.name}`;
    }

    // Create category
    const newCategory = new Category({
      category_name,
      category_slug,
      md5_cat_name,
      parentid,
      status,
      show_on_home, // Include the new field
      image:image_url, // Store local image path
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCategory.save();
    return NextResponse.json({ message: "Category added successfully", category: newCategory }, { status: 201 });

  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ error: "Failed to add category", details: error.message }, { status: 500 });
  }
}
