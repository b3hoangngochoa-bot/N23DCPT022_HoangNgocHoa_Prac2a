const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-lab2-microservices";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super-secret-refresh-key-lab2-microservices";

// Hàm hỗ trợ tạo cặp Token
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// 1. Đăng ký (Register)
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email này đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const tokens = generateTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        ...tokens
      }
    });
  } catch (error) { next(error); }
};

// 2. Đăng nhập (Login)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác" });
    }

    const tokens = generateTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...tokens
      }
    });
  } catch (error) { next(error); }
};

// 3. Cấp lại Token (Refresh Token)
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Thiếu Refresh Token" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: "Refresh Token không hợp lệ" });
    }

    const tokens = generateTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.json({ success: true, data: tokens });
  } catch (error) {
    res.status(403).json({ success: false, message: "Refresh Token không hợp lệ hoặc đã hết hạn" });
  }
};

// 4. Lấy thông tin bản thân
const getMe = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, message: "Chưa cung cấp token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

module.exports = { register, login, refresh, getMe };