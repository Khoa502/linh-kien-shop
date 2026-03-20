import axiosInstance from "./axiosInstance";

// API thật: /HoaDon (không phải /DonHangs)
// HoaDon fields: { maHD, maHoaDon, ngayBan, tenKH, tenNV,
//   tongTien, thanhTien, hinhThucThanhToan, trangThai, ghiChu }

export const orderService = {
  // GET /api/HoaDon — lấy tất cả hóa đơn
  getAll: () => axiosInstance.get("/HoaDon"),

  // GET /api/HoaDon/{id}
  getById: (id) => axiosInstance.get(`/HoaDon/${id}`),

  // GET /api/HoaDon/khach-hang/{maKH} — lấy đơn hàng theo khách hàng
  getByKhachHang: (maKH) => axiosInstance.get(`/HoaDon/khach-hang/${maKH}`),

  // Không có /my-orders → lấy tất cả rồi filter theo user phía frontend
  getMyOrders: () => axiosInstance.get("/HoaDon"),

  // POST /api/HoaDon
  create: (data) => axiosInstance.post("/HoaDon", data),

  // PUT /api/HoaDon/{id}
  update: (id, data) => axiosInstance.put(`/HoaDon/${id}`, data),

  // DELETE /api/HoaDon/{id}
  delete: (id) => axiosInstance.delete(`/HoaDon/${id}`),

  // GET /api/KhachHang
  getCustomers: () => axiosInstance.get("/KhachHang"),

  // GET /api/ThanhToan
  getPayments: () => axiosInstance.get("/ThanhToan"),

  // GET /api/PhieuNhap
  getImports: () => axiosInstance.get("/PhieuNhap"),

  // POST /api/PhieuNhap
  createImport: (data) => axiosInstance.post("/PhieuNhap", data),

  // DELETE /api/PhieuNhap/{id}
  deleteImport: (id) => axiosInstance.delete(`/PhieuNhap/${id}`),
};
