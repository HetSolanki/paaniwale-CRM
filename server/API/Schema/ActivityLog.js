import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "user_login",
        "user_logout",
        "user_created",
        "user_updated",
        "user_deleted",
        "customer_created",
        "customer_updated",
        "customer_deleted",
        "order_created",
        "order_updated",
        "order_deleted",
        "payment_created",
        "payment_approved",
        "payment_rejected",
        "payment_updated",
        "inquiry_created",
        "inquiry_updated",
        "settings_changed",
        "export_data",
        "system_error",
        "login_failed",
        "password_changed",
        "other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ severity: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);
