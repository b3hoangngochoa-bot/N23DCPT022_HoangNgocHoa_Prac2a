const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const productValidation = [
  body("name").notEmpty().withMessage("Tên sản phẩm không được rỗng")
    .isLength({ min: 2, max: 200 }).withMessage("Tên từ 2-200 ký tự"),
  body("price").isFloat({ min: 0 }).withMessage("Giá phải là số dương"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Số lượng phải là số nguyên >= 0"),
  handleValidation
];

module.exports = { productValidation };