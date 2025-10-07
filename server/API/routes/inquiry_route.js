import express from "express";
import {
  submitInquiry,
  getAllInquiries,
  getInquiryStats,
  updateInquiryStatus,
  getInquiryById,
  getInquiriesByStatus,
  getInquiriesByType,
} from "../Handlers/Inquiry.js";
import { protect } from "../Module/auth.js";

const router = express.Router();

// Public routes
router.post("/submit", submitInquiry);

// Protected routes (Admin only)
router.get("/all", protect, getAllInquiries);
router.get("/stats", protect, getInquiryStats);
router.get("/:inquiryId", protect, getInquiryById);
router.get("/status/:status", protect, getInquiriesByStatus);
router.get("/type/:type", protect, getInquiriesByType);
router.put("/:inquiryId/status", protect, updateInquiryStatus);

export default router;
