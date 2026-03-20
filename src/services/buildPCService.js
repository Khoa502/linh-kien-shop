import axiosInstance from "./axiosInstance";

export const buildPCService = {
  // Lấy danh sách linh kiện theo loại
  getLinhKien: async (loai) => {
    try {
      const response = await axiosInstance.get(`/buildpc/${loai}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to load ${loai}:`, error.message);
      return [];
    }
  },

  // Lấy danh sách tất cả các loại linh kiện cần thiết
  getAllLinhKien: async () => {
    try {
      const response = await axiosInstance.get("/buildpc");
      return response.data || [];
    } catch (error) {
      console.error("Failed to load all components:", error.message);
      throw error;
    }
  },

  // Lấy danh sách Case (Vỏ máy tính)
  getCases: async () => {
    try {
      const response = await axiosInstance.get("/buildpc/case");
      return response.data || [];
    } catch (error) {
      console.error("Failed to load cases:", error.message);
      return [];
    }
  },

  // Lưu cấu hình
  luuCauHinh: async (cauHinh) => {
    try {
      const response = await axiosInstance.post(
        "/buildpc/luu-cau-hinh",
        cauHinh,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to save config:", error.message);
      throw error;
    }
  },

  // Đặt hàng
  datHang: async (cauHinh) => {
    try {
      const response = await axiosInstance.post("/buildpc/dat-hang", cauHinh);
      return response.data;
    } catch (error) {
      console.error("Failed to order:", error.message);
      throw error;
    }
  },

  // Thêm vào giỏ hàng (lưu cấu hình vào giỏ hàng)
  addToCart: async (cauHinh) => {
    try {
      const response = await axiosInstance.post(
        "/buildpc/add-to-cart",
        cauHinh,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to add to cart:", error.message);
      throw error;
    }
  },

  // Lấy danh sách cấu hình đã lưu của khách hàng
  getCauHinhDaLuu: async (maKH) => {
    try {
      const response = await axiosInstance.get(`/buildpc/cau-hinh/${maKH}`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to load saved configs:", error.message);
      throw error;
    }
  },

  // Xóa cấu hình đã lưu
  xoaCauHinh: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `/buildpc/xoa-cau-hinh/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to delete config:", error.message);
      throw error;
    }
  },
};
