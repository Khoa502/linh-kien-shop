import axiosInstance from "./axiosInstance.js";

/**
 * Chuẩn hóa response data từ API
 * @param {Object} response - Axios response object
 * @returns {Object|null} Normalized data hoặc null nếu không có data
 */
const handleResponse = (response) => {
  if (!response?.data) {
    return null;
  }
  return response.data;
};

/**
 * Product Review Service - Quản lý đánh giá sản phẩm
 * Sử dụng axiosInstance với interceptors tự động (auth, error handling)
 */
const danhGiaSanPhamService = {
  /**
   * Lấy danh sách đánh giá theo mã sản phẩm
   * @param {string|number} maSP - Mã sản phẩm
   * @returns {Promise<Array>} Danh sách đánh giá
   */
  getByProductId: async (maSP) => {
    // Chặn lỗi gọi API khi maSP chưa kịp load (undefined)
    if (!maSP || maSP === "undefined") return null;

    try {
      // Đổi thành Route Parameter theo đúng Backend: /san-pham/{maSP}
      const response = await axiosInstance.get(
        `/DanhGiaSanPham/san-pham/${maSP}`,
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi getByProductId:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê đánh giá sản phẩm (trung bình, tổng số)
   * @param {string|number} maSP - Mã sản phẩm
   * @returns {Promise<Object>} { trungBinh: number, tongSo: number }
   */
  getStats: async (maSP) => {
    if (!maSP || maSP === "undefined") return null;

    try {
      // Đổi thành Route Parameter theo đúng Backend: /thong-ke/san-pham/{maSP}
      const response = await axiosInstance.get(
        `/DanhGiaSanPham/thong-ke/san-pham/${maSP}`,
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi getStats:", error);
      throw error;
    }
  },

  /**
   * Lấy top sản phẩm được đánh giá cao
   * @returns {Promise<Array>} Danh sách sản phẩm top-rated
   */
  getTopRated: async () => {
    try {
      const response = await axiosInstance.get("/DanhGiaSanPham/top-rated");
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi getTopRated:", error);
      throw error;
    }
  },

  /**
   * Tạo đánh giá mới
   * @param {Object} data - { maSP, sao, noiDung, maKH?, tenKhachHang? }
   * @returns {Promise<Object>} Đánh giá đã tạo
   */
  create: async (data) => {
    try {
      const response = await axiosInstance.post("/DanhGiaSanPham", data);
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi create:", error);
      throw error;
    }
  },

  /**
   * Xóa đánh giá theo ID
   * @param {string|number} id - ID đánh giá
   * @returns {Promise<Object|null>} Kết quả xóa
   */
  deleteReview: async (id) => {
    try {
      const response = await axiosInstance.delete(`/DanhGiaSanPham/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi deleteReview:", error);
      throw error;
    }
  },

  /**
   * Alias cho getByProductId - tương thích với ProductDetail.jsx
   */
  getBySanPham: async (maSP) => danhGiaSanPhamService.getByProductId(maSP),
};

export { danhGiaSanPhamService };
