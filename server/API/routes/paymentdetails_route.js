import { Router as Route } from "express";
import { body } from "express-validator";
import { inputErrorHandler } from "../Module/middleware.js";
import cors from "cors";
import { protect } from "../Module/auth.js";
import {
  createPaymentEntry,
  deletePaymentEntry,
  getAllPaymentDetails,
  getAllPaymentDetailsCurrentMonth,
  getAllPaymentEntrys,
  updatePaymentEntry,
} from "../Handlers/PaymentDetials.js";

const router = Route();
router.use(cors());

// Admin routes - all payments
router.get("/all", protect, getAllPaymentEntrys);

// Get stats
router.get("/stats", protect, async (req, res) => {
  try {
    const PaymentDetail = (await import("../Schema/PaymentDetail.js")).default;
    const uid = req.user?.id;
    const query = uid && !req.user.is_admin ? { uid } : {};

    const allPayments = await PaymentDetail.find(query);
    const total = allPayments.length;
    const pending = allPayments.filter(
      (p) => p.payment_status === "pending"
    ).length;
    const approved = allPayments.filter(
      (p) => p.payment_status === "approved" || p.payment_status === "completed"
    ).length;
    const rejected = allPayments.filter(
      (p) => p.payment_status === "rejected"
    ).length;
    const totalAmount = allPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    res.json({
      data: { total, pending, approved, rejected, totalAmount },
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
});

// Approve payment
router.patch("/:id/approve", protect, async (req, res) => {
  try {
    const PaymentDetail = (await import("../Schema/PaymentDetail.js")).default;
    const payment = await PaymentDetail.findByIdAndUpdate(
      req.params.id,
      {
        payment_status: "approved",
        approved_by: req.user.id,
      },
      { new: true }
    ).populate("cid");

    res.json({ data: payment, status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving payment", error: error.message });
  }
});

// Reject payment
router.patch("/:id/reject", protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const PaymentDetail = (await import("../Schema/PaymentDetail.js")).default;
    const payment = await PaymentDetail.findByIdAndUpdate(
      req.params.id,
      {
        payment_status: "rejected",
        rejection_reason: reason,
        approved_by: req.user.id,
      },
      { new: true }
    ).populate("cid");

    res.json({ data: payment, status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting payment", error: error.message });
  }
});

// Get All the Payment Details
router.get("/getallpaymentdetails/:id", protect, getAllPaymentDetails);

// Get All the Payment Details
router.get("/getallpaymentdetails/", protect, getAllPaymentDetails);

// Get All Payment Entrys
router.get("/getAllPaymentEntrys/", protect, getAllPaymentEntrys);

// Get All the Payment Details of the Current Month
router.get(
  "/getallpaymentdetailscurrentmonth",
  protect,
  getAllPaymentDetailsCurrentMonth
);

// Get Payment Details by it's id
// router.get("/getpaymentdetails/:id", getOnePaymentDetails);

// Create Payment Details
router.post(
  "/addpaymentdetails",
  [
    body("payment_date").exists(),
    body("amount").exists(),
    body("payment_status").exists(),
  ],
  inputErrorHandler,
  protect,
  createPaymentEntry
);

// Update Payment Details
router.put(
  "/updatepaymentdetails/:id",
  [
    body("payment_date").optional(),
    body("payment_amount").optional(),
    body("payment_status").optional(),
  ],
  inputErrorHandler,
  protect,
  updatePaymentEntry
);

// Delete Payment Details
router.delete("/deletepaymentdetails/:id", protect, deletePaymentEntry);

export default router;
