// src/index.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));

// Rate limiting: tối đa 100 request / 15 phút / IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", gateway: true }));

// Route: /api/products -> Product Service
app.use("/api/products", createProxyMiddleware({
  target: `${process.env.PRODUCT_SERVICE_URL}/api/products`,
  changeOrigin: true,
  on: { 
    error: (err, req, res) => res.status(503).json({ message: "Product Service không khả dụng" }) 
  }
}));

// Route: /api/orders -> Order Service
app.use("/api/orders", createProxyMiddleware({
  target: `${process.env.ORDER_SERVICE_URL}/api/orders`,
  changeOrigin: true,
  on: { 
    error: (err, req, res) => res.status(503).json({ message: "Order Service không khả dụng" }) 
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));