import axiosInstance from "./axiosInstance";

// NhaCungCap fields từ API:
// { maNCC, tenNCC, diaChi, sdt, trangThai }

export const nhaCungCapService = {
  // GET /api/NhaCungCap
  getAll: () => axiosInstance.get("/NhaCungCap"),

  // GET /api/NhaCungCap/{id}
  getById: (id) => axiosInstance.get(`/NhaCungCap/${id}`),

  // POST /api/NhaCungCap
  create: (data) => axiosInstance.post("/NhaCungCap", data),

  // PUT /api/NhaCungCap/{id}
  update: (id, data) => axiosInstance.put(`/NhaCungCap/${id}`, data),

  // DELETE /api/NhaCungCap/{id}
  delete: (id) => axiosInstance.delete(`/NhaCungCap/${id}`),
};
