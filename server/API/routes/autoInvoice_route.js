import express from "express";
import {
  triggerAutoInvoices,
  getNextInvoiceDate,
} from "../Handlers/AutoInvoice.js";
import { protect } from "../Module/auth.js";

const router = express.Router();

// POST /api/auto-invoice/trigger - Manually trigger auto invoice
router.post("/trigger", protect, triggerAutoInvoices);

// GET /api/auto-invoice/next - Get next scheduled invoice date
router.get("/next", protect, getNextInvoiceDate);

export default router;
