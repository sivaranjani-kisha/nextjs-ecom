import mongoose from "mongoose";

const SingleBannerSchema = new mongoose.Schema({
  banner_image: { type: String, required: true }, // image path under /public
  redirect_url: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.single_banners ||
  mongoose.model("single_banners", SingleBannerSchema);
