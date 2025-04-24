import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/ecom_category_info"; // Adjust the path based on your structure

export async function POST(req) {
    await dbConnect();

    try {
        const { categoryId } = await req.json();

        // Find the category to be deleted
        const category = await Category.findById(categoryId);
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Update the category to inactive
        await Category.findByIdAndUpdate(categoryId, { status: "Inactive" });

        // Also set all subcategories to inactive
        await Category.updateMany({ parentid: category.category_name }, { status: "Inactive" });

        return NextResponse.json({ success: true, message: "Category and subcategories set to inactive" });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
