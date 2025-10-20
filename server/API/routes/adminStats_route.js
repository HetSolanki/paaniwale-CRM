import { Router as Route } from "express";
import {
  getAllAdminStats,
  getCustomerStats,
  getCustomerEntryStats,
  getPaymentStats,
} from "../Handlers/AdminStats.js";
import { protect } from "../Module/auth.js";
import cors from "cors";

const router = Route();
router.use(cors());

// Get all admin statistics (comprehensive dashboard data)
router.get("/all", protect, getAllAdminStats);

// Get customer statistics
router.get("/customers", protect, getCustomerStats);

// Get customer entry statistics
router.get("/entries", protect, getCustomerEntryStats);

// Get payment statistics
router.get("/payments", protect, getPaymentStats);

export default router;
