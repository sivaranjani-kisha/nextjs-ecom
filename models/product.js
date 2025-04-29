import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  md5_name : String,
  slug: String,
  item_code: String,
  price: Number,
  special_price: Number,
  quantity: Number,
  description: String,
  category: String,
  sub_category: String,
  brand: String,
  category: String,
  key_specifications : String,
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  stock_status: { type: String, enum: ["In Stock", "Out of Stock"], default: "In Stock" },
  hasVariants: { type: Boolean, default: false },
  variants: { type: Object, default: {} },
  images: { type: [String], default: [] }, 
  filter : { type: Object, default: {} },
  overview_image: { type: [String], default: [] }, 
  featured_products :{ type: Object, default: {} },
  warranty: Number,
  extended_warranty:Number,
  overviewdescription: String,
  product_highlights: {type: [String],default: [],},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
