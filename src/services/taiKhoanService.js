import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";

export const taiKhoanService = {
  getAll: () =>
    axiosInstance.get("/TaiKhoan").catch((err) => {
      toast.error("Lỗi tải danh sách tài khoản!");
      return { data: [] };
    }),

  getById: (id) => axiosInstance.get(`/TaiKhoan/${id}`),

  create: (data) => {
    const payload = {
      tenDangNhap: data.tenDangNhap,
      email: data.email,
      matKhau: data.matKhau,
      hoTen: data.hoTen,
      soDienThoai: data.soDienThoai || null,
      roleId: data.role,
      trangThai: data.trangThai !== false, // default true
    };
    return axiosInstance.post("/TaiKhoan", payload);
  },

  update: (id, data) => {
    const payload = {
      tenDangNhap: data.tenDangNhap,
      email: data.email,
      hoTen: data.hoTen,
      soDienThoai: data.soDienThoai || null,
      roleId: data.role,
      trangThai: data.trangThai !== false,
      // No matKhau for update
    };
    return axiosInstance.put(`/TaiKhoan/${id}`, payload);
  },

  delete: (id) => axiosInstance.delete(`/TaiKhoan/${id}`),
};
