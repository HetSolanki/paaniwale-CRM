import mongoose from "mongoose";

const customerEntrySchema = new mongoose.Schema(
  {
    cid: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
    },
    uid: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    bottle_count: {
      type: Number,
      required: true,
    },
    delivery_date: {
      type: Date,
      required: true,
    },
    delivery_status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CustomerEntry", customerEntrySchema);
