const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health Check
app.get("/health", (req, res) => res.json({
  status: "ok",
  service: process.env.SERVICE_NAME || "order-service",
  uptime: process.uptime()
}));

// API Routes
app.use("/api/orders", orderRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi hệ thống Order Service"
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

module.exports = app;