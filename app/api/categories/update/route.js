import dbConnect from "@/lib/db";
import Category from "@/models/ecom_category_info";
import { NextResponse } from "next/server";
import md5 from "md5";
import { writeFile, unlink } from "fs/promises";
import path from "path";
 
export async function PUT(req) {
  try {
    await dbConnect();
 
    // Parse formData
    const formData = await req.formData();
    const _id = formData.get("_id");
    const category_name = formData.get("category_name");
    const parentid = formData.get("parentid") || "none";
    const status = formData.get("status") || "Active";
    const file = formData.get("image");
    const existingImage = formData.get("existingImage");
 
    if (!_id || !category_name) {
      return NextResponse.json({ error: "Category ID and name are required" }, { status: 400 });
    }
 
    // Find the existing category
    const existingCategory = await Category.findById(_id);
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
 
    // Check if new category name already exists (excluding current category)
    const category_slug = category_name.toLowerCase().replace(/\s+/g, "-");
    const md5_cat_name = md5(category_slug);
   
    const duplicateCategory = await Category.findOne({
      category_slug,
      _id: { $ne: _id } // Exclude current category from check
    });
   
    if (duplicateCategory) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }
 
    // Handle image upload/update
    let image_url = existingImage;
   
    if (file) {
      // Delete old image if it exists
      if (existingImage) {
        try {
          const oldImagePath = path.join(
            process.cwd(),
            "public",
            existingImage.replace("http://localhost:3000", "")
          );
          await unlink(oldImagePath);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
 
      // Save new image
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      const fileName = `category_${Date.now()}${path.extname(file.name)}`;
     
      await writeFile(path.join(uploadDir, fileName), buffer);
      image_url = `http://localhost:3000/uploads/categories/${fileName}`;
    }
 
    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      {
        category_name,
        category_slug,
        md5_cat_name,
        parentid,
        status,
        image: image_url,
        updatedAt: new Date(),
      },
      { new: true } // Return the updated document
    );
 
    if (!updatedCategory) {
      return NextResponse.json({ error: "Failed to update category" }, { status: 400 });
    }
 
    return NextResponse.json(
      {
        message: "Category updated successfully",
        category: updatedCategory
      },
      { status: 200 }
    );
 
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
      { status: 500 }
    );
  }
}