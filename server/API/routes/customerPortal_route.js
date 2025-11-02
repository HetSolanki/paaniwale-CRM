import express from "express";
import {
  sendCustomerOTP,
  verifyCustomerOTP,
  getCustomerDashboard,
  protectCustomer,
} from "../Handlers/CustomerPortal.js";

const router = express.Router();

// Public routes
router.post("/portal/send-otp", sendCustomerOTP);
router.post("/portal/verify-otp", verifyCustomerOTP);

// Protected routes
router.get("/portal/dashboard", protectCustomer, getCustomerDashboard);

export default router;
