import express from "express";
const router = express.Router();
import {
  createPartyOrder,
  getPartyOrders,
  getPartyOrderById,
  updatePartyOrder,
  deletePartyOrder,
  updateInvoiceStatus,
} from "../Handlers/PartyOrder.js";
import { protect } from "../Module/auth.js";

// Create new party order
router.post("/create", protect, createPartyOrder);

// Get all party orders
router.get("/all", protect, getPartyOrders);

// Get single party order
router.get("/:id", protect, getPartyOrderById);

// Update party order
router.put("/update/:id", protect, updatePartyOrder);

// Delete party order
router.delete("/delete/:id", protect, deletePartyOrder);

// Update invoice sent status
router.put("/invoice/:id", protect, updateInvoiceStatus);

export default router;
