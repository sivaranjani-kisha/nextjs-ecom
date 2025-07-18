import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import connectDB from "@/lib/db";
import Product from "@/models/product";
import Product_filter from "@/models/ecom_productfilter_info";
import md5 from "md5";

export async function PUT(req, { params }) {
  try {
    const { productId } = params; 
    const formData = await req.formData();
    const productData = JSON.parse(formData.get("product"));
    const imageFiles = formData.getAll("images");
    const overviewImageFiles = formData.getAll("overviewImages");
    const category = formData.get("category");
    const highlights = JSON.parse(formData.get("highlights") || "[]");
    let variants = JSON.parse(formData.get("variant") || "[]");
    const Filters    = productData.filters;

console.log(productData);
console.log("..............................................................");

    const slug = productData.slug;
    const md5_cat_name = md5(slug);

    await connectDB();
console.log(imageFiles);
    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    let savedImages = [];
    for (const file of imageFiles) {
      if (!file || typeof file.name !== "string") continue;
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      savedImages.push(filename);
    }

    const savedOverviewImages = [];
    for (const file of overviewImageFiles) {
      if (!file || typeof file.name !== "string") continue;
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      savedOverviewImages.push(filename);
    }

    if (productData.hasVariants) {
      for (let i = 0; i < variants.length; i++) {
        const variantImages = [];
        let imgIndex = 0;

        while (true) {
          const imageKey = `variant_${i}_image_${imgIndex}`;
          const imageFile = formData.get(imageKey);
          if (!imageFile || typeof imageFile.name !== "string") break;

          const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
          const filePath = path.join(uploadDir, filename);
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          await writeFile(filePath, buffer);

          variantImages.push(filename);
          imgIndex++;
        }

        variants[i].images = variantImages;
      }
    } else {
      variants = [];
    }

    productData.product_highlights = highlights;
    productData.variants = variants;
    productData.md5_name = md5_cat_name;

    if (productData.quantity <= 0) {
      productData.stock_status = "Out of Stock";
    }

    if(savedImages.length == 0){
      savedImages = productData.images;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...productData,
        category,
         images: savedImages,
    overview_image: savedOverviewImages,
      },
      { new: true }
      
    );


const filterIds = (Filters ?? []).filter(Boolean); // Filters = array of strings

const product_id = updatedProduct?._id;
if (product_id){

  if (filterIds.length != 0) {

    await Product_filter.deleteMany({
      product_id,
      filter_id: { $nin: filterIds },
    });

    const bulkOps = filterIds.map(filter_id => ({
      updateOne: {
        filter: { product_id, filter_id },
        update: { $setOnInsert: { product_id, filter_id } },
        upsert: true,
      },
    }));

    await Product_filter.bulkWrite(bulkOps);

  }else{
  await Product_filter.deleteMany({ product_id });
  }
}

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    updatedProduct.removalReason = "Outdated";


    return NextResponse.json(
      { message: "Product updated successfullyyyyy", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
