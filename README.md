# ⚡ TechStore – Linh Kiện Điện Tử

Frontend React chuẩn doanh nghiệp, kết nối ASP.NET Core backend tại `https://localhost:7171/api`.

---

## 🚀 Cài đặt & Chạy

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev
# → http://localhost:3000
```

---

## 📁 Cấu trúc

```
src/
├── pages/user/         # Home, Products, ProductDetail, Cart, Checkout, Login, Register, Dashboard, OrderTracking
├── pages/admin/        # AdminDashboard, ManageProducts, ManageCategories, ManageOrders, ManageCustomers, ManagePayments, ManageImports
├── components/         # Header, Footer, ProductCard, PrivateRoute, LoadingSpinner, DarkModeToggle, ChatWidget
├── layouts/            # UserLayout, AdminLayout (sidebar)
├── services/           # axiosInstance, authService, productService, categoryService, orderService, invoiceService
├── context/            # AuthContext (JWT + roles), CartContext
├── routes/             # AppRoutes (lazy loading)
└── utils/              # decodeToken, formatCurrency
```

---

## 🔐 Authentication

- **Login bằng Username** (không phải email)
- `POST /Auth/Login` với `{ userName, password }`
- JWT lưu `localStorage`, tự gắn header `Authorization: Bearer`
- Interceptor bắt 401 → auto logout
- Decode token lấy role → phân quyền PrivateRoute

## 👥 Roles

| Role | Quyền |
|------|-------|
| `Admin` | Full hệ thống |
| `NhanVien` | Quản lý đơn |
| `KhachHang` | Mua hàng |

---

## ✨ Tính năng

### User
- 🏠 Trang chủ với hero, categories, featured products
- 🛍️ Danh sách sản phẩm: search, filter, sort, pagination
- 📦 Chi tiết sản phẩm với lazy-load ảnh
- 🛒 Giỏ hàng (localStorage persist)
- 💳 Thanh toán + tạo đơn hàng + hóa đơn
- 📊 Dashboard cá nhân: thống kê, lịch sử đơn
- 🗺️ Tracking đơn hàng với **Leaflet map**
- 🤖 Chat AI widget (gọi `/ChatHoiThoai`)
- 🌙 Dark mode toggle

### Admin
- 📊 Dashboard với biểu đồ **Recharts** (Area, Bar, Pie)
- 📦 CRUD sản phẩm
- 🗂️ CRUD danh mục
- 🛍️ Quản lý & cập nhật trạng thái đơn hàng
- 👥 Quản lý khách hàng
- 💳 Quản lý thanh toán
- 📥 Quản lý nhập kho

---

## 🎨 Thiết kế

- Font: **Raleway** (display) + **Nunito** (body)
- Màu chủ đạo: **Blue 600** (#2563eb)
- Dark mode, Responsive (Mobile/Tablet/Desktop)
- Skeleton loading, Toast notifications, Smooth animations
