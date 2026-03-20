import axiosInstance from "./axiosInstance";

export const authService = {
  // API chính thức: /api/Auth/login trả về JWT thật
  login: ({ userName, password }) =>
    axiosInstance.post("/Auth/login", {
      tenDangNhap: userName,
      matKhau: password,
    }),

  getAll: () => axiosInstance.get("/TaiKhoan"),

  register: (data) =>
    axiosInstance.post("/TaiKhoan", {
      tenDangNhap: data.userName,
      matKhau: data.password,
      roleID: 3,
    }),
};
