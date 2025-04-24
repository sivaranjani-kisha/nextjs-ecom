import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  brand_name: { type: String, required: true },
  brand_slug: { type: String, unique: true, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ecom_brand_infos || mongoose.model("ecom_brand_infos", BrandSchema);
