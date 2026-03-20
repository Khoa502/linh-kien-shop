import axiosInstance from './axiosInstance'

// HoaDon fields từ API:
// { maHD, maHoaDon, ngayBan, maNV, tenNV, maKH, tenKH,
//   tongTien, giamGia, thanhTien, hinhThucThanhToan,
//   trangThai, ghiChu }

export const hoaDonService = {
  // GET /api/HoaDon
  getAll: () => axiosInstance.get('/HoaDon'),

  // GET /api/HoaDon/{id}
  getById: (id) => axiosInstance.get(`/HoaDon/${id}`),

  // POST /api/HoaDon — tạo hóa đơn mới
  create: (data) => axiosInstance.post('/HoaDon', data),

  // PUT /api/HoaDon/{id}
  update: (id, data) => axiosInstance.put(`/HoaDon/${id}`, data),

  // DELETE /api/HoaDon/{id}
  delete: (id) => axiosInstance.delete(`/HoaDon/${id}`),
}
