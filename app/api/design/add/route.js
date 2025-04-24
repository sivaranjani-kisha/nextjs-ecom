import dbConnect from "@/lib/db";
import DesignBanner from "@/models/ecom_banner_info"; // Updated model import
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req) {
  try {
    await dbConnect();

    // Define valid banner types
    const validBannerTypes = ["topbanner", "flashsale"];

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
    
    if (!bgImage) errors.bgImage = "Background image is required";
   // if (!bannerImage) errors.bannerImage = "Banner image is required";
    if (!redirectUrl) errors.redirectUrl = "Redirect URL is required";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      errors.endDate = "End date must be after the start date";
    }
    if (!validBannerTypes.includes(bannerType)) {
      errors.bannerType = "Invalid banner type selected";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Handle file uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads", "designs");
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Upload background image
    const bgBuffer = Buffer.from(await bgImage.arrayBuffer());
    const bgUniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const bgExt = path.extname(bgImage.name);
    const bgFilename = `${bannerType}-bg-${bgUniqueSuffix}${bgExt}`;
    await writeFile(path.join(uploadDir, bgFilename), bgBuffer);
    const bgImageUrl = `/uploads/designs/${bgFilename}`;

    // Upload banner image
    let bannerImageUrl ='';
    console.log(bannerImage);
    if(bannerImage != null && bannerImage !="null" ){
      
    const bannerBuffer = Buffer.from(await bannerImage.arrayBuffer());
    const bannerUniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const bannerExt = path.extname(bannerImage.name);
    const bannerFilename = `${bannerType}-banner-${bannerUniqueSuffix}${bannerExt}`;
    await writeFile(path.join(uploadDir, bannerFilename), bannerBuffer);
    bannerImageUrl= `/uploads/designs/${bannerFilename}`;
    }
    // Create new banner in database
    const newBanner = new DesignBanner({
      title,
      bannerType,
      bgImageUrl,
      bannerImageUrl,
      redirectUrl,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      createdAt: new Date(),
    });

    await newBanner.save();

    return NextResponse.json(
      { 
        message: "Banner created successfully", 
        banner: newBanner 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding banner:", error);
    return NextResponse.json(
      { 
        error: "Failed to add banner", 
        details: error.message,
        ...(error.errors && { errors: Object.fromEntries(
          Object.entries(error.errors).map(([key, val]) => [key, val.message])
        )})
      },
      { status: 500 }
    );
  }
}