const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require("../controllers/productController");
const { productValidation } = require("../middleware/validate");
const { upload } = require("../config/cloudinary");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm kiếm theo tên
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Lọc theo slug danh mục
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, price, createdAt], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaginatedProducts"
 * 
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: "iPhone 15 Pro" }
 *               price: { type: number, example: 27990000 }
 *               description: { type: string, example: "Mô tả sản phẩm" }
 *               stock: { type: integer, example: 50 }
 *               categoryId: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
router.get("/", getProducts);
router.post("/", productValidation, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       404:
 *         description: Không tìm thấy sản phẩm
 * 
 *   put:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "iPhone 15 Pro Max" }
 *               price: { type: number, example: 30000000 }
 *               description: { type: string, example: "Mô tả sản phẩm" }
 *               stock: { type: integer, example: 50 }
 *               categoryId: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 * 
 *   delete:
 *     summary: Xóa sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get("/:id", getProductById);
router.put("/:id", productValidation, updateProduct);
router.delete("/:id", deleteProduct);

/**
 * @swagger
 * /api/products/{id}/image:
 *   post:
 *     summary: Upload ảnh sản phẩm lên Cloudinary
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: ID sản phẩm cần cập nhật ảnh
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh tải lên (JPG, PNG, WEBP)
 *     responses:
 *       200:
 *         description: Tải ảnh thành công, URL được lưu vào trường imageUrl của Product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Tải ảnh sản phẩm lên Cloudinary thành công!" }
 *                 data: { $ref: "#/components/schemas/Product" }
 *       400:
 *         description: Thiếu file ảnh hoặc file không hợp lệ
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.post("/:id/image", upload.single("image"), uploadProductImage);

module.exports = router;