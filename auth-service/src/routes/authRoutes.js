const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const { register, login, refresh, getMe } = require("../controllers/authController");

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

const registerValidation = [
  body("email").isEmail().withMessage("Email không đúng định dạng"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải tối thiểu 6 ký tự"),
  body("name").notEmpty().withMessage("Tên không được để trống"),
  handleValidation
];

const loginValidation = [
  body("email").isEmail().withMessage("Email không đúng định dạng"),
  body("password").notEmpty().withMessage("Vui lòng nhập mật khẩu"),
  handleValidation
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);
router.get("/me", getMe);

module.exports = router;