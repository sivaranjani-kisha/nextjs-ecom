import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SingleBanner from "@/models/singlebanner-two";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// ✅ Save file with 1900x400 validation
async function saveFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    throw new Error("Invalid image file. Please upload a valid image.");
  }

  if (metadata.width !== 1900 || metadata.height !== 400) {
    throw new Error(
      `Image must be exactly 1900x400 pixels. Your image is ${metadata.width}x${metadata.height} pixels.`
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "singlebanner");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = Date.now() + "-" + file.name.replace(/\s/g, "_");
  const filepath = path.join(uploadDir, filename);

  await sharp(buffer).toFile(filepath);
  return "/uploads/singlebanner/" + filename;
}

// ✅ GET: return all banners
export async function GET() {
  try {
    await dbConnect();
    const banners = await SingleBanner.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ POST: create new banner (delete existing one first)
export async function POST(req) {
  try {
    await dbConnect();
    
    // First, delete any existing banners
    const existingBanners = await SingleBanner.find({});
    for (const banner of existingBanners) {
      if (banner.banner_image) {
        const oldFile = path.join(process.cwd(), "public", banner.banner_image);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
      await SingleBanner.findByIdAndDelete(banner._id);
    }
    
    const formData = await req.formData();

    const file = formData.get("banner_image");
    const redirect_url = formData.get("redirect_url");
    const status = formData.get("status") || "Active";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }
    if (!redirect_url) {
      return NextResponse.json(
        { success: false, message: "Redirect URL is required" },
        { status: 400 }
      );
    }

    let filePath;
    try {
      filePath = await saveFile(file);
    } catch (err) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }

    const banner = await SingleBanner.create({
      banner_image: filePath,
      redirect_url,
      status,
    });

    return NextResponse.json({ success: true, banner });
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ PUT: update by id
export async function PUT(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const id = formData.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required" },
        { status: 400 }
      );
    }

    const existing = await SingleBanner.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    const updateData = { updatedAt: new Date() };

    const redirect_url = formData.get("redirect_url");
    if (redirect_url !== null) updateData.redirect_url = redirect_url;

    const status = formData.get("status");
    if (status !== null) updateData.status = status;

    const file = formData.get("banner_image");
    if (file && file.size > 0) {
      let filePath;
      try {
        filePath = await saveFile(file);
      } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
      }

      // delete old image
      if (existing.banner_image) {
        const oldFile = path.join(process.cwd(), "public", existing.banner_image);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
      updateData.banner_image = filePath;
    }

    const updated = await SingleBanner.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, banner: updated });
  } catch (err) {
    console.error("PUT ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ DELETE: delete by id
export async function DELETE(req) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required" },
        { status: 400 }
      );
    }

    const banner = await SingleBanner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    if (banner.banner_image) {
      const filePath = path.join(process.cwd(), "public", banner.banner_image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await SingleBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}