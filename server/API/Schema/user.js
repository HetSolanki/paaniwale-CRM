import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    phone_number: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Bank detail fields
    branch_ifsc_code: {
      type: String,
    },
    account_number: {
      type: String,
    },
    benificiary_name: {
      type: String,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    last_login: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
userSchema.index({ phone_number: 1 }, { unique: true }); // Already unique but explicit index
userSchema.index({ email: 1 }, { unique: true, sparse: true }); // Sparse for optional emails
userSchema.index({ status: 1 }); // For filtering by status
userSchema.index({ is_admin: 1 }); // For admin queries
userSchema.index({ last_login: -1 }); // For recent activity
userSchema.index({ createdAt: -1 }); // For user registration date sorting

export default mongoose.model("User", userSchema);
