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
      enum: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "Received",
        "Pending",
      ],
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

// Indexes for query optimization
paymentDetailSchema.index({ cid: 1, payment_date: -1 }); // For customer's payment history
paymentDetailSchema.index({ uid: 1, payment_date: -1 }); // For user's payments by date
paymentDetailSchema.index({ uid: 1, payment_status: 1 }); // For filtering by status
paymentDetailSchema.index({ payment_status: 1, createdAt: -1 }); // For pending payments
paymentDetailSchema.index({ transaction_id: 1 }); // For transaction lookups
paymentDetailSchema.index({ approved_by: 1 }); // For approval tracking
paymentDetailSchema.index({ createdAt: -1 }); // For recent payments
paymentDetailSchema.index({ cid: 1, createdAt: -1 }); // For customer's recent payments

export default mongoose.model("PaymentDetail", paymentDetailSchema);
