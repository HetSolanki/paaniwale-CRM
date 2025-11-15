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

// Indexes for query optimization
customerEntrySchema.index({ cid: 1, delivery_date: -1 }); // For customer's delivery history
customerEntrySchema.index({ uid: 1, delivery_date: -1 }); // For user's entries by date
customerEntrySchema.index({ uid: 1, delivery_status: 1, delivery_date: -1 }); // For filtering by status
customerEntrySchema.index({ delivery_date: -1 }); // For date-based queries
customerEntrySchema.index({ createdAt: -1 }); // For recent entries
customerEntrySchema.index({ uid: 1, createdAt: -1 }); // For user's recent entries
customerEntrySchema.index({ cid: 1, createdAt: -1 }); // For customer's recent entries

export default mongoose.models.CustomerEntry ||
  mongoose.model("CustomerEntry", customerEntrySchema);
