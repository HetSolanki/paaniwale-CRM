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
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
} from "../Module/cacheMiddleware.js";
import { CACHE_TTL } from "../Module/redisClient.js";

const router = Route();
router.use(cors());

// Admin routes - all payments
router.get(
  "/all",
  protect,
  cacheMiddleware(CACHE_TTL.MEDIUM, (req) => {
    const filter = req.query.filter || "all";
    const month = req.query.month || "";
    const year = req.query.year || "";
    return `cache:payments:${req.user.id}:all:${filter}:${month}:${year}`;
  }),
  getAllPaymentEntrys
);

// Get stats
router.get(
  "/stats",
  protect,
  cacheMiddleware(
    CACHE_TTL.MEDIUM,
    (req) => `cache:payments:stats:${req.user.id}`
  ),
  async (req, res) => {
    try {
      const PaymentDetail = (await import("../Schema/PaymentDetail.js"))
        .default;
      const uid = req.user?.id;
      const query = uid && !req.user.is_admin ? { uid } : {};

      const allPayments = await PaymentDetail.find(query);
      const total = allPayments.length;
      const pending = allPayments.filter(
        (p) => p.payment_status === "pending"
      ).length;
      const approved = allPayments.filter(
        (p) =>
          p.payment_status === "approved" || p.payment_status === "completed"
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
  }
);

// Approve payment
router.patch(
  "/:id/approve",
  protect,
  invalidateCacheMiddleware((req) => [
    `cache:payments:${req.user.id}:*`,
    `cache:payments:stats:${req.user.id}`,
    `cache:paymentdetails:${req.user.id}:*`,
    `cache:dashboardData:${req.user.id}`,
  ]),
  async (req, res) => {
    try {
      const PaymentDetail = (await import("../Schema/PaymentDetail.js"))
        .default;
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
  }
);

// Reject payment
router.patch(
  "/:id/reject",
  protect,
  invalidateCacheMiddleware((req) => [
    `cache:payments:${req.user.id}:*`,
    `cache:payments:stats:${req.user.id}`,
    `cache:paymentdetails:${req.user.id}:*`,
    `cache:dashboardData:${req.user.id}`,
  ]),
  async (req, res) => {
    try {
      const { reason } = req.body;
      const PaymentDetail = (await import("../Schema/PaymentDetail.js"))
        .default;
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
  }
);

// Get All the Payment Details
router.get(
  "/getallpaymentdetails/:id",
  protect,
  cacheMiddleware(
    CACHE_TTL.MEDIUM,
    (req) => `cache:paymentdetails:${req.user.id}:${req.params.id}`
  ),
  getAllPaymentDetails
);

// Get All the Payment Details
router.get(
  "/getallpaymentdetails/",
  protect,
  cacheMiddleware(
    CACHE_TTL.MEDIUM,
    (req) => `cache:paymentdetails:${req.user.id}:all`
  ),
  getAllPaymentDetails
);

// Get All Payment Entrys
router.get(
  "/getAllPaymentEntrys/",
  protect,
  cacheMiddleware(CACHE_TTL.MEDIUM, (req) => {
    const filter = req.query.filter || "all";
    const month = req.query.month || "";
    const year = req.query.year || "";
    return `cache:payments:${req.user.id}:all:${filter}:${month}:${year}`;
  }),
  getAllPaymentEntrys
);

// Get All the Payment Details of the Current Month
router.get(
  "/getallpaymentdetailscurrentmonth",
  protect,
  cacheMiddleware(
    CACHE_TTL.SHORT,
    (req) => `cache:payments:${req.user.id}:currentmonth`
  ),
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
  invalidateCacheMiddleware((req) => [
    `cache:payments:${req.user.id}:*`,
    `cache:payments:stats:${req.user.id}`,
    `cache:paymentdetails:${req.user.id}:*`,
    `cache:dashboardData:${req.user.id}`,
  ]),
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
  invalidateCacheMiddleware((req) => [
    `cache:payments:${req.user.id}:*`,
    `cache:payments:stats:${req.user.id}`,
    `cache:paymentdetails:${req.user.id}:*`,
    `cache:dashboardData:${req.user.id}`,
  ]),
  updatePaymentEntry
);

// Delete Payment Details
router.delete(
  "/deletepaymentdetails/:id",
  protect,
  invalidateCacheMiddleware((req) => [
    `cache:payments:${req.user.id}:*`,
    `cache:payments:stats:${req.user.id}`,
    `cache:paymentdetails:${req.user.id}:*`,
    `cache:dashboardData:${req.user.id}`,
  ]),
  deletePaymentEntry
);

export default router;
