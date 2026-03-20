import axiosInstance from "./axiosInstance";

// API endpoint cho Hóa đơn
// Lưu ý: Backend có thể dùng /api/HoaDon để tạo cả đơn hàng và hóa đơn
// Nếu cần tách biệt, có thể dùng endpoint riêng

export const invoiceService = {
  // POST /api/HoaDon - Tạo hóa đơn (nếu backend hỗ trợ riêng)
  // Lưu ý: Payload cần đầy đủ các trường như khi tạo đơn hàng
  create: (data) => {
    // Nếu data không có các trường bắt buộc, transform lại
    const payload = {
      maKH: data.maKH,
      tenKH: data.tenKH,
      soDienThoai: data.soDienThoai,
      diaChi: data.diaChi,
      hinhThucThanhToan: data.phuongThucThanhToan || data.hinhThucThanhToan,
      chiTietDonHangs: data.chiTietDonHangs || [],
      tongTien: data.tongTien,
      trangThai: data.trangThai || "ChoXacNhan",
      ghiChu: data.ghiChu,
      // Các trường bổ sung nếu có
      donHangId: data.donHangId,
    };
    return axiosInstance.post("/HoaDon", payload);
  },

  // Tạo chi tiết hóa đơn - POST /api/ChiTietHoaDon
  createDetail: (data) => axiosInstance.post("/ChiTietHoaDon", data),

  // Lấy hóa đơn theo ID
  getById: (id) => axiosInstance.get(`/HoaDon/${id}`),

  // Lấy tất cả hóa đơn
  getAll: () => axiosInstance.get("/HoaDon"),

  // Chat với AI (nếu cần)
  chat: (message, history = []) =>
    axiosInstance
      .post("/ChatHoiThoai", { message, history })
      .catch(() => axiosInstance.post("/ai/chat", { message, history })),
};
