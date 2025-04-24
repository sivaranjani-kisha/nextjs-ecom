import mongoose from "mongoose";

const DesignBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    
    trim: true,
    
  },
  bannerType: {
    type: String,
    required: [true, "Banner type is required"],
    enum: {
      values: ["topbanner", "flashsale"],
      message: "Invalid banner type"
    }
  },
  bgImageUrl: {
    type: String,
    required: [true, "Background image URL is required"]
  },
  bannerImageUrl: {
    type: String,
   
  },
  redirectUrl: {
    type: String,
    required: [true, "Redirect URL is required"],
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS"
    ]
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"]
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: "End date must be after start date"
    }
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "inactive"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtuals for image dimensions based on banner type
DesignBannerSchema.virtual('bgImageDimensions').get(function() {
  return this.bannerType === 'topbanner' 
    ? { width: 1680, height: 499 }
    : { width: 828, height: 250 };
});

DesignBannerSchema.virtual('bannerImageDimensions').get(function() {
  return this.bannerType === 'topbanner' 
    ? { width: 291, height: 147 }
    : { width: 285, height: 173 };
});

// Create index for better query performance
DesignBannerSchema.index({ bannerType: 1, status: 1 });

// Middleware to validate dates before saving
DesignBannerSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    const err = new Error("End date must be after start date");
    next(err);
  } else {
    next();
  }
});

// Check if model exists before creating it
let DesignBanner;
try {
  DesignBanner = mongoose.model("ecom_designbanner_info");
} catch {
  DesignBanner = mongoose.model("ecom_designbanner_info", DesignBannerSchema);
}

export default DesignBanner;