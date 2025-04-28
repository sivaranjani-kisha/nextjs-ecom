import dbConnect from "@/lib/db";
import DesignBanner from "@/models/ecom_banner_info";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req) {
  try {
    await dbConnect();

    const validBannerTypes = ["topbanner", "flashsale", "categorybanner"];
    const formData = await req.formData();
    
    // Extract all fields
    const title = formData.get("title");
    const bannerType = formData.get("bannerType");
    const redirectUrl = formData.get("redirectUrl");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const status = formData.get("status");
    const bgImage = formData.get("bgImage");
    const bannerImage = formData.get("bannerImage") ?? null;

    // Validate required fields
    const errors = {};
    
    if (!validBannerTypes.includes(bannerType)) {
      errors.bannerType = "Invalid banner type selected";
    }
const typecheck = ""
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      errors.endDate = "End date must be after the start date";
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "designs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let bgImageUrl = '';
    let bannerImageUrl = '';
    let categoryImages = [];

    if (bannerType === 'categorybanner') {
      // Handle category banner images
      for (let i = 1; i <= 4; i++) {
        const image = formData.get(`image${i}`);
        const redirectUrl = formData.get(`redirectUrl${i}`);

        if (!image || !redirectUrl) {
          errors[`image${i}`] = `Image ${i} and redirect URL are required`;
          continue;
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(image.name);
        const filename = `category-${i}-${uniqueSuffix}${ext}`;
        await writeFile(path.join(uploadDir, filename), buffer);

        categoryImages.push({
          imageUrl: `/uploads/designs/${filename}`,
          redirectUrl
        });
      }

      if (categoryImages.length !== 4) {
        errors.categoryImages = "Exactly 4 images with redirect URLs are required";
      }
    } else {
      // Handle regular banners
      if (!bgImage) errors.bgImage = "Background image is required";
      if (!redirectUrl) errors.redirectUrl = "Redirect URL is required";

      if (bgImage) {
        const bgBuffer = Buffer.from(await bgImage.arrayBuffer());
        const bgUniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const bgExt = path.extname(bgImage.name);
        const bgFilename = `${bannerType}-bg-${bgUniqueSuffix}${bgExt}`;
        await writeFile(path.join(uploadDir, bgFilename), bgBuffer);
        bgImageUrl = `/uploads/designs/${bgFilename}`;
      }

      if (bannerImage && bannerImage !== "null") {
        const bannerBuffer = Buffer.from(await bannerImage.arrayBuffer());
        const bannerUniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const bannerExt = path.extname(bannerImage.name);
        const bannerFilename = `${bannerType}-banner-${bannerUniqueSuffix}${bannerExt}`;
        await writeFile(path.join(uploadDir, bannerFilename), bannerBuffer);
        bannerImageUrl = `/uploads/designs/${bannerFilename}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Create new banner
    const newBanner = new DesignBanner({
      title,
      bannerType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      createdAt: new Date(),
      ...(bannerType === 'categorybanner' ? 
        { categoryImages } : 
        { bgImageUrl, bannerImageUrl, redirectUrl })
    });

    await newBanner.save();

    return NextResponse.json(
      { message: "Banner created successfully", banner: newBanner }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding banner:", error);
    return NextResponse.json(
      { 
        error: "Failed to add banner", 
        details: error.message,
        // ...(error.errors && { errors: Object.fromEntries(
        //   Object.entries(error.errors).map(([key, val]) => [key, val.message])
        // }) 
      },
      { status: 500 }
    );
  }
}