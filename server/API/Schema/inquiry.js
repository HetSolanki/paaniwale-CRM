import mongoose from "mongoose";

const inquirySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    inquiryType: {
      type: String,
      enum: ["general", "sales", "support", "demo", "pricing", "partnership"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "resolved", "closed"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["website", "referral", "social_media", "advertisement", "other"],
      default: "website",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
inquirySchema.index({ email: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ inquiryType: 1 });
inquirySchema.index({ createdAt: -1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
