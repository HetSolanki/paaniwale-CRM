import express from "express";
import {
  generateCustomerReport,
  generateRevenueReport,
  generatePaymentReport,
  generateInventoryReport,
  generateUserReport,
  generateComprehensiveReport,
  emailReport,
  scheduleReport,
} from "../Handlers/Reports.js";
import { protect, requireRole } from "../Module/auth.js";

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(requireRole(true)); // true for admin role

// Generate customer report
router.post("/customers", generateCustomerReport);

// Generate revenue report
router.post("/revenue", generateRevenueReport);

// Generate payment report
router.post("/payments", generatePaymentReport);

// Generate inventory report
router.post("/inventory", generateInventoryReport);

// Generate user report
router.post("/users", generateUserReport);

// Generate comprehensive report
router.post("/comprehensive", generateComprehensiveReport);

// Email report
router.post("/email", emailReport);

// Schedule report
router.post("/schedule", scheduleReport);

export default router;
