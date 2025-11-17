import mongoose from "mongoose";

export const shopSchema = new mongoose.Schema(
  {
    shop_name: {
      type: String,
      required: true,
    },
    shop_address: {
      type: String,
    },
    gst_number: {
      type: String,
    },
    uid: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    image_url: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
shopSchema.index({ uid: 1 }); // For user's shops
shopSchema.index({ gst_number: 1 }, { sparse: true }); // For GST lookups

export default mongoose.model("Shop", shopSchema);
