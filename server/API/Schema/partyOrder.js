import mongoose from "mongoose";

const partyOrderSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  party_name: {
    type: String,
    required: true,
  },
  party_phone: {
    type: String,
    required: true,
  },
  party_address: {
    type: String,
    required: true,
  },
  party_location: {
    type: String,
    default: "",
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  cold_bottle_quantity: {
    type: Number,
    default: 0,
  },
  cold_bottle_price: {
    type: Number,
    default: 0,
  },
  normal_bottle_quantity: {
    type: Number,
    default: 0,
  },
  normal_bottle_price: {
    type: Number,
    default: 0,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  delivery_date: {
    type: Date,
    required: true,
  },
  event_type: {
    type: String,
    enum: ["Marriage", "Function", "Party", "Corporate Event", "Other"],
    default: "Other",
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
    default: "Pending",
  },
  notes: {
    type: String,
    default: "",
  },
  invoice_sent: {
    type: Boolean,
    default: false,
  },
  payment_link: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

partyOrderSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for query optimization
partyOrderSchema.index({ uid: 1, order_date: -1 }); // For user's orders by date
partyOrderSchema.index({ uid: 1, status: 1 }); // For filtering by status
partyOrderSchema.index({ uid: 1, delivery_date: 1 }); // For upcoming deliveries
partyOrderSchema.index({ status: 1, delivery_date: 1 }); // For pending/confirmed deliveries
partyOrderSchema.index({ party_phone: 1 }); // For phone lookups
partyOrderSchema.index({ event_type: 1 }); // For event type filtering
partyOrderSchema.index({ created_at: -1 }); // For recent orders

export default mongoose.model("PartyOrder", partyOrderSchema);
