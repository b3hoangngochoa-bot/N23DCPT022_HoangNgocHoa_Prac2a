const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập! Yêu cầu đính kèm Bearer token"
    });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-lab2-microservices";
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn"
    });
  }
};

module.exports = authenticate;