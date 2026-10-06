# BÁO CÁO THỰC HÀNH: BACKEND VỚI NODE.JS — MICROSERVICES

## THÔNG TIN SINH VIÊN

* **Họ và tên:** Hoàng Ngọc Hoà
* **Mã số sinh viên:** N23DCPT022
* **Lớp:** D23CQPTUD01-N
* **Đề tài:** Xây dựng hệ thống Microservices E-Commerce (Lab 2a)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống được thiết kế theo mô hình kiến trúc Microservices phân tán, tuân thủ nguyên tắc **Database per Service**. Toàn bộ các yêu cầu từ phía máy khách (Client) đều được điều hướng qua một **API Gateway** duy nhất.

### 1.1. Sơ đồ kiến trúc

```text
                        ┌────────────────────────────────────────────────┐
                        │              CLIENT / POSTMAN / UI             │
                        └───────────────────────┬────────────────────────┘
                                                │ (HTTP / REST)
                                                ▼
                        ┌────────────────────────────────────────────────┐
                        │             API GATEWAY (Port 3000)            │
                        │    - Reverse Proxy                             │
                        │    - Rate Limiting (100 req / 15 min)          │
                        │    - Centralized JWT Authentication Filter     │
                        │    - Security Headers (Helmet) & CORS          │
                        └───────┬───────────────┬────────────────┬───────┘
                                │               │                │
            ┌───────────────────▼──┐   ┌────────▼──────────┐   ┌─▼──────────────────┐
            │     AUTH SERVICE     │   │  PRODUCT SERVICE  │   │   ORDER SERVICE    │
            │     (Port 3003)      │   │   (Port 3001)     │   │    (Port 3002)     │
            │  - Register & Login  │   │  - Product CRUD   │   │  - Order Creation  │
            │  - JWT & Refresh     │   │  - Redis Caching  │   │  - Status Tracking │
            │  - Password Hash     │   │  - Image Upload   │   │  - Swagger Spec    │
            │  - Prisma ORM        │   │  - Swagger 3.0    │   │  - Mongoose ODM    │
            └───────────┬──────────┘   └───────┬─────┬─────┘   └──────────┬─────────┘
                        │                      │     │                    │
                        ▼                      ▼     ▼                    ▼
                 ┌──────────────┐       ┌──────────┐ ┌───────┐     ┌─────────────┐
                 │  PostgreSQL  │       │PostgreSQL│ │ Redis │     │   MongoDB   │
                 │  (Supabase)  │       │(Supabase)│ │ (RAM) │     │   (Atlas)   │
                 └──────────────┘       └──────────┘ └───────┘     └─────────────┘
```

### 1.2. Danh sách Services và Công nghệ

