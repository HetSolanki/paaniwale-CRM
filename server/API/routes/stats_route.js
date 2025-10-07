import express from "express";
import {
  getClientStats,
  getInvoiceStats,
  getPaymentStats,
  getGeneralStats,
} from "../Handlers/Stats.js";

const router = express.Router();

// Get client/user statistics
router.get("/clients", getClientStats);

// Get invoice statistics
router.get("/invoices", getInvoiceStats);

// Get payment statistics
router.get("/payments", getPaymentStats);

// Get general statistics (all in one)
router.get("/general", getGeneralStats);

export default router;
