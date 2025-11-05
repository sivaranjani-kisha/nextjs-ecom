import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Product from "@/models/product";
import FilterGroup from '@/models/ecom_filter_group_infos';
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
        const file = formData.get('excel');

        if (!file) {
            return NextResponse.json(
                { error: 'Excel or CSV file is required.' },
                { status: 400 }
            );
        }

        const fileName = file.name.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());
        let rows = [];

        if (fileName.endsWith('.csv')) {
            const csvText = buffer.toString('utf-8');
            const workbook = XLSX.read(csvText, { type: 'string' });
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
            const workbook = XLSX.read(buffer);
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        }

        const errors = [];
        let addedCount = 0;
        let existCount = 0;

        for (let [index, row] of rows.entries()) {
            const item_code = row.item_code?.toString().trim();
            const filter_group_name = row.filter_group_name?.toString().trim();
            const filter_name = row.filter_name?.toString().trim();

            if (!filter_group_name || !filter_name) {
                errors.push({
                    row: index + 2,
                    error: "Missing filter_group_name or filter_name",
                });
                continue;
            }

            const normalizedGroupName = filter_group_name.toLowerCase();

            // ✅ Find filter group ignoring case
            let filterGroup = await FilterGroup.findOne({
                filtergroup_name: new RegExp(`^${normalizedGroupName}$`, 'i'),
            });

            if (!filterGroup) {
                const groupSlug = filter_group_name
                    .toLowerCase()
                    .replace(/[^\w\s.-]/g, '') // ✅ allow dots for groups too
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, '');

                filterGroup = await FilterGroup.create({
                    filtergroup_name: filter_group_name,
                    filtergroup_slug: groupSlug,
                    status: "Active",
                });
            }

            // ✅ Build slug that preserves dots
            const filterSlug = filter_name
                .trim()
                .toLowerCase()
                .replace(/[^\w\s.-]/g, '') // ✅ allow dots
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');

            // ✅ Check for existing filter by slug (safer)
            let existingFilter = await Filter.findOne({
                filter_group: filterGroup._id,
                filter_slug: filterSlug,
            });

            if (existingFilter) {
                existingFilter.status = "Active";
                await existingFilter.save();
            } else {
                existingFilter = await Filter.create({
                    filter_name: filter_name,
                    filter_slug: filterSlug,
                    filter_group: filterGroup._id,
                    status: "Active",
                });
            }

            const product = await Product.findOne({ item_code: item_code });

            if (!product) {
                errors.push({
                    row: index + 2,
                    error: `Product not found for item_code: ${item_code}`,
                });
                continue;
            }

            const product_id = product._id;

            const existingProductFilter = await ProductFilter.findOne({
                product_id,
                filter_id: existingFilter._id,
            });

            if (!existingProductFilter) {
                await ProductFilter.create({
                    filter_id: existingFilter._id,
                    product_id,
                });
                addedCount++;
            } else {
                existCount++;
            }
        }

        return NextResponse.json(
            {
                message: `Upload completed: ${addedCount} added, ${existCount} Product Filters Already Exist.`,
                details: errors,
            },
            { status: errors.length ? 207 : 201 }
        );

    } catch (error) {
        console.error('Bulk update error:', error);
        return NextResponse.json(
            { error: 'Bulk update error: ' + error.message },
            { status: 500 }
        );
    }
}
