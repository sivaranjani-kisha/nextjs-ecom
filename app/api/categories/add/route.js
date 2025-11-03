import dbConnect from "@/lib/db";
import Category from "@/models/ecom_category_info";
import { NextResponse } from "next/server";
import md5 from "md5";
import { writeFile } from "fs/promises";
import path from "path";

function convertSlug(slug) {
  let result = slug.replace(/ /g, "-"); // replace spaces with hyphens
  result = result.replace(/[^A-Za-z0-9\-]/g, ""); // remove special chars
  result = result.replace(/-+/g, "-"); // collapse multiple hyphens
  result = result.toLowerCase();

  return result;

}
export async function POST(req) {
  try {
    await dbConnect();

    // Parse formData instead of req.body
    const formData = await req.formData();
    const category_name = formData.get("category_name");
    const parentid = formData.get("parentid") || "none";
    const status = formData.get("status") || "Active";
    const show_on_home = formData.get("show_on_home") || "No";
    const file = formData.get("image");

    if (!category_name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let category_slug = convertSlug(category_name);
    let md5_cat_name = md5(category_slug);

    // Check if category already exists
    let existingCategory = await Category.findOne({ category_slug });
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    // Save the image locally if provided
    let image_url = "";
    // FIX: Only process image if it exists and is a valid file
    if (file && file instanceof File && file.size > 0 && file.name) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public/uploads/categories");
        await writeFile(path.join(uploadDir, file.name), buffer);
        image_url = `http://localhost:3000/uploads/categories/${file.name}`;
      } catch (fileError) {
        console.error("Error processing image file:", fileError);
        // Continue without image if file processing fails
      }
    }

    // Handle navImage upload
    let nav_image_url = "";
    const navFile = formData.get("navImage");
    // FIX: Only process navImage if it exists and is a valid file
    if (navFile && navFile instanceof File && navFile.size > 0 && navFile.name) {
      try {
        const buffer = Buffer.from(await navFile.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public/uploads/categories");
        await writeFile(path.join(uploadDir, navFile.name), buffer);
        nav_image_url = `http://localhost:3000/uploads/categories/${navFile.name}`;
      } catch (fileError) {
        console.error("Error processing nav image file:", fileError);
        // Continue without nav image if file processing fails
      }
    }

    // Create category
    const newCategory = new Category({
      category_name,
      category_slug,
      md5_cat_name,
      parentid,
      status,
      show_on_home,
      image: image_url, // Will be empty string if no image
      navImage: nav_image_url, // Will be empty string if no nav image
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCategory.save();
    return NextResponse.json({ message: "Category added successfullyyyy", category: newCategory }, { status: 201 });

  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ error: "Failed to add category", details: error.message }, { status: 500 });
  }
}