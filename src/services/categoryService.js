import axiosInstance from "./axiosInstance";

// DanhMuc fields: { maLoai, tenLoai, moTa }

// Helper function để xử lý response an toàn
const handleResponse = (response) => {
  // Kiểm tra nếu response là undefined hoặc null
  if (!response) {
    console.warn("Response is undefined or null");
    return [];
  }

  // Kiểm tra nếu response.data là undefined, null
  if (response?.data === undefined || response?.data === null) {
    console.warn("Response data is undefined or null");
    return [];
  }

  // Kiểm tra nếu response.data là chuỗi "undefined"
  if (typeof response.data === "string") {
    const trimmed = response.data.trim().toLowerCase();
    if (trimmed === "undefined" || trimmed === "") {
      console.warn("Response data is 'undefined' string");
      return [];
    }
  }

  return response.data;
};

export const categoryService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/DanhMuc");
      return {
        ...response,
        data: handleResponse(response),
      };
    } catch (error) {
      console.error("API /DanhMuc lỗi:", error.response?.data || error.message);
      return { data: [] };
    }
  },
  getById: async (maLoai) => {
    try {
      const response = await axiosInstance.get(`/DanhMuc/${maLoai}`);
      return {
        ...response,
        data: handleResponse(response),
      };
    } catch (error) {
      console.error(
        `API /DanhMuc/${maLoai} lỗi:`,
        error.response?.data || error.message,
      );
      return { data: null };
    }
  },
  create: (data) => axiosInstance.post("/DanhMuc", data),
  update: (maLoai, d) => axiosInstance.put(`/DanhMuc/${maLoai}`, d),
  delete: (maLoai) => axiosInstance.delete(`/DanhMuc/${maLoai}`),
};