| Service | Port | Công nghệ | Cơ sở dữ liệu / Bộ nhớ | Chức năng chính |
| :--- | :---: | :--- | :--- | :--- |
| **API Gateway** | `3000` | Express, `http-proxy-middleware` | — | Điểm vào duy nhất; phân phối request; Rate Limit; kiểm tra JWT. |
| **Product Service** | `3001` | Express, Prisma ORM, Multer | **PostgreSQL (Supabase)**, **Redis** | Quản lý sản phẩm, danh mục; Caching 5 phút; Upload ảnh Cloudinary. |
| **Order Service** | `3002` | Express, Mongoose ODM | **MongoDB (Atlas)** | Quản lý đơn hàng; tự động sinh mã `orderCode`; lưu snapshot giá. |
| **Auth Service** | `3003` | Express, Prisma ORM, JWT, Bcrypt | **PostgreSQL (Supabase)** | Quản lý tài khoản; mã hóa mật khẩu; cấp phát và làm mới Token. |

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
microservices-shop/
├── api-gateway/                      # Cổng giao tiếp API Gateway tập trung
│   ├── src/
│   │   ├── middleware/auth.js        # Middleware xác thực JWT Bearer Token
│   │   └── index.js                  # Entry point định tuyến proxy và cấu hình bảo mật
│   ├── dockerfile                    # Multi-stage Dockerfile
│   └── package.json
├── auth-service/                     # Service xác thực và phân quyền người dùng
│   ├── prisma/schema.prisma          # Database schema User
│   ├── src/
│   │   ├── controllers/authController.js
│   │   ├── routes/authRoutes.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── product-service/                  # Service sản phẩm & danh mục
│   ├── prisma/
│   │   ├── schema.prisma             # Schema Category & Product
│   │   └── seed.js                   # Dữ liệu mẫu khởi tạo ban đầu
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js         # Tích hợp Cloudinary Storage
│   │   │   └── redis.js              # Kết nối Redis & Cache Invalidation
│   │   ├── controllers/productController.js
│   │   ├── middleware/validate.js    # Kiểm tra tính hợp lệ dữ liệu (express-validator)
│   │   ├── middleware/errorHandler.js# Bắt lỗi toàn cục (Prisma exceptions)
│   │   ├── routes/productRoutes.js   # Router kèm JSDoc OpenAPI 3.0
│   │   ├── swagger/swagger.js        # Cấu hình OpenAPI spec
│   │   └── app.js
│   ├── dockerfile
│   └── package.json
├── order-service/                    # Service đơn hàng
│   ├── src/
│   │   ├── models/Order.js           # Mongoose Schema & Pre-save Hooks
│   │   ├── controllers/orderController.js
│   │   ├── routes/orderRoutes.js
│   │   ├── swagger/swagger.js        # OpenAPI Spec có Bearer Auth
│   │   └── app.js
│   ├── dockerfile
│   └── package.json
├── postman/
│   └── Lab2.postman_collection.json  # Bộ kịch bản kiểm thử Postman
├── docker-compose.yml                # Cấu hình điều phối container toàn hệ thống
├── .gitignore
└── README.md
```

---

## 3. CÁC ĐẶC TÍNH KỸ THUẬT NỔI BẬT

### 3.1. Quản lý dữ liệu và ORM/ODM
* **PostgreSQL (Supabase Cloud):** Quản lý quan hệ thực thể `Category` và `Product` bằng **Prisma ORM**, đảm bảo tính toàn vẹn khóa ngoại (`Foreign Key Constraints`) và tính duy nhất (`Unique Index`).
* **MongoDB (Atlas Cloud):** Quản lý cấu trúc linh hoạt của đơn hàng bằng **Mongoose ODM**. Sử dụng `pre("save")` hook để tự động sinh mã định danh chuẩn nghiệp vụ (`ORD-YYYYMMDD-XXXX`) và lưu snapshot thông tin sản phẩm tại thời điểm mua hàng.

### 3.2. Cơ chế Caching phân tán (Redis)
* Tích hợp Redis vào Product Service để tối ưu hóa hiệu năng đọc (`GET /api/products`).
* Dữ liệu truy vấn được lưu tạm trong bộ nhớ RAM với thời gian hết hạn (`TTL`) là **5 phút**.
* Áp dụng chiến lược **Cache Invalidation**: Tự động xóa bộ nhớ đệm khi phát sinh các thao tác thay đổi dữ liệu (`POST`, `PUT`, `DELETE`, hoặc upload ảnh), đảm bảo dữ liệu trả về luôn chính xác.

### 3.3. Xử lý tập tin đa phương tiện (Cloudinary)
* Sử dụng `multer` kết hợp `multer-storage-cloudinary` để tiếp nhận tập tin hình ảnh (`multipart/form-data`).
* Tự động xử lý giới hạn dung lượng (tối đa 5MB) và lưu trữ trực tiếp lên CDN của Cloudinary, sau đó cập nhật URL an toàn vào trường `imageUrl` của sản phẩm.

### 3.4. Bảo mật & Xác thực tập trung
* **Băm mật khẩu:** Sử dụng thuật toán `bcrypt` với muối (salt) 10 vòng để lưu trữ mật khẩu an toàn.
* **Cơ chế Token:** Áp dụng mô hình cặp Token gồm `accessToken` (thời hạn 15 phút) và `refreshToken` (thời hạn 7 ngày).
* **Bảo vệ tại Gateway:** API Gateway tự động xác minh tính hợp lệ của Token trước khi cho phép chuyển tiếp yêu cầu đến Order Service.
* **Biến môi trường:** Toàn bộ thông tin nhạy cảm (JWT Secret, Database Credentials) được quản lý qua file `.env`, không bị hardcode trong mã nguồn hoặc file Docker Compose.

---

## 4. HƯỚNG DẪN TRIỂN KHAI VÀ KHỞI ĐỘNG

### 4.1. Khởi động bằng Docker Compose (Khuyến nghị)

Toàn bộ hệ thống và dịch vụ đệm Redis đã được thiết lập container hoá:

```bash
# 1. Khởi động toàn bộ các services ở chế độ nền
docker-compose up -d --build

