import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Banner from "@/models/ecom_banner_info";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
 
export async function PUT(req) {
  try {
    await dbConnect();
    const formData = await req.formData();
 
    const id = formData.get("id");
    const title = formData.get("title");
    const bannerType = formData.get("bannerType");
    const redirectUrl = formData.get("redirectUrl");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const status = formData.get("status");
    const bgImage = formData.get("bgImage");
    const bannerImage = formData.get("bannerImage");
    const existingBgImage = formData.get("existingBgImage");
    const existingBannerImage = formData.get("existingBannerImage");
 
    // Find the existing banner
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }
 
    // Initialize with existing values
    let bgImageUrl = existingBanner.bgImage;
    let bannerImageUrl = existingBanner.bannerImage;
 
    // Helper function to process image upload
    const processImageUpload = async (newImage, existingImagePath, imageType) => {
      // If no new image is provided, keep the existing one
      if (!newImage || newImage.size === 0) {
        return existingImagePath;
      }
 
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "public", "uploads", "designs");
      await mkdir(uploadDir, { recursive: true });
 
      // Delete old image if it exists
      if (existingImagePath) {
        try {
          const oldImagePath = path.join(
            process.cwd(),
            "public",
            existingImagePath.startsWith('/') ? existingImagePath.substring(1) : existingImagePath
          );
          await unlink(oldImagePath);
        } catch (err) {
          console.error(`Error deleting old ${imageType} image:`, err);
          // Don't fail the operation if old image can't be deleted
        }
      }
 
      // Generate unique filename
      const timestamp = Date.now();
      const ext = path.extname(newImage.name).toLowerCase();
      const fileName = `${imageType}_${timestamp}${ext}`;
      const relativePath = `/uploads/designs/${fileName}`;
      const absolutePath = path.join(uploadDir, fileName);
 
      // Convert image to buffer and save
      const buffer = Buffer.from(await newImage.arrayBuffer());
      await writeFile(absolutePath, buffer);
 
      return relativePath;
    };
 
    // Process background image if a new one was uploaded
    if (bgImage instanceof File && bgImage.size > 0) {
      bgImageUrl = await processImageUpload(bgImage, bgImageUrl, "bg");
    }
 
    // Process banner image if a new one was uploaded
    if (bannerImage instanceof File && bannerImage.size > 0) {
      bannerImageUrl = await processImageUpload(bannerImage, bannerImageUrl, "banner");
    }
 
    // Update the banner
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      {
        title,
        bannerType,
        redirectUrl,
        startDate,
        endDate,
        status,
        bgImage: bgImageUrl,
        bannerImage: bannerImageUrl,
        updatedAt: new Date(),
      },
      { new: true }
    );
 
    if (!updatedBanner) {
      return NextResponse.json({ error: "Failed to update banner" }, { status: 400 });
    }
 
    return NextResponse.json(
      {
        success: true,
        message: "Banner updated successfully",
        data: updatedBanner
      },
      { status: 200 }
    );
 
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      {
        error: "Failed to update banner",
        details: error.message
      },
      { status: 500 }
    );
  }
}