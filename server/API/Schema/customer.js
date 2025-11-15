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

// Indexes for query optimization
customerSchema.index({ uid: 1, cphone_number: 1 }, { unique: true });
customerSchema.index({ uid: 1, status: 1 }); // For filtering active customers by user
customerSchema.index({ uid: 1, delivery_sequence_number: 1 }); // For delivery ordering
customerSchema.index({ cphone_number: 1 }); // For phone number lookups
customerSchema.index({ email: 1 }); // For email lookups
customerSchema.index({ createdAt: -1 }); // For recent customers sorting
customerSchema.index({ uid: 1, createdAt: -1 }); // Compound index for user's recent customers

export default mongoose.model("Customer", customerSchema);
