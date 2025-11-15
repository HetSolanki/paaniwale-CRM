import { redisHelper, isRedisConnected } from "../Module/redisClient.js";

/**
 * Get cache statistics
 */
export const getCacheStats = async (req, res) => {
  try {
    const stats = await redisHelper.getStats();

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get cache statistics",
      error: error.message,
    });
  }
};

/**
 * Get all cache keys
 */
export const getCacheKeys = async (req, res) => {
  try {
    const { pattern = "*" } = req.query;
    const keys = await redisHelper.keys(pattern);

    res.status(200).json({
      status: "success",
      count: keys.length,
      pattern,
      keys,
    });
  } catch (error) {
    console.error("Error getting cache keys:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get cache keys",
      error: error.message,
    });
  }
};

/**
 * Clear cache by pattern
 */
export const clearCache = async (req, res) => {
  try {
    const { pattern = "*" } = req.body;

    if (!isRedisConnected()) {
      return res.status(503).json({
        status: "error",
        message: "Redis is not connected",
      });
    }

    const deletedCount = await redisHelper.delPattern(pattern);

    res.status(200).json({
      status: "success",
      message: `Cleared ${deletedCount} cache entries`,
      pattern,
      deletedCount,
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to clear cache",
      error: error.message,
    });
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async (req, res) => {
  try {
    if (!isRedisConnected()) {
      return res.status(503).json({
        status: "error",
        message: "Redis is not connected",
      });
    }

    const success = await redisHelper.flushAll();

    if (success) {
      res.status(200).json({
        status: "success",
        message: "All cache cleared successfully",
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to clear all cache",
      });
    }
  } catch (error) {
    console.error("Error clearing all cache:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to clear all cache",
      error: error.message,
    });
  }
};

/**
 * Get cache value by key
 */
export const getCacheValue = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        status: "error",
        message: "Key is required",
      });
    }

    const value = await redisHelper.get(key);
    const ttl = await redisHelper.ttl(key);

    if (value === null) {
      return res.status(404).json({
        status: "error",
        message: "Key not found in cache",
      });
    }

    res.status(200).json({
      status: "success",
      key,
      value,
      ttl,
    });
  } catch (error) {
    console.error("Error getting cache value:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get cache value",
      error: error.message,
    });
  }
};

/**
 * Health check for Redis
 */
export const cacheHealthCheck = async (req, res) => {
  try {
    const connected = isRedisConnected();

    res.status(connected ? 200 : 503).json({
      status: connected ? "healthy" : "unhealthy",
      service: "Redis Cache",
      connected,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      service: "Redis Cache",
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
