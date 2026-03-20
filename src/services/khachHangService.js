import axiosInstance from './axiosInstance'

// KhachHang fields từ API:
// { maKH, hoTen, soDienThoai, diaChi, diemTichLuy,
//   tongNo, taiKhoanID, tenDangNhap }

export const khachHangService = {
  // GET /api/KhachHang
  getAll: () => axiosInstance.get('/KhachHang'),

  // GET /api/KhachHang/{id}
  getById: (id) => axiosInstance.get(`/KhachHang/${id}`),

  // POST /api/KhachHang
  create: (data) => axiosInstance.post('/KhachHang', data),

  // PUT /api/KhachHang/{id}
  update: (id, data) => axiosInstance.put(`/KhachHang/${id}`, data),

  // DELETE /api/KhachHang/{id}
  delete: (id) => axiosInstance.delete(`/KhachHang/${id}`),
}
