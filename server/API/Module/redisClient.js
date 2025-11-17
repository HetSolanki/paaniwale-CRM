import { createClient } from "redis";
import process from "process";

let redisClient = null;
let isConnected = false;

/**
 * Get Redis configuration (reads env at runtime)
 */
const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  console.log("🔧 Redis URL:", redisUrl);

  return {
    url: redisUrl,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error("❌ Redis: Max reconnection attempts reached");
          return new Error("Redis reconnection failed");
        }
        const delay = Math.min(retries * 100, 3000);
        console.log(
          `🔄 Redis: Reconnecting in ${delay}ms... (attempt ${retries})`
        );
        return delay;
      },
    },
    // Enable compression for large data
    legacyMode: false,
  };
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute - for frequently changing data
  MEDIUM: 300, // 5 minutes - for moderate changing data
  LONG: 900, // 15 minutes - for rarely changing data
  VERY_LONG: 3600, // 1 hour - for static data
  DAY: 86400, // 24 hours - for daily aggregates
};

/**
 * Initialize Redis client
 */
export const initializeRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  // Get config at initialization time (after env is loaded)
  const config = getRedisConfig();
  redisClient = createClient(config);

  // Error handler
  redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err.message);
    isConnected = false;
  });

  // Connection handler
  redisClient.on("connect", () => {
    console.log("🔄 Redis: Connecting...");
  });

  // Ready handler
  redisClient.on("ready", () => {
    console.log("✅ Redis: Connected and ready");
    isConnected = true;
  });

  // Reconnecting handler
  redisClient.on("reconnecting", () => {
    console.log("🔄 Redis: Reconnecting...");
    isConnected = false;
  });

  // Disconnect handler
  redisClient.on("end", () => {
    console.log("⚠️ Redis: Disconnected");
    isConnected = false;
  });

  return redisClient;
};

/**
 * Connect to Redis
 */
export const connectRedis = async () => {
  try {
    if (!redisClient) {
      initializeRedisClient();
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    return redisClient;
  } catch (error) {
    console.error("❌ Redis Connection Error:", error.message);
    console.log("⚠️ Server will continue without Redis caching");
    return null;
  }
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => {
  return isConnected && redisClient && redisClient.isOpen;
};

/**
 * Get Redis client
 */
export const getRedisClient = () => {
  return isRedisConnected() ? redisClient : null;
};

/**
 * Redis helper functions with error handling
 */
export const redisHelper = {
  /**
   * Get data from Redis cache
   */
  async get(key) {
    try {
      if (!isRedisConnected()) return null;

      const data = await redisClient.get(key);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Redis GET error for key "${key}":`, error.message);
      return null;
    }
  },

  /**
   * Set data in Redis cache with TTL
   */
  async set(key, value, ttl = CACHE_TTL.MEDIUM) {
    try {
      if (!isRedisConnected()) return false;

      const serialized = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`❌ Redis SET error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Delete a specific key
   */
  async del(key) {
    try {
      if (!isRedisConnected()) return false;

      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Redis DEL error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Delete keys matching a pattern
   */
  async delPattern(pattern) {
    try {
      if (!isRedisConnected()) return 0;

      let cursor = 0;
      let deletedCount = 0;
      const allKeys = [];

      do {
        const { cursor: newCursor, keys } = await redisClient.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

        cursor = newCursor;

        if (keys.length > 0) {
          allKeys.push(...keys);
          await redisClient.del(keys);
          deletedCount += keys.length;
        }
      } while (cursor !== 0);

      if (deletedCount > 0) {
        console.log(
          `🗑️ Redis: Deleted ${deletedCount} keys matching "${pattern}"${
            deletedCount <= 5 ? ": " + allKeys.join(", ") : ""
          }`
        );
      } else {
        console.log(
          `⚠️ Redis: No keys found matching "${pattern}" (cache was already empty or never created)`
        );
      }

      return deletedCount;
    } catch (error) {
      console.error(
        `❌ Redis DEL PATTERN error for "${pattern}":`,
        error.message
      );
      return 0;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!isRedisConnected()) return false;

      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`❌ Redis EXISTS error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Get TTL for a key
   */
  async ttl(key) {
    try {
      if (!isRedisConnected()) return -1;

      return await redisClient.ttl(key);
    } catch (error) {
      console.error(`❌ Redis TTL error for key "${key}":`, error.message);
      return -1;
    }
  },

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern) {
    try {
      if (!isRedisConnected()) return [];

      const keys = [];
      let cursor = 0;

      do {
        const { cursor: newCursor, keys: foundKeys } = await redisClient.scan(
          cursor,
          {
            MATCH: pattern,
            COUNT: 100,
          }
        );

        cursor = newCursor;
        keys.push(...foundKeys);
      } while (cursor !== 0);

      return keys;
    } catch (error) {
      console.error(
        `❌ Redis KEYS error for pattern "${pattern}":`,
        error.message
      );
      return [];
    }
  },

  /**
   * Flush all cache (use with caution)
   */
  async flushAll() {
    try {
      if (!isRedisConnected()) return false;

      await redisClient.flushAll();
      console.log("🗑️ Redis: All cache flushed");
      return true;
    } catch (error) {
      console.error("❌ Redis FLUSH ALL error:", error.message);
      return false;
    }
  },

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      if (!isRedisConnected()) {
        return {
          connected: false,
          message: "Redis is not connected",
        };
      }

      const info = await redisClient.info("stats");
      const dbSize = await redisClient.dbSize();

      return {
        connected: true,
        totalKeys: dbSize,
        info: info,
      };
    } catch (error) {
      console.error("❌ Redis STATS error:", error.message);
      return {
        connected: false,
        error: error.message,
      };
    }
  },
};

/**
 * Graceful shutdown
 */
export const closeRedis = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log("✅ Redis: Connection closed gracefully");
    }
  } catch (error) {
    console.error("❌ Redis: Error during shutdown:", error.message);
  }
};

// Handle process termination
process.on("SIGINT", closeRedis);
process.on("SIGTERM", closeRedis);

export default redisClient;
