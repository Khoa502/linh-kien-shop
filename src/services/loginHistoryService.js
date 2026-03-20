import axiosInstance from "./axiosInstance";
import { safeJsonParse } from "../utils/safeJsonParse.js";

/**
 * Service cho API lịch sử đăng nhập Admin
 * Endpoint: GET /api/LichSuDangNhap (admin token required)
 * Response: Flat backend structure mapped to UI {
 *   id, tenDangNhap, thoiGian, diaChiIP, device, trangThai
 *   → normalized to: customer{name}, loginTime, ip, status etc.
 * }
 */

export const loginHistoryService = {
  /**
   * Lấy danh sách lịch sử đăng nhập gần đây - with safe parsing
   * @returns Promise<{data: array, total: number}>
   */
  getLoginHistory: async () => {
    try {
      const response = await axiosInstance.get("/LichSuDangNhap");
      // Safe parse and ensure array
      let data = safeJsonParse(response?.data ?? null, []);

      // Normalize data structure for consistent UI rendering
      data = data.map((item) => ({
        id: item.id || "",
        customer: {
          name: item.tenDangNhap || "N/A",
          email: "N/A",
          avatar: "👤",
        },
        loginTime: item.thoiGian || null,
        ip: item.diaChiIP || "N/A",
        device: item.device || "Unknown",
        status: item.trangThai || "Unknown",
      }));

      console.log("✅ LoginHistory fetched:", data.length, "records");
      return { data, total: data.length };
    } catch (error) {
      console.error("❌ LoginHistoryService error:", {
        message: error.message,
        status: error.response?.status,
        data: safeJsonParse(error.response?.data, "N/A"),
        url: error.config?.url,
      });
      // Return empty normalized data instead of throwing
      return { data: [], total: 0 };
    }
  },
};
