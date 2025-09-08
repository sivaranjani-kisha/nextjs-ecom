// import dbConnect from "@/lib/db";
// import Category from "@/models/ecom_category_info";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await dbConnect();
//      const categories = await Category.find().sort({ position: 1 });
//     //const categories = await Category.find();
//     return NextResponse.json(categories, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
//   }
// }
// app/api/categories/get/route.js
// import dbConnect from "@/lib/db";
// import Category from "@/models/ecom_category_info";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await dbConnect();
//     // Get categories sorted by position
//     const categories = await Category.find().sort({ position: 1 });
//     return NextResponse.json(categories, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
//   }
// }
import dbConnect from "@/lib/db";
import Category from "@/models/ecom_category_info";
import Product from "@/models/product";
import Brand from "@/models/ecom_brand_info";
import { NextResponse } from "next/server";

async function getDescendantCategoryIds(categoryId) {
  const children = await Category.find({ parentid: categoryId });
  let ids = [categoryId]; // include self

  for (const child of children) {
    const childIds = await getDescendantCategoryIds(child._id);
    ids = ids.concat(childIds);
  }

  return ids;
}

export async function GET() {
  try {
    await dbConnect();

    // Step 1: Get top-level categories sorted by position
    const categories = await Category.find().sort({ position: 1 });

    // Step 2: For each category, get products and related brand details
    const categoriesWithProducts = await Promise.all(
      categories.map(async (cat) => {
        // ✅ Get all descendant categories (including itself)
        const categoryIds = await getDescendantCategoryIds(cat._id);

        // ✅ Fetch products under this category and its children
        const products = await Product.find({ category: { $in: categoryIds } });

        //✅ Collect unique brand IDs
        const { Types } = require('mongoose');

        const brandIds = [...new Set(
          products
            .map((p) => p.brand?.toString())
            .filter(brandId => brandId && Types.ObjectId.isValid(brandId))
        )];

        // ✅ Fetch brand details
        const brands = brandIds.length > 0  ? await Brand.find({ _id: { $in: brandIds } }) : [];
        return {
          ...cat.toObject(),
          brands,
        };
      })
    );

    return NextResponse.json(categoriesWithProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories with products and brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
