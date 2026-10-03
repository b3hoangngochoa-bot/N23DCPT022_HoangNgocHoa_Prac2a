const Order = require("../models/Order");

// Tạo đơn hàng mới
const createOrder = async (req, res, next) => {
  try {
    const { customerId, customerName, customerEmail, items, shippingAddress, note } = req.body;

    const processedItems = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    const totalAmount = processedItems.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await Order.create({
      customerId,
      customerName,
      customerEmail,
      items: processedItems,
      totalAmount,
      shippingAddress,
      note
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách đơn hàng của khách hàng
const getOrdersByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { customerId: parseInt(customerId) };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrdersByCustomer, updateOrderStatus };