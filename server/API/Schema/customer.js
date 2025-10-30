import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    cname: {
      type: String,
      required: true,
    },
    cphone_number: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    caddress: {
      type: String,
      required: true,
    },
    bottle_price: {
      type: Number,
      required: true,
    },
    delivery_sequence_number: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    notes: {
      type: String,
    },
    phone_verification_status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

customerSchema.index({ uid: 1, cphone_number: 1 }, { unique: 1 });
export default mongoose.model("Customer", customerSchema);
