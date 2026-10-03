const mongoose = require("mongoose");

// Sub-schema lưu thông tin sản phẩm trong đơn hàng
const OrderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
}, { _id: false });

// Schema chính của Order
const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, unique: true },
  customerId: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
    default: "pending"
  },
  shippingAddress: {
    street: String,
    city: String,
    district: String,
    note: String
  }
}, {
  timestamps: true,
  versionKey: false
});

// Tự động tạo mã đơn hàng trước khi lưu
OrderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await mongoose.model("Order").countDocuments();
    this.orderCode = `ORD-${date}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// Virtual: tính tổng số lượng items
OrderSchema.virtual("totalItems").get(function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", OrderSchema);