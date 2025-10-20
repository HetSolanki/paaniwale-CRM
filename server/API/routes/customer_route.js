import { Router as Route } from "express";
import { body } from "express-validator";
import {
  getAllCustomer,
  getOneCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadFile,
  getallCustomerAdmin,
  getCustomerStats,
} from "../Handlers/Customer.js";
import { inputErrorHandler } from "../Module/middleware.js";
import cors from "cors";
import { protect } from "../Module/auth.js";

const router = Route();
router.use(cors());
// Get All the Customers
router.get("/customerall", protect, getAllCustomer);
router.get("/customeralladmin", protect, getallCustomerAdmin);

// Get Customer Stats
router.get("/stats", protect, getCustomerStats);

// Get Customer by it's id
router.get("/customer/:id", getOneCustomer);

// Create Customer
router.post(
  "/customer",
  [
    body("cname").exists(),
    body("cphone_number").exists(),
    body("caddress").exists(),
    body("bottle_price").exists(),
    body("delivery_sequence_number").exists(),
  ],
  inputErrorHandler,
  createCustomer
);

// Update Customer
router.put(
  "/customer/:id",
  [
    body("cname").optional(),
    body("cphone_number").optional(),
    body("caddress").optional(),
    body("bottle_price").optional(),
    body("delivery_sequence_number").optional(),
  ],
  inputErrorHandler,
  updateCustomer
);

// Delete Customer
router.delete("/customer/:id", deleteCustomer);

router.get("/uploadfile/Dhandha/:publicid", uploadFile);

export default router;
