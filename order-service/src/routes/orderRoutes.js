const router = require("express").Router();
const {
  createOrder,
  getOrdersByCustomer,
  updateOrderStatus
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/customer/:customerId", getOrdersByCustomer);
router.patch("/:id/status", updateOrderStatus);
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lấy danh sách đơn hàng thành công!",
    data: []
  });
});

module.exports = router;