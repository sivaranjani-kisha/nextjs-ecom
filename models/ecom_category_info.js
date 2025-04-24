import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  category_slug: { type: String, unique: true, required: true },
  md5_cat_name: { type: String, required: true },
  parentid: { type: String, default: "none" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  image: { type: String }, // Store the image URL
 // show_on_home: { type: String, enum: ["Yes", "No"], default: "No" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ecom_category_infos || mongoose.model("ecom_category_infos", CategorySchema);
