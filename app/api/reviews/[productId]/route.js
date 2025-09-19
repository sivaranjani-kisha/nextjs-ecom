import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  await dbConnect();
  const { productId } = await params;

  try {
    const reviews = await Review.find({ product_id : productId, review_status: "active"})
      .populate("user_id", "name email")
      .sort({ created_date: -1 }); 
console.log(reviews);
    // Calculate avg rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.reviews_rating, 0) / reviews.length
        : 0;

    return new Response(
      JSON.stringify({
        success: true,
        reviews,
        avgRating,
        count: reviews.length,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}