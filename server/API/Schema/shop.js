import mongoose from "mongoose";

export const shopSchema = new mongoose.Schema({
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
});

export default mongoose.model("Shop", shopSchema);
