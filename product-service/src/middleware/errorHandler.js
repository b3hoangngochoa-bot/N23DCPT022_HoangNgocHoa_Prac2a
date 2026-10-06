const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);

  // Prisma unique constraint violation (Trùng dữ liệu unique)
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, message: `${err.meta?.target} đã tồn tại` });
  }
  // Prisma record not found (Không tìm thấy bản ghi)
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi" });
  }
  // Prisma foreign key constraint violation (Khóa ngoại không tồn tại)
  if (err.code === "P2003") {
    return res.status(400).json({ success: false, message: "Danh mục (categoryId) không tồn tại" });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi hệ thống",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;