import dbConnect from "@/lib/db";
import DesignBanner from "@/models/ecom_banner_info";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();

    // Get query parameters from URL
    const { searchParams } = new URL(req.url);
    const bannerType = searchParams.get('bannerType');
    const status = searchParams.get('status');
    const currentDate = searchParams.get('currentDate'); // For active banners based on date range
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Build query object
    const query = {};
    
    if (bannerType) {
      query.bannerType = bannerType;
    }
    
    if (status) {
      query.status = status;
    }

    // Filter for active banners within date range if currentDate provided
    if (currentDate) {
      const today = new Date(currentDate);
      query.status = 'active';
      query.startDate = { $lte: today };
      query.endDate = { $gte: today };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await DesignBanner.countDocuments(query);

    // Get banners with sorting (newest first)
    const banners = await DesignBanner.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JS objects

    // Add virtuals (image dimensions) to each banner
    const bannersWithDimensions = banners.map(banner => ({
      ...banner,
      bgImageDimensions: banner.bannerType === 'topbanner' 
        ? { width: 1680, height: 499 } 
        : { width: 828, height: 250 },
      bannerImageDimensions: banner.bannerType === 'topbanner'
        ? { width: 291, height: 147 }
        : { width: 285, height: 173 }
    }));

    return NextResponse.json({
      success: true,
      data: bannersWithDimensions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching design banners:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch banners",
        details: error.message 
      },
      { status: 500 }
    );
  }
}