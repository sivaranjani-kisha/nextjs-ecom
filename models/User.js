import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  user_type: { 
    type: String, 
    enum: ["admin", "user"], // ✅ Define allowed values
    default: "user" // ✅ Set default value
  },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

export default mongoose.models.ecom_users_info || mongoose.model("ecom_users_info", UserSchema);