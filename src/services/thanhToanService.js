import axiosInstance from './axiosInstance'

// ThanhToan fields từ API:
// { maThanhToan, maHD, maHoaDon, maPTTT, tenPhuongThuc,
//   soTien, maGiaoDich, trangThai, ngayThanhToan }

export const thanhToanService = {
  // GET /api/ThanhToan
  getAll: () => axiosInstance.get('/ThanhToan'),

  // GET /api/ThanhToan/{id}
  getById: (id) => axiosInstance.get(`/ThanhToan/${id}`),

  // POST /api/ThanhToan
  create: (data) => axiosInstance.post('/ThanhToan', data),

  // PUT /api/ThanhToan/{id}
  update: (id, data) => axiosInstance.put(`/ThanhToan/${id}`, data),
}

// LichSuThanhToan fields từ API:
// { id, maThanhToan, trangThai, thoiGian, ghiChu }

export const lichSuThanhToanService = {
  // GET /api/LichSuThanhToan
  getAll: () => axiosInstance.get('/LichSuThanhToan'),
}

// PhuongThucThanhToan fields từ API:
// { maPTTT, tenPhuongThuc, moTa, trangThai }
// Dữ liệu thực: Tiền mặt / Chuyển khoản ngân hàng / MoMo

export const phuongThucThanhToanService = {
  // GET /api/PhuongThucThanhToan
  getAll: () => axiosInstance.get('/PhuongThucThanhToan'),
}
