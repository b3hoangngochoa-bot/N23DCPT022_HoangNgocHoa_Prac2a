const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const productRoutes = require("./routes/productRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

// Middleware Bảo mật & Logging
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Giao diện Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { persistAuthorization: true },
  customSiteTitle: "Product Service API Docs"
}));

// Export Spec dưới dạng JSON
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// Redirect trang chủ về Swagger UI
app.get("/", (req, res) => res.redirect("/api-docs"));

// Health Check Endpoint
app.get("/health", (req, res) => res.json({
  status: "ok",
  service: process.env.SERVICE_NAME || "product-service",
  uptime: process.uptime()
}));

// API Routes
app.use("/api/products", productRoutes);

// Global Error Handler (Luôn đặt ở cuối cùng)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;