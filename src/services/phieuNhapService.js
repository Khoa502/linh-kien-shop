import axiosInstance from './axiosInstance'

// PhieuNhap fields từ API:
// { maPN, maNV, maNCC, tenNCC, ngayNhap, tongTien, ghiChu }

export const phieuNhapService = {
  // GET /api/PhieuNhap
  getAll: () => axiosInstance.get('/PhieuNhap'),

  // GET /api/PhieuNhap/{id}
  getById: (id) => axiosInstance.get(`/PhieuNhap/${id}`),

  // POST /api/PhieuNhap
  create: (data) => axiosInstance.post('/PhieuNhap', data),

  // PUT /api/PhieuNhap/{id}
  update: (id, data) => axiosInstance.put(`/PhieuNhap/${id}`, data),

  // DELETE /api/PhieuNhap/{id}
  delete: (id) => axiosInstance.delete(`/PhieuNhap/${id}`),
}

// ChiTietPhieuNhap fields từ API:
// { maCTPN, maPN, maSP, tenSP, soLuong, donGiaNhap, thanhTien }

export const chiTietPhieuNhapService = {
  // GET /api/ChiTietPhieuNhap
  getAll: () => axiosInstance.get('/ChiTietPhieuNhap'),

  // POST /api/ChiTietPhieuNhap
  create: (data) => axiosInstance.post('/ChiTietPhieuNhap', data),

  // PUT /api/ChiTietPhieuNhap/{id}
  update: (id, data) => axiosInstance.put(`/ChiTietPhieuNhap/${id}`, data),

  // DELETE /api/ChiTietPhieuNhap/{id}
  delete: (id) => axiosInstance.delete(`/ChiTietPhieuNhap/${id}`),
}
