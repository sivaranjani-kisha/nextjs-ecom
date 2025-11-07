import dbConnect from "@/lib/db";
import Category from "@/models/ecom_category_info";
import { NextResponse } from "next/server";
import md5 from "md5";
import { writeFile } from "fs/promises";
import path from "path";

function convertSlug(slug) {
  let result = slug.replace(/ /g, "-");
  result = result.replace(/[^A-Za-z0-9\-]/g, "");
  result = result.replace(/-+/g, "-");
  result = result.toLowerCase();
  return result;
}

export async function POST(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const category_name = formData.get("category_name");
    let parentid = formData.get("parentid")  ||"none";
    let parentid_new =  formData.get("parentid_new") ||"none";
    const status = formData.get("status") || "Active";
    const show_on_home = formData.get("show_on_home") || "No";
    const file = formData.get("image");

    if (!category_name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let category_slug = convertSlug(category_name);
    let md5_cat_name = md5(category_slug);
    if(parentid === "none" ){
      let getparentcategory = await Category.findOne({ category_name : parentid_new });
      parentid = getparentcategory ? getparentcategory._id : "none";
    }else{
       if( parentid !== "none" ){
        let getparentcategory = await Category.findOne({ category_name : parentid_new });
        parentid = getparentcategory ? getparentcategory._id : md5_cat_name;
      }
    }
    if(parentid_new === "none" ){
      let getparentcategory = await Category.findOne({ category_name : parentid_new });
      parentid_new = getparentcategory ? getparentcategory.md5_cat_name : "none";
    }else{
       if( parentid_new !== "none" ){
        let getparentcategory = await Category.findOne({ category_name : parentid_new });
        parentid_new = getparentcategory ? getparentcategory.md5_cat_name : md5_cat_name;
      }
    }

    // Check if category already exists
    let existingCategory = await Category.findOne({
      category_slug: category_slug,
      parentid: parentid,
      parentid_new: parentid_new
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with the same slug and parent already exists" },
        { status: 400 }
      );
    }

    // Safe file processing - check if file exists and has data
    let image_url = "";
    if (file && typeof file !== "string" && file.name && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads/categories");
        
        // You might want to create the directory if it doesn't exist
        // const fs = require('fs');
        // if (!fs.existsSync(uploadDir)) {
        //   fs.mkdirSync(uploadDir, { recursive: true });
        // }
        
        const filename = `${Date.now()}-${file.name}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        image_url = `/uploads/categories/${filename}`; // Use relative path instead of localhost
      } catch (fileError) {
        console.error("Error processing image file:", fileError);
      }
    }

    // Handle navImage upload
    let nav_image_url = "";
    const navFile = formData.get("navImage");
    if (navFile && typeof navFile !== "string" && navFile.name && navFile.size > 0) {
      try {
        const bytes = await navFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public/uploads/categories");
        const filename = `${Date.now()}-nav-${navFile.name}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        nav_image_url = `/uploads/categories/${filename}`;
      } catch (fileError) {
        console.error("Error processing nav image file:", fileError);
      }
    }

    // Create category
    const newCategory = new Category({
      category_name,
      category_slug,
      md5_cat_name,
      parentid,
      parentid_new,
      status,
      show_on_home,
      image: image_url,
      navImage: nav_image_url,
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