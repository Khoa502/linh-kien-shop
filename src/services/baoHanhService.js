import axiosInstance from './axiosInstance'

// BaoHanh fields từ API:
// { maBH, maHD, maHoaDon, maSP, tenSP, soSerial,
//   thoiHanBaoHanh, ngayBatDau, ngayKetThuc,
//   diaChiBaoHanh, trangThai }

export const baoHanhService = {
  // GET /api/BaoHanh — lấy tất cả
  getAll: () => axiosInstance.get('/BaoHanh'),

  // GET /api/BaoHanh/{id}
  getById: (id) => axiosInstance.get(`/BaoHanh/${id}`),

  // GET /api/BaoHanh/hoa-don/{maHD}
  getByHoaDon: (maHD) => axiosInstance.get(`/BaoHanh/hoa-don/${maHD}`),

  // GET /api/BaoHanh/san-pham/{maSP}
  getBySanPham: (maSP) => axiosInstance.get(`/BaoHanh/san-pham/${maSP}`),

  // GET /api/BaoHanh/sap-het-han
  getSapHetHan: () => axiosInstance.get('/BaoHanh/sap-het-han'),

  // POST /api/BaoHanh
  create: (data) => axiosInstance.post('/BaoHanh', data),

  // PUT /api/BaoHanh/{id}
  update: (id, data) => axiosInstance.put(`/BaoHanh/${id}`, data),

  // DELETE /api/BaoHanh/{id}
  delete: (id) => axiosInstance.delete(`/BaoHanh/${id}`),
}
