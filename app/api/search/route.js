import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Product from "@/models/product";
import Category from "@/models/ecom_category_info";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';

  try {
    await dbConnect();
    
    // Build search filter
    const searchFilter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { item_code: { $regex: query, $options: 'i' } }
      ]
    };

    // Add category filter if specified
    if (category) {
      const categoryDoc = await Category.findOne({ category_name: category });
      if (categoryDoc) {
        searchFilter.category = categoryDoc._id;
      }
    }

    const products = await Product.find(searchFilter)
      .populate('category', 'category_name')
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch(error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}