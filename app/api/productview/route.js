import dbConnect from "@/lib/db";
import ProductView from "@/models/productView";

export async function GET() {
  await dbConnect();

  try {
    const productViews = await ProductView.find({})
      .populate("category", "category_name")
    ;

    return new Response(
      JSON.stringify({ success: true, data: productViews }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching productViews:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server Error" }),
      { status: 500 }
    );
  }
}
