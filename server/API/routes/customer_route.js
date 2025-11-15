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
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
  cacheKeys,
} from "../Module/cacheMiddleware.js";
import { CACHE_TTL } from "../Module/redisClient.js";

const router = Route();
router.use(cors());

// Get All the Customers - Cached for 5 minutes
router.get(
  "/customerall",
  protect,
  cacheMiddleware(CACHE_TTL.MEDIUM, (req) =>
    cacheKeys.customerList(req.user.id)
  ),
  getAllCustomer
);

// Get All Customers Admin - Cached for 2 minutes (frequent updates)
router.get(
  "/customeralladmin",
  protect,
  cacheMiddleware(
    CACHE_TTL.SHORT * 2, // 2 minutes
    () => `cache:customers:admin:all`
  ),
  getallCustomerAdmin
);

// Get Customer Stats - Cached for 5 minutes
router.get(
  "/stats",
  protect,
  cacheMiddleware(CACHE_TTL.MEDIUM, (req) =>
    cacheKeys.customerStats(req.user.id)
  ),
  getCustomerStats
);

// Get Customer by id - Cached for 5 minutes
router.get(
  "/customer/:id",
  cacheMiddleware(CACHE_TTL.MEDIUM, (req) =>
    cacheKeys.customer(req.user?.id || "guest", req.params.id)
  ),
  getOneCustomer
);

// Create Customer - Invalidate all customer-related cache after creation
router.post(
  "/customer",
  protect,
  [
    body("cname").exists(),
    body("cphone_number").exists(),
    body("caddress").exists(),
    body("bottle_price").exists(),
    body("delivery_sequence_number").exists(),
  ],
  inputErrorHandler,
  invalidateCacheMiddleware((req) => [
    `cache:customer:${req.user.id}:*`,
    `cache:customers:${req.user.id}`,
    `cache:customer:stats:${req.user.id}`,
    `cache:customers:admin:all`,
  ]),
  createCustomer
);

// Update Customer - Invalidate all customer-related cache after update
router.put(
  "/customer/:id",
  protect,
  [
    body("cname").optional(),
    body("cphone_number").optional(),
    body("caddress").optional(),
    body("bottle_price").optional(),
    body("delivery_sequence_number").optional(),
  ],
  inputErrorHandler,
  invalidateCacheMiddleware((req) => [
    `cache:customer:${req.user.id}:*`,
    `cache:customers:${req.user.id}`,
    `cache:customer:stats:${req.user.id}`,
    `cache:customers:admin:all`,
  ]),
  updateCustomer
);

// Delete Customer - Invalidate all customer-related cache after deletion
router.delete(
  "/customer/:id",
  protect,
  invalidateCacheMiddleware((req) => [
    `cache:customer:${req.user.id}:*`,
    `cache:customers:${req.user.id}`,
    `cache:customer:stats:${req.user.id}`,
    `cache:customers:admin:all`,
  ]),
  deleteCustomer
);

router.get("/uploadfile/Dhandha/:publicid", uploadFile);

export default router;
