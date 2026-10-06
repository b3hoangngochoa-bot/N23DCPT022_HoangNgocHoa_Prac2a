// src/index.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const authenticate = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors());

// Rate limiting: 100 request / 15 phút
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", gateway: true }));

// 1. Auth Service (Public)
app.use("/api/auth", createProxyMiddleware({
  target: `${process.env.AUTH_SERVICE_URL || "http://localhost:3003"}/api/auth`,
  changeOrigin: true,
  on: { 
    error: (err, req, res) => res.status(503).json({ message: "Auth Service không khả dụng" }) 
  }
}));

// 2. Product Service (Public)
app.use("/api/products", createProxyMiddleware({
  target: `${process.env.PRODUCT_SERVICE_URL || "http://localhost:3001"}/api/products`,
  changeOrigin: true,
  on: { 
    error: (err, req, res) => res.status(503).json({ message: "Product Service không khả dụng" }) 
  }
}));

// 3. Order Service (Secured)
app.use("/api/orders", authenticate, createProxyMiddleware({
  target: `${process.env.ORDER_SERVICE_URL || "http://localhost:3002"}/api/orders`,
  changeOrigin: true,
  on: { 
    error: (err, req, res) => res.status(503).json({ message: "Order Service không khả dụng" }) 
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));