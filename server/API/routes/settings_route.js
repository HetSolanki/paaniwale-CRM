import { Router as Route } from "express";
import {
  getSettings,
  updateSettings,
  testSMTPConnection,
  testWhatsAppConnection,
  testRazorpayConnection,
} from "../Handlers/Settings.js";
import { protect } from "../Module/auth.js";
import cors from "cors";

const router = Route();
router.use(cors());

// Get settings
router.get("/", protect, getSettings);

// Update settings
router.put("/", protect, updateSettings);

// Test connections
router.post("/test-smtp", protect, testSMTPConnection);
router.post("/test-whatsapp", protect, testWhatsAppConnection);
router.post("/test-razorpay", protect, testRazorpayConnection);

export default router;
