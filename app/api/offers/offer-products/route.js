import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Offer from "@/models/ecom_offer_info";
import Product from "@/models/product";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';


const extractToken = (req) => {
  const authHeader = req.headers.get("authorization");
  return authHeader?.split(" ")[1];
};

const verifyToken = (token) => {
  if (!token) throw new Error("Authorization token required");
   try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else {
      throw new Error("Invalid token");
    }
  }
};
export async function GET(req) {
  try {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    const userId = new mongoose.Types.ObjectId(decoded.userId);
    console.log(userId);
    await connectDB();

    // Parse optional code query param
    const { searchParams } = new URL(req.url);
    const enteredCode = (searchParams.get("code") || "").trim().toLowerCase();

    // Fetch all active offers
    const offers = await Offer.find({
      fest_offer_status: "active",
    });

    if (!offers.length) {
      return NextResponse.json({
        success: false,
        hasActiveOfferProduct: false,
        message: "No active offers found"
      });
    }


    // Fetch all active users
    const activeUsers = await User.find({"_id":userId, status: "Active" }).select('_id');

    // Filter offers that have selected_users matching active users or no selected_users (available to all)
    const validOffers = offers.filter(offer => {
      if (!offer.selected_users || offer.selected_users.length === 0) {
        return true; // Offer is available to all users
      }
      return offer.selected_users.some(userId => 
        activeUsers.some(activeUser => activeUser._id.equals(userId))
      );
    });

    console.log(validOffers,activeUsers);
    if (!validOffers.length) {
      return NextResponse.json({
        success: false,
        hasActiveOfferProduct: false,
        message: "No valid offers for current users"
      });
    }

    // Get all unique product IDs from valid offers
    const productIds = [];
    validOffers.forEach(offer => {
      if (offer.offer_product && offer.offer_product.length) {
        productIds.push(...offer.offer_product);
      }
    });

    if (!productIds.length) {
      return NextResponse.json({
        success: false,
        hasActiveOfferProduct: false,
        message: "No products in offers"
      });
    }

    // Fetch products matching the offer_product IDs
    const products = await Product.find({ 
      _id: { $in: productIds },
      status: "Active" // Only fetch active products
    }).select('_id name slug price special_price images item_code');

    if (!products.length) {
      return NextResponse.json({
        success: false,
        hasActiveOfferProduct: false,
        message: "No valid products found"
      });
    }

    // Map products with their offer details
    const offerProducts = products.map(product => {
      // Find all offers that include this product
      const productOffers = validOffers.filter(offer => 
        offer.offer_product && offer.offer_product.includes(product._id.toString())
      );

      // Find the best offer (highest percentage or lowest fixed price)
      const bestOffer = productOffers.reduce((best, current) => {
        if (current.offer_type === 'percentage') {
          return (!best || current.percentage > best.percentage) ? current : best;
        } else if (current.offer_type === 'fixed' || current.offer_type === 'fixed_price') {
          return (!best || Number(current.fixed_price) < Number(best.fixed_price)) ? current : best;
        }
        return best;
      }, null);

      // Calculate final price based on best offer
      let finalPrice = product.price;
      if (bestOffer) {
        if (bestOffer.offer_type === 'percentage') {
          finalPrice = product.price * (1 - Number(bestOffer.percentage) / 100);
        } else if (bestOffer.offer_type === 'fixed' || bestOffer.offer_type === 'fixed_price') {
          finalPrice = Number(bestOffer.fixed_price);
        }
      }

      return {
        ...product.toObject(),
        price: Number(finalPrice).toFixed(2),
        special_price: product.special_price || null
      };
    });

    const hasActiveOfferProduct = offerProducts.length > 0;

    // If code is provided, validate against validOffers and return normalized coupon
    if (enteredCode) {
      const match = validOffers.find(o => String(o.offer_code || "").toLowerCase() === enteredCode);

      // Helper: normalize offer to coupon shape expected by client (based on non-zero values)
      const normalizeOffer = (offer) => {
        const pct = Number(
          offer.percentage ?? offer.percent ?? offer.discountValue ?? 0
        ) || 0;
        const fixed = Number(
          offer.fixed_price ?? offer.fixed ?? offer.amount ?? 0
        ) || 0;

        // Decide type from values
        const offer_type = pct > 0 ? "percentage" : (fixed > 0 ? "fixed_price" : "");

        return {
          offer_code: String(offer.offer_code || ""),
          offer_type,
          percentage: pct > 0 ? pct : 0,
          fixed_price: fixed > 0 ? fixed : 0,
          offer_product: Array.isArray(offer.offer_product) ? offer.offer_product.map(String) : [],
          status: "active"
        };
      };

      if (!match) {
        return NextResponse.json({
          success: true,
          hasActiveOfferProduct,
          validOffer: false,
          message: "Invalid or inactive offer code"
        });
      }

      const coupon = normalizeOffer(match);

      // If both values are zero/invalid, treat as invalid
      if ((coupon.percentage ?? 0) <= 0 && (coupon.fixed_price ?? 0) <= 0) {
        return NextResponse.json({
          success: true,
          hasActiveOfferProduct,
          validOffer: false,
          message: "Invalid discount value"
        });
      }

      return NextResponse.json({
        success: true,
        hasActiveOfferProduct,
        validOffer: true,
        coupon
      });
    }

    // Default response without code validation
    return NextResponse.json({
      success: true,
      hasActiveOfferProduct,
      data: offerProducts
    });
  } catch (err) {
    console.error("Error fetching offer products:", err);
    return NextResponse.json(
      { success: false, hasActiveOfferProduct: false, error: "Failed to fetch offer products" },
      { status: 500 }
    );
  }
}