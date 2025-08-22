import { NextResponse } from 'next/server';
import { join } from 'path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import { format } from 'date-fns';
import { writeFile } from 'fs/promises';
import Product from "@/models/product";
import Category from  "@/models/ecom_category_info";
import Brand  from "@/models/ecom_brand_info";
import md5 from "md5";
import mongoose from 'mongoose';
import Filter from "@/models/ecom_filter_infos";
import ProductFilter from "@/models/ecom_productfilter_info";

export const config = {
    api: {
      bodyParser: false,
    },
  };

export async function POST(req) {
  try {
    const formData = await req.formData();
    const excelFile = formData.get('excel');
    const imagesZip = formData.get('images');
    const overviewZip = formData.get('overview');
    const updateMode = formData.get('updateMode') === 'true'; // Get update mode flag

    // Validate required files based on mode
    if (!excelFile) {
      return NextResponse.json(
        { error: 'Excel file is mandatory.' },
        { status: 400 }
      );
    }

    // Images are only required in create mode, not update mode
    if (!updateMode && !imagesZip) {
      return NextResponse.json(
        { error: 'Images ZIP is mandatory for new product uploads.' },
        { status: 400 }
      );
    }

    const allowedExtensions = [".xlsx", ".csv"];
    const fileName = excelFile.name.toLowerCase();
    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
      return NextResponse.json(
        { error: "Invalid file type. Only .xlsx and .csv files are allowed." },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Process Excel file
    const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
    const workbook = XLSX.read(excelBuffer);
    const products = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    await writeFile(join(uploadDir, `uploaded-products_${timestamp}.xlsx`), excelBuffer);

    // Process Images ZIP only if provided
    if (imagesZip) {
      const imagesBuffer = Buffer.from(await imagesZip.arrayBuffer());
      const imagesZipInstance = new AdmZip(imagesBuffer);
      const imagesPath = join(uploadDir, 'products');
      
      // Get all zip entries
      const zipEntries = imagesZipInstance.getEntries();
      
      for (const entry of zipEntries) {
        // Skip directories
        if (entry.isDirectory) continue;
      
        // Only process files (e.g., images)
        const fileName = entry.entryName.split('/').pop(); // Remove internal folders
        const filePath = join(imagesPath, fileName);
      
        // Write file
        await fs.writeFile(filePath, entry.getData());
      }
    }

    // Process Overview ZIP if exists
    if (overviewZip) {
      const overviewBuffer = Buffer.from(await overviewZip.arrayBuffer());
      const overviewZipInstance = new AdmZip(overviewBuffer);
      const overviewPath = join(uploadDir, 'overview-images');
      overviewZipInstance.extractAllTo(overviewPath, true);
    }

    console.log("products.length ", products.length);
    const validProducts = products.slice(0).filter(row => row && row.length > 0 && row[0]); // Skip header and empty rows
    console.log("Actual product count:", validProducts.length);
    
    if (!validProducts || validProducts.length === 0) {
      return NextResponse.json(
        { error: "No products found in the uploaded Excel file." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const processedProducts = [];
    const updatedProducts = [];
    const errors = [];


    // ✅ Step 1: Check for duplicate item codes in Excel (BEFORE processing)
const itemCodesInExcel = new Set();
const duplicateItemCodes = new Set();

for (let i = 1; i < validProducts.length; i++) {
  const row = validProducts[i];
  const itemCode = row[0]?.toString().trim();

  if (itemCode) {
    if (itemCodesInExcel.has(itemCode)) {
      duplicateItemCodes.add(itemCode);
    } else {
      itemCodesInExcel.add(itemCode);
    }
  }
}

if (duplicateItemCodes.size > 0) {
  return NextResponse.json(
    {
      error: `Duplicate item codes found in Excel: ${Array.from(duplicateItemCodes).join(', ')}.`
    },
    { status: 400 }
  );
}


    for (let i = 1; i < validProducts.length; i++) {
      const row = validProducts[i];
      const itemCode = row[0]?.toString().trim();
      
      if (!itemCode) {
        errors.push(`Row ${i + 1}: Item code is required.`);
        continue;
      }
      
      try {
        // Check if item code already exists in database
        const existingProduct = await Product.findOne({ item_code: itemCode });
        
        // Process category and brand
        const category = await Category.findOne({ category_name: row[3] }).select("_id");
        console.log("Fetched category:", category);

        const subCategoryName = row[4]?.toString().trim();
        let sub_category = null;
        
        if (subCategoryName) {
          // First try to find subcategory with the exact name
          sub_category = await Category.findOne({ 
            category_name: subCategoryName 
          }).select("_id");
          
          console.log(`Subcategory "${subCategoryName}" found:`, sub_category?._id || 'NOT FOUND');
          
          // If not found, try alternative approaches:
          if (!sub_category && category) {
            // Look for subcategory with this name that has the parent category
            sub_category = await Category.findOne({
              category_name: subCategoryName,
              parent_category: category._id
            }).select("_id");
            console.log(`Subcategory with parent check:`, sub_category?._id || 'NOT FOUND');
          }
        }

        const brand = await Brand.findOne({ brand_name: row[5] }).select("_id");

        // Process filters
        const size = row[6] || '';
        const star = row[7] || '';
        const filterString = `${size},${star}`;
        const filterNames = filterString.split(',')
          .map(name => name.trim())
          .filter(name => name !== '');
        
        let filterIds = [];
        let filters = [];
        if (filterNames.length > 0) {
          filters = await Filter.find({ filter_name: { $in: filterNames } });
          filterIds = filters.map(filter => filter._id.toString());
        }

        // Process images - only use new images if provided, otherwise keep existing
        let images = [row[13], row[14], row[15]].filter(img => img);
        let overviewImage = [];
        if (row[16]) overviewImage = row[16].split(',').filter(img => img);
        
        // If updating and no new images provided, keep existing images
        if (existingProduct && updateMode && images.length === 0) {
          images = existingProduct.images || [];
        }
        if (existingProduct && updateMode && overviewImage.length === 0) {
          overviewImage = existingProduct.overview_image || [];
        }
        
        let variants = [];
        if (row[18] && row[18].trim() !== "") {
          try {
            variants = JSON.parse(row[18].trim());
            if (!Array.isArray(variants)) variants = [];
          } catch (error) {
            console.error(`Error parsing variants at row ${i + 1}: ${error.message}`);
            variants = [];
          }
        }
        
        // ✅ Price & Special Price with validation
        const rawPrice = row[9]?.toString().replace(/,/g, '') || '0';
        const rawSpecialPrice = row[10]?.toString().replace(/,/g, '') || '';

        const price = parseFloat(rawPrice);
        const specialPrice = parseFloat(rawSpecialPrice);

        if (isNaN(price) || price < 0) {
          errors.push(`Row ${i + 1}: Invalid price. Must be a positive number.`);
          continue;
        }

        if (rawSpecialPrice !== '') {
          if (isNaN(specialPrice) || specialPrice < 0) {
            errors.push(`Row ${i + 1}: Invalid special price. It must be a positive number less than price.`);
            continue;
          }
        }
        
        let highlights = [];
        if (row[20] && typeof row[20] === 'string') {
          highlights = row[20].split(',').map(item => item.trim()).filter(Boolean);
        }
        
        let key_specifications = [];
        if (row[12] && typeof row[12] === 'string') {
          key_specifications = row[12].split(',');
        }
        
        // Prepare product data
        const productData = {
          item_code: itemCode,
          name: row[1],
          quantity: row[2],
          category: category?._id || null,
          sub_category: sub_category?._id || null,
          brand: brand?._id || null,
          size: size,
          star: star,
          movement: row[8],
          price: row[9],
          special_price: row[10],
          description: row[11],
          key_specifications: key_specifications,
          images: images,
          overview_image: overviewImage,
          overview_description: row[17],
          hasVariants: variants.length > 0,
          variants: variants,
          status: row[19],
          stock_status: row[2] > 0 ? "In Stock" : "Out of Stock",
          product_highlights: highlights,
          filters: filterIds,
        };

        if (existingProduct) {
          // UPDATE EXISTING PRODUCT
          if (!updateMode) {
            errors.push(`Row ${i + 1}: Item code "${itemCode}" already exists. Enable update mode to modify.`);
            continue;
          }
          
          // Update existing product
          await Product.updateOne(
            { _id: existingProduct._id },
            { $set: productData }
          );
          
          // Update product filters
          const existingProductFilters = await ProductFilter.find({ product_id: existingProduct._id });
          const existingFilterIds = existingProductFilters.map(pf => pf.filter_id.toString());

          const newFilterIds = filters.map(f => f._id.toString());

          // Remove associations not present in Excel
          await ProductFilter.deleteMany({
            product_id: existingProduct._id,
            filter_id: { $nin: newFilterIds }
          });

          // Add new associations
          const operations = newFilterIds
            .filter(id => !existingFilterIds.includes(id))
            .map(id => ({
              insertOne: {
                document: {
                  product_id: existingProduct._id,
                  filter_id: id
                }
              }
            }));

          if (operations.length > 0) {
            await ProductFilter.bulkWrite(operations, { ordered: false });
          }
          
          updatedProducts.push(existingProduct._id);
          
        } else {
          // CREATE NEW PRODUCT
          if (updateMode) {
            errors.push(`Row ${i + 1}: Item code "${itemCode}" not found. Cannot update non-existent product.`);
            continue;
          }
          
          // Create new product
          const productSlug = productData.name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim(); 
          
          productData.slug = productSlug;
          productData.md5_name = md5(productSlug);
          
          const newProduct = await Product.create(productData);
          processedProducts.push(newProduct);

          // Create product filters
          if (filterIds.length > 0) {
            await ProductFilter.insertMany(
              filterIds.map(filterId => ({
                product_id: newProduct._id,
                filter_id: filterId
              }))
            );
          }
        }
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        message: `Processed ${processedProducts.length} new products and updated ${updatedProducts.length} existing products, but encountered ${errors.length} errors.`,
        newProductsCount: processedProducts.length,
        updatedProductsCount: updatedProducts.length,
        errorCount: errors.length,
        errors: errors,
      }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({
      message: `Successfully processed ${processedProducts.length} new products and updated ${updatedProducts.length} existing products.`,
      newProductsCount: processedProducts.length,
      updatedProductsCount: updatedProducts.length,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload: ' + error.message },
      { status: 500 }
    );
  }
}