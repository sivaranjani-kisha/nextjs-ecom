import mongoose from "mongoose";

const homeSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const HomeSection = mongoose.models.HomeSection || mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;