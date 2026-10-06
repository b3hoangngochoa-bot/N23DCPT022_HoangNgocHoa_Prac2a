const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API Quản lý Đơn hàng (MongoDB & Mongoose) - Lab 2 Nâng cao",
      contact: { name: "Dev Team", email: "dev@example.com" }
    },
    servers: [
      { url: "http://localhost:3002", description: "Development (Direct)" },
      { url: "http://localhost:3000", description: "API Gateway" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập Bearer Token lấy từ Auth Service (/api/auth/login)"
        }
      },
      schemas: {
        OrderItem: {
          type: "object",
          required: ["productId", "productName", "price", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            productName: { type: "string", example: "iPhone 15 Pro" },
            price: { type: "number", example: 27990000 },
            quantity: { type: "integer", minimum: 1, example: 1 },
            subtotal: { type: "number", example: 27990000 }
          }
        },
        ShippingAddress: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Đường 3/2" },
            city: { type: "string", example: "TP. Hồ Chí Minh" },
            district: { type: "string", example: "Quận 10" },
            note: { type: "string", example: "Giao giờ hành chính" }
          }
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6701f45c71..." },
            orderCode: { type: "string", example: "ORD-20261006-0001" },
            customerId: { type: "integer", example: 3 },
            customerName: { type: "string", example: "Hoang Hoa" },
            customerEmail: { type: "string", example: "hoanghoa2026@gmail.com" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" }
            },
            totalAmount: { type: "number", example: 27990000 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
              example: "pending"
            },
            shippingAddress: { $ref: "#/components/schemas/ShippingAddress" },
            note: { type: "string", example: "Giao cẩn thận" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        CreateOrderRequest: {
          type: "object",
          required: ["customerId", "customerName", "customerEmail", "items"],
          properties: {
            customerId: { type: "integer", example: 3 },
            customerName: { type: "string", example: "Hoang Hoa" },
            customerEmail: { type: "string", example: "hoanghoa2026@gmail.com" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "productName", "price", "quantity"],
                properties: {
                  productId: { type: "integer", example: 1 },
                  productName: { type: "string", example: "iPhone 15 Pro" },
                  price: { type: "number", example: 27990000 },
                  quantity: { type: "integer", example: 1 }
                }
              }
            },
            shippingAddress: { $ref: "#/components/schemas/ShippingAddress" },
            note: { type: "string", example: "Giao giờ hành chính" }
          }
        },
        UpdateStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
              example: "confirmed"
            }
          }
        },
        PaginatedOrders: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Order" }
            },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer", example: 1 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                totalPages: { type: "integer", example: 1 }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);
