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

// Indexes for query optimization
inquirySchema.index({ email: 1 });
inquirySchema.index({ phone: 1 });
inquirySchema.index({ status: 1, createdAt: -1 }); // For status filtering with date
inquirySchema.index({ inquiryType: 1 });
inquirySchema.index({ priority: 1, status: 1 }); // For priority-based queries
inquirySchema.index({ createdAt: -1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
