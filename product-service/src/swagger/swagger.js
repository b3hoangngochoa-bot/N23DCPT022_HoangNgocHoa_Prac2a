const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Service API",
      version: "1.0.0",
      description: "API quản lý sản phẩm - Lab 2 Nâng cao",
      contact: { name: "Dev Team", email: "dev@example.com" }
    },
    servers: [
      { url: "http://localhost:3001", description: "Development" },
      { url: "http://localhost:3000", description: "API Gateway" },
      { url: "https://product-service.railway.app", description: "Production" }
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "iPhone 15 Pro" },
            price: { type: "number", example: 27990000 },
            stock: { type: "integer", example: 50 },
            description: { type: "string", example: "Mô tả sản phẩm..." },
            imageUrl: { type: "string", example: "https://..." },
            isActive: { type: "boolean", example: true },
            category: { $ref: "#/components/schemas/Category" }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Điện thoại" },
            slug: { type: "string", example: "mobile" }
          }
        },
        PaginatedProducts: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                totalPages: { type: "integer" }
              }
            }
          }
        }
      }
    }
  },
  // Tự động quét annotations từ các file routes
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);