# 2. Kiểm tra trạng thái hoạt động của các containers
docker-compose ps
```

### 4.2. Khởi động thủ công cho môi trường phát triển (Local Development)

Yêu cầu môi trường máy chủ đã cài đặt Node.js (>= 18.x) và Redis:

```bash
# API Gateway (Cổng 3000)
cd api-gateway && npm install && npm run dev

# Auth Service (Cổng 3003)
cd auth-service && npm install && npx prisma generate && npm run dev

# Product Service (Cổng 3001)
cd product-service && npm install && npx prisma generate && npm run dev

# Order Service (Cổng 3002)
cd order-service && npm install && npm run dev
```

---

## 5. TÀI LIỆU API & TÍCH HỢP SWAGGER UI

Hệ thống tích hợp tài liệu giao diện chuẩn **OpenAPI 3.0** cho phép kiểm thử trực tiếp trên trình duyệt:

* **Product Service API Documentation:**  
  `http://localhost:3001/api-docs`  
  *(Cung cấp tài liệu đầy đủ cho các thao tác CRUD sản phẩm, bộ lọc nâng cao và upload ảnh Cloudinary)*

* **Order Service API Documentation:**  
  `http://localhost:3002/api-docs`  
  *(Cung cấp tài liệu chi tiết cho đơn hàng, hỗ trợ nút **Authorize** để xác thực JWT Bearer Token trực tiếp trên giao diện)*

---

## 6. KỊCH BẢN KIỂM THỬ VỚI POSTMAN

Bộ kịch bản kiểm thử đã được cấu hình sẵn trong tập tin:  
`postman/Lab2.postman_collection.json`

### Quy trình kiểm thử đề xuất:
1. **Khởi tạo tài khoản:** Thực thi request `POST /api/auth/register` hoặc `POST /api/auth/login`. Script trong collection sẽ tự động trích xuất và gán `accessToken` vào biến môi trường `{{token}}`.
2. **Kiểm thử Product Service:**
   * Thực hiện `GET /api/products` (lần 1 truy vấn Database, lần 2 nhận dữ liệu từ Redis Cache với cờ `fromCache: true`).
   * Thực hiện các thao tác kiểm thử tính hợp lệ dữ liệu (nhận phản hồi `422 Unprocessable Entity`), kiểm tra sản phẩm không tồn tại (`404 Not Found`).
   * Thực hiện `PUT` hoặc `POST` để kiểm tra cơ chế tự động xóa Cache của Redis.
3. **Kiểm thử Order Service:**
   * Thực thi `POST /api/orders` với Header xác thực để tạo đơn hàng.
   * Truy vấn danh sách đơn hàng `GET /api/orders` hoặc lọc theo mã khách hàng `GET /api/orders/customer/:customerId`.
   * Cập nhật trạng thái đơn hàng thông qua `PATCH /api/orders/:id/status`.
