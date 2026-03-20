import axiosInstance from "./axiosInstance";

// SanPham fields từ API:
// { maSP, maLinhKien, tenSP, thongSoKyThuat, donViTinh, giaNhap,
//   giaBan, soLuongTon, hinhAnh, maLoai, tenLoai, maNCC, tenNCC,
//   trangThai, moTa }

export const sanPhamService = {
  // GET /api/SanPham — lấy tất cả sản phẩm
  getAll: async () => {
    const res = await axiosInstance.get("/SanPham");
    return res.data;
  },

  // GET /api/SanPham/{id}
  getById: async (id) => {
    const res = await axiosInstance.get(`/SanPham/${id}`);
    return res.data;
  },

  // POST /api/SanPham — tạo sản phẩm mới (Admin)
  create: async (data) => {
    const res = await axiosInstance.post("/SanPham", data);
    return res.data;
  },

  // PUT /api/SanPham/{id} — cập nhật sản phẩm (Admin)
  update: async (id, data) => {
    const res = await axiosInstance.put(`/SanPham/${id}`, data);
    return res.data;
  },

  // DELETE /api/SanPham/{id} — xóa sản phẩm (Admin)
  delete: async (id) => {
    const res = await axiosInstance.delete(`/SanPham/${id}`);
    return res.data;
  },
};
