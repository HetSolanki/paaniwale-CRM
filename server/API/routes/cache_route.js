import express from "express";
import {
  getCacheStats,
  getCacheKeys,
  clearCache,
  clearAllCache,
  getCacheValue,
  cacheHealthCheck,
} from "../Handlers/CacheStats.js";
import { protect } from "../Module/auth.js";

const router = express.Router();

// Health check (no auth required)
router.get("/health", cacheHealthCheck);

// Get cache statistics (admin only)
router.get("/stats", protect, getCacheStats);

// Get cache keys by pattern (admin only)
router.get("/keys", protect, getCacheKeys);

// Get specific cache value (admin only)
router.get("/value/:key", protect, getCacheValue);

// Clear cache by pattern (admin only)
router.post("/clear", protect, clearCache);

// Clear all cache (admin only - use with caution)
router.post("/clear-all", protect, clearAllCache);

export default router;
