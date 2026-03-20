import axiosInstance from './axiosInstance'

// DanhMuc fields từ API:
// { maLoai, tenLoai, moTa }

export const danhMucService = {
  // GET /api/DanhMuc
  getAll: () => axiosInstance.get('/DanhMuc'),

  // GET /api/DanhMuc/{id}
  getById: (id) => axiosInstance.get(`/DanhMuc/${id}`),

  // POST /api/DanhMuc
  create: (data) => axiosInstance.post('/DanhMuc', data),

  // PUT /api/DanhMuc/{id}
  update: (id, data) => axiosInstance.put(`/DanhMuc/${id}`, data),

  // DELETE /api/DanhMuc/{id}
  delete: (id) => axiosInstance.delete(`/DanhMuc/${id}`),
}
