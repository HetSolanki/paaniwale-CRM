import mongoose from "mongoose";

const paymentDetailSchema = new mongoose.Schema(
  {
    cid: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
    },
    uid: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_date: {
      type: String,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    payment_method: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "bank_transfer", "other"],
      default: "cash",
    },
    transaction_id: {
      type: String,
    },
    payment_proof: {
      type: String, // URL to uploaded proof
    },
    rejection_reason: {
      type: String,
    },
    approved_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentDetail", paymentDetailSchema);
