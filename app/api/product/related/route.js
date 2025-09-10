import connectDB from "@/lib/db";
import Product from "@/models/product"; 

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return new Response(JSON.stringify({ success: false, error: "Product ID is required" }), { status: 400 });
    }

    // Get the product to find its related_products
    const product = await Product.findById(productId).lean();
    if (!product) {
      return new Response(JSON.stringify({ success: false, error: "Product not found" }), { status: 404 });
    }

    if (!product.related_products || product.related_products.length === 0) {
      return new Response(JSON.stringify({ success: true, products: [] }), { status: 200 });
    }

    // Fetch related products
    const relatedProducts = await Product.find({ _id: { $in: product.related_products } });

     console.log("Fetched related products:", relatedProducts);

    return new Response(JSON.stringify({ success: true, products: relatedProducts }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
