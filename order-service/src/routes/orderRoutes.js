const router = require("express").Router();
const {
  createOrder,
  getOrdersByCustomer,
  updateOrderStatus
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/customer/:customerId", getOrdersByCustomer);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;