const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  }
});

redis.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

redis.on("error", (err) => {
  console.warn("Redis connection warning:", err.message);
});

// Hàm tiện ích xóa toàn bộ cache của products
const clearProductsCache = async () => {
  try {
    const keys = await redis.keys("products:*");
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`Cleared ${keys.length} product cache key(s)`);
    }
  } catch (error) {
    console.warn("Lỗi khi xóa cache Redis:", error.message);
  }
};

module.exports = { redis, clearProductsCache };
