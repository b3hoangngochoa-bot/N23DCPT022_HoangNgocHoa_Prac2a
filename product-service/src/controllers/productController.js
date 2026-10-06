const { PrismaClient } = require("@prisma/client");
const { redis, clearProductsCache } = require("../config/redis");

const prisma = new PrismaClient();

// GET /api/products - Lấy danh sách có phân trang, lọc, sắp xếp (Cache 5 phút)
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      sortBy = "createdAt",
      order = "desc",
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;

    // 1. Kiểm tra cache Redis
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json({
          ...JSON.parse(cachedData),
          fromCache: true
        });
      }
    } catch (cacheErr) {
      console.warn("Redis get error:", cacheErr.message);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Xây dựng điều kiện filter
    const where = {
      isActive: true,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(category && { category: { slug: category } }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        }
      }),
      ...(inStock === "true" && { stock: { gt: 0 } }),
    };

    // Chạy song song 2 queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };

    // 2. Lưu vào Redis trong 5 phút
    try {
      await redis.setex(cacheKey, 300, JSON.stringify(result));
    } catch (cacheErr) {
      console.warn("Redis set error:", cacheErr.message);
    }

    res.json({
      ...result,
      fromCache: false
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, stock, imageUrl, categoryId } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    const product = await prisma.product.create({
      data: { name, slug, price, description, stock, imageUrl, categoryId },
      include: { category: true }
    });

    // Xóa cache khi thêm sản phẩm mới
    await clearProductsCache();

    res.status(201).json({ success: true, data: product, message: "Tạo sản phẩm thành công" });
  } catch (error) { next(error); }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { category: true }
    });

    // Xóa cache khi sửa sản phẩm
    await clearProductsCache();

    res.json({ success: true, data: product, message: "Cập nhật thành công" });
  } catch (error) { next(error); }
};

// DELETE /api/products/:id (Soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    });

    // Xóa cache khi xóa sản phẩm
    await clearProductsCache();

    res.json({ success: true, message: "Đã ẩn sản phẩm thành công" });
  } catch (error) { next(error); }
};

// POST /api/products/:id/image
const uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file ảnh để tải lên (field name: 'image')"
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm"
      });
    }

    const imageUrl = req.file.path;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { imageUrl },
      include: { category: true }
    });

    // Xóa cache khi cập nhật ảnh sản phẩm
    await clearProductsCache();

    res.json({
      success: true,
      message: "Tải ảnh sản phẩm lên Cloudinary thành công!",
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
