import axiosInstance from './axiosInstance'

// NhanVien fields từ API:
// { maNV, hoTen, quyen, soDienThoai, trangThai, taiKhoanID, tenDangNhap }

export const nhanVienService = {
  // GET /api/NhanVien
  getAll: () => axiosInstance.get('/NhanVien'),

  // GET /api/NhanVien/{id}
  getById: (id) => axiosInstance.get(`/NhanVien/${id}`),

  // POST /api/NhanVien
  create: (data) => axiosInstance.post('/NhanVien', data),

  // PUT /api/NhanVien/{id}
  update: (id, data) => axiosInstance.put(`/NhanVien/${id}`, data),

  // DELETE /api/NhanVien/{id}
  delete: (id) => axiosInstance.delete(`/NhanVien/${id}`),
}
