import mongoose from "mongoose";

const FilterSchema = new mongoose.Schema({
  filter_name: { type: String, required: true },
  filter_slug: { type: String, unique: true, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  filter_group: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ecom_filter_infos || mongoose.model("ecom_filter_infos", FilterSchema);
