import mongoose from "mongoose";

// const BrandSchema = new mongoose.Schema({
//   brand_name: { type: String, required: true },
//   brand_slug: { type: String, unique: true, required: true },
//   status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
//   image: { type: String },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });
const BrandSchema = new mongoose.Schema({
  brand_name: { type: String, required: true },
  brand_slug: { type: String, unique: true, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  image: { 
    type: String,
    validate: {
      validator: function(v) {
        // Simple check if it looks like a valid image path
        return /\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image path!`
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export default mongoose.models.ecom_brand_infos || mongoose.model("ecom_brand_infos", BrandSchema);
