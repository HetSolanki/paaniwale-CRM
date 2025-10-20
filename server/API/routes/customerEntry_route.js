import { Router as Route } from "express";
import { body } from "express-validator";
import {
  getAllCustomerEntry,
  // getOneCustomerEntry,
  createCustomerEntry,
  updateCustomerEntry,
  deleteCustomerEntry,
  getAllCustomerEntrys,
  getAllCustomerEntryCurrentMonth,
  getCustomerForPayment,
  getCustomerInvoice,
  getDashboardData,
  getAllCustomerInvoice,
  getAllCustomerEntryAdmin,
} from "../Handlers/CustomerEntry.js";
import { inputErrorHandler } from "../Module/middleware.js";
import cors from "cors";
import { protect } from "../Module/auth.js";

const router = Route();
router.use(cors());

// Get All the Customer Entry
router.get("/getallcustomerentry/:id", protect, getAllCustomerEntry);

// Get All the Customer Entry
router.get("/getallcustomerentryadmin/:id", protect, getAllCustomerEntryAdmin);

// Get All the Customer Entry
router.get("/getallcustomerentrys/", protect, getAllCustomerEntrys);

// Get All the Customers Entry of the Current Month
router.get(
  "/getallcustomerentrycurrentmonth",
  protect,
  getAllCustomerEntryCurrentMonth
);

// Get Customer Entry by it's id
// router.get("/getcustomerentry/:id", getOneCustomerEntry);

// Create Customer Entry
router.post(
  "/addcustomerentry",
  [
    body("bottle_count").exists(),
    body("delivery_date").exists(),
    body("delivery_status").exists(),
  ],
  inputErrorHandler,
  protect,
  createCustomerEntry
);

// Update Customer Entry
router.put(
  "/updatecustomerentry/:id",
  [
    body("cid").optional(),
    body("bottle_count").optional(),
    body("delivery_date").optional(),
    body("delivery_status").optional(),
  ],
  inputErrorHandler,
  protect,
  updateCustomerEntry
);

// Delete Customer Entry
router.delete("/deletecustomerentry/:id", protect, deleteCustomerEntry);

// Legacy delete route (keeping for backward compatibility)
router.delete("/removecustomerentry/:id", protect, deleteCustomerEntry);

router.get("/customersforpayment", protect, getCustomerForPayment);

router.get("/getCustomerInvoice/:id", protect, getCustomerInvoice);

router.get("/getAllCustomerInvoice", protect, getAllCustomerInvoice);

router.get("/getdashboarddata/", protect, getDashboardData);

export default router;
