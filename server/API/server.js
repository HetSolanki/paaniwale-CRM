import express from "express";
import user_api from "./routes/user_route.js";
import customer_api from "./routes/customer_route.js";
import customerentry_api from "./routes/customerEntry_route.js";
import shop_api from "./routes/shop_route.js";
import payment_link_api from "./routes/payment_link_route.js";
import paymentdetails_api from "./routes/paymentdetails_route.js";
import otpRoutes from "./routes/otpRoutes.js";
import stats_api from "./routes/stats_route.js";
import inquiry_api from "./routes/inquiry_route.js";
import cors from "cors";
import process from "process";

const app = express();

// Set request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({
      status: "error",
      message: "Request timeout",
    });
  });
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration for both development and production
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://paaniwale.hetsolanki.tech",
    "https://paaniwale.dhruvprajapati.tech",
    "https://www.paaniwale.hetsolanki.tech",
    "https://api.paaniwale.hetsolanki.tech",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Paani Wale API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

app.use("/api/auth", user_api);
app.use("/api/customers", customer_api);
app.use("/api/customerentry", customerentry_api);
app.use("/api/shop", shop_api);
app.use("/api/paymentlink", payment_link_api);
app.use("/api/paymentdetails", paymentdetails_api);
app.use("/api/otp", otpRoutes);
app.use("/api/stats", stats_api);
app.use("/api/inquiry", inquiry_api);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message });
});

export default app;
