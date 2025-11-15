import { redisHelper, isRedisConnected } from "./redisClient.js";

/**
 * Cache key generators for different resources
 */
export const cacheKeys = {
  // Customer keys
  customer: (userId, customerId = "*") =>
    `cache:customer:${userId}:${customerId}`,
  customerList: (userId) => `cache:customers:${userId}`,
  customerStats: (userId) => `cache:customer:stats:${userId}`,

  // Customer Entry keys
  customerEntry: (userId, entryId = "*") => `cache:entry:${userId}:${entryId}`,
  customerEntries: (userId, customerId = "*") =>
    `cache:entries:${userId}:${customerId}`,
  todayEntries: (userId) => `cache:entries:today:${userId}`,
  dashboardData: (userId) => `cache:dashboard:${userId}`,

  // Payment keys
  payment: (userId, paymentId = "*") => `cache:payment:${userId}:${paymentId}`,
  payments: (userId, customerId = "*") =>
    `cache:payments:${userId}:${customerId}`,
  paymentStats: (userId) => `cache:payment:stats:${userId}`,

  // Party Order keys
  partyOrder: (userId, orderId = "*") =>
    `cache:partyorder:${userId}:${orderId}`,
  partyOrders: (userId) => `cache:partyorders:${userId}`,

  // Stats keys
  stats: (userId, type = "*") => `cache:stats:${userId}:${type}`,
  adminStats: (type = "*") => `cache:admin:stats:${type}`,

  // User keys
  user: (userId) => `cache:user:${userId}`,
  userSettings: (userId) => `cache:settings:${userId}`,

  // Shop keys
  shop: (userId) => `cache:shop:${userId}`,

  // Activity Log keys
  activityLog: (userId, page = "*") => `cache:activity:${userId}:${page}`,

  // Invoice keys
  invoice: (customerId, month = "*") => `cache:invoice:${customerId}:${month}`,
};

/**
 * Cache middleware - Caches GET requests
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key
 */
export const cacheMiddleware = (ttl, keyGenerator) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not connected
    if (!isRedisConnected()) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator(req);

      // Try to get cached data
      const cachedData = await redisHelper.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json function to cache the response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          redisHelper.set(cacheKey, data, ttl).catch((err) => {
            console.error(
              `❌ Error caching data for key "${cacheKey}":`,
              err.message
            );
          });
        }

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("❌ Cache middleware error:", error.message);
      next();
    }
  };
};

/**
 * Invalidate cache middleware - Invalidates cache on POST, PUT, DELETE
 * @param {function|string|array} keyPatternGenerator - Function, string, or array of patterns
 */
export const invalidateCacheMiddleware = (keyPatternGenerator) => {
  return async (req, res, next) => {
    // Skip if Redis is not connected
    if (!isRedisConnected()) {
      return next();
    }

    // Store original json function
    const originalJson = res.json.bind(res);

    // Override json function to invalidate cache BEFORE sending response
    res.json = async function (data) {
      // Only invalidate on successful mutations (not errors)
      if (
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        data?.status !== "error"
      ) {
        try {
          let patterns = [];

          // Handle different input types
          if (typeof keyPatternGenerator === "function") {
            const result = keyPatternGenerator(req);
            patterns = Array.isArray(result) ? result : [result];
          } else if (Array.isArray(keyPatternGenerator)) {
            patterns = keyPatternGenerator;
          } else {
            patterns = [keyPatternGenerator];
          }

          // Invalidate all patterns synchronously BEFORE responding
          const invalidationPromises = patterns.map((pattern) =>
            redisHelper.delPattern(pattern).catch((err) => {
              console.error(
                `❌ Error invalidating cache for pattern "${pattern}":`,
                err.message
              );
              return 0;
            })
          );

          // Wait for all invalidations to complete
          await Promise.all(invalidationPromises);
        } catch (err) {
          console.error("❌ Error in invalidate middleware:", err.message);
        }
      }

      // Call original json function AFTER cache is invalidated
      return originalJson(data);
    };

    next();
  };
};

/**
 * Manual cache invalidation helper
 */
export const invalidateCache = async (keyPattern) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const deletedCount = await redisHelper.delPattern(keyPattern);
    return deletedCount > 0;
  } catch (error) {
    console.error(
      `❌ Error invalidating cache for pattern "${keyPattern}":`,
      error.message
    );
    return false;
  }
};

/**
 * Cache utility functions
 */
export const cacheUtils = {
  /**
   * Get or set cached data
   */
  async getOrSet(key, fetcher, ttl) {
    if (!isRedisConnected()) {
      return await fetcher();
    }

    try {
      // Try to get from cache
      const cached = await redisHelper.get(key);
      if (cached) {
        console.log(`✅ Cache HIT: ${key}`);
        return cached;
      }

      console.log(`❌ Cache MISS: ${key}`);

      // Fetch data
      const data = await fetcher();

      // Cache the result
      if (data) {
        await redisHelper.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      console.error(`❌ getOrSet error for key "${key}":`, error.message);
      return await fetcher();
    }
  },

  /**
   * Invalidate multiple patterns at once
   */
  async invalidateMultiple(patterns) {
    if (!isRedisConnected()) {
      return false;
    }

    try {
      const promises = patterns.map((pattern) =>
        redisHelper.delPattern(pattern)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("❌ Error invalidating multiple patterns:", error.message);
      return false;
    }
  },

  /**
   * Warm up cache with data
   */
  async warmup(key, fetcher, ttl) {
    if (!isRedisConnected()) {
      return false;
    }

    try {
      const data = await fetcher();
      if (data) {
        await redisHelper.set(key, data, ttl);
        console.log(`🔥 Cache warmed up: ${key}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Warmup error for key "${key}":`, error.message);
      return false;
    }
  },
};

export default cacheMiddleware;
