import * as env from "dotenv";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first
const envPath = path.join(__dirname, "../../.env");
console.log("Trying to load .env from:", envPath);

const result = env.config({ path: envPath });
if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log(".env file loaded successfully");
}

// Import modules after loading environment variables
import app from "./server.js";
import { connect } from "./connect.js";
import { connectRedis } from "./Module/redisClient.js";

const port = process.env.PORT || 4000;

console.log("Environment variables loaded:");
console.log(
  "MONGO_CONNECTION:",
  process.env.MONGO_CONNECTION ? "✓ Loaded" : "✗ Missing"
);
console.log(
  "RAZORPAY_API_KEY:",
  process.env.RAZORPAY_API_KEY ? "✓ Loaded" : "✗ Missing"
);
console.log(
  "REDIS_URL:",
  process.env.REDIS_URL ? "✓ Loaded" : "✗ Missing (using default)"
);

// Connect to MongoDB and Redis
Promise.all([
  connect(process.env.MONGO_CONNECTION),
  connectRedis().catch((err) => {
    console.log(
      "⚠️ Redis connection failed, continuing without cache:",
      err.message
    );
  }),
])
  .then(() => {
    app.listen(4000, "0.0.0.0", () => {
      console.log(`🚀 Server is running on PORT:${port}`);
      console.log(`📡 http://localhost:${port}`);
      console.log(`💾 MongoDB: Connected`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
