import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // Business Settings
    business_name: {
      type: String,
    },
    business_email: {
      type: String,
    },
    business_phone: {
      type: String,
    },
    business_address: {
      type: String,
    },
    currency: {
      type: String,
      default: "INR",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    // Email Settings
    smtp_host: {
      type: String,
    },
    smtp_port: {
      type: Number,
    },
    smtp_username: {
      type: String,
    },
    smtp_password: {
      type: String,
    },
    smtp_from_email: {
      type: String,
    },
    smtp_from_name: {
      type: String,
    },

    // WhatsApp Settings
    whatsapp_api_key: {
      type: String,
    },
    whatsapp_phone_number: {
      type: String,
    },
    whatsapp_notifications_enabled: {
      type: Boolean,
      default: false,
    },

    // Payment Gateway Settings
    razorpay_key_id: {
      type: String,
    },
    razorpay_key_secret: {
      type: String,
    },
    razorpay_enabled: {
      type: Boolean,
      default: false,
    },

    // Notification Settings
    email_notifications: {
      new_order: { type: Boolean, default: true },
      payment_received: { type: Boolean, default: true },
      low_stock: { type: Boolean, default: true },
      new_inquiry: { type: Boolean, default: true },
    },
    sms_notifications: {
      new_order: { type: Boolean, default: false },
      payment_received: { type: Boolean, default: false },
    },

    // Invoice Settings
    invoice_prefix: {
      type: String,
      default: "INV",
    },
    invoice_footer: {
      type: String,
    },
    tax_enabled: {
      type: Boolean,
      default: false,
    },
    tax_percentage: {
      type: Number,
      default: 0,
    },

    // Other Settings
    default_bottle_price: {
      type: Number,
      default: 20,
    },
    low_stock_threshold: {
      type: Number,
      default: 10,
    },

    // Auto Invoice Settings
    auto_invoice_enabled: {
      type: Boolean,
      default: false,
    },
    auto_invoice_day: {
      type: Number,
      default: 1, // Day of month (1-31)
      min: 1,
      max: 31,
    },
    auto_invoice_time: {
      type: String,
      default: "09:00", // HH:MM format (24-hour)
    },
    last_auto_invoice_run: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
settingsSchema.index({ uid: 1 }, { unique: true }); // One settings per user
settingsSchema.index({ auto_invoice_enabled: 1, auto_invoice_day: 1 }); // For auto invoice scheduler

export default mongoose.model("Settings", settingsSchema);
