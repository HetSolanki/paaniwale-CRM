import express from "express";
const router = express.Router();
import {
  createActivityLog,
  getAllActivityLogs,
  getActivityStats,
  deleteOldLogs,
} from "../Handlers/ActivityLog.js";
import { protect, requireRole } from "../Module/auth.js";

// Create activity log (authenticated users)
router.post("/", protect, createActivityLog);

// Get all activity logs (admin only)
router.get("/all", protect, requireRole(true), getAllActivityLogs);

// Get activity stats (admin only)
router.get("/stats", protect, requireRole(true), getActivityStats);

// Delete old logs (admin only)
router.delete("/cleanup", protect, requireRole(true), deleteOldLogs);

export default router;
