import mongoose from "mongoose";

const SingleBannerSchematwo = new mongoose.Schema({
  banner_image: { type: String, required: true }, // image path under /public
  redirect_url: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.single_banners_two ||
  mongoose.model("single_banners_two", SingleBannerSchematwo);
