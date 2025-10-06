import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Offer from "@/models/ecom_offer_info";
import Product from "@/models/product"; // Import Product model
import Category from "@/models/ecom_category_info"; // Import Category model

export async function PUT(req) {
  try {
    // Connect to database
    await dbConnect();

    // Parse the request body
    const requestData = await req.json();

    const {
      id,
      offer_code,
      fest_offer_status,
      notes,
      from_date,
      to_date,
      offer_product_category,
      offer_product,
      offer_category,
      offer_type,
      percentage,
      fixed_price, 
      selected_users,
      limit_enabled,
      offer_limit,
    } = requestData;

    // Validate required fields
    if (!id || !offer_code || !from_date || !to_date || !offer_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate offer type specific fields
    if (offer_type === "percentage" && !percentage) {
      return NextResponse.json(
        { success: false, error: "Percentage is required for percentage type offers" },
        { status: 400 }
      );
    }

    if (offer_type === "fixed_price" && !fixed_price) {
      return NextResponse.json(
        { success: false, error: "Fixed price is required for fixed price type offers" },
        { status: 400 }
      );
    }

    // Validate offer application target
    if (offer_product_category === "product" && (!offer_product || offer_product.length === 0)) {
      return NextResponse.json(
        { success: false, error: "At least one product must be selected" },
        { status: 400 }
      );
    }

    if (offer_product_category === "category" && (!offer_category || offer_category.length === 0)) {
      return NextResponse.json(
        { success: false, error: "At least one category must be selected" },
        { status: 400 }
      );
    }

    // Find the existing offer
    const existingOffer = await Offer.findById(id);
    if (!existingOffer) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    // If offer is applied to categories, automatically get active products from those categories
    let finalOfferProduct = offer_product || [];
    
    if (offer_product_category === "category" && offer_category && offer_category.length > 0) {
      try {
        // Get all active products from the selected categories
        const activeProducts = await Product.find({
          category: { $in: offer_category },
          status: "Active"
        }).select('_id').lean();

        // Extract product IDs
        finalOfferProduct = activeProducts.map(product => product._id.toString());
        
        console.log(`Found ${finalOfferProduct.length} active products from selected categories`);
        
      } catch (error) {
        console.error("Error fetching products from categories:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch products from selected categories" },
          { status: 500 }
        );
      }
    }

    // Update the offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        offer_code,
        fest_offer_status: fest_offer_status || "inactive",
        notes,
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        offer_product_category,
        offer_product: finalOfferProduct, // Use the populated product list
        offer_category: offer_category || [],
        selected_users: selected_users || [],
        limit_enabled: !!limit_enabled,
        offer_limit: limit_enabled ? Number(offer_limit) : null, 
        offer_type,
        percentage: offer_type === "percentage" ? percentage : null,
        fixed_price: offer_type === "fixed_price" ? fixed_price : null,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!updatedOffer) {
      return NextResponse.json(
        { success: false, error: "Failed to update offer" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Offer updated successfully",
        data: updatedOffer,
        productCount: finalOfferProduct.length // Optional: return count for debugging
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}