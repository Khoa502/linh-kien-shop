import axios from "axios";
import toast from "react-hot-toast";
import { isTokenExpired } from "../utils/decodeToken.js";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7171/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ============================================================
// Request Interceptor: Tự động lấy token từ localStorage
// và đính kèm vào header Authorization cho mọi request
// ============================================================
axiosInstance.interceptors.request.use(
  (config) => {
    // KHÔNG thêm token cho request login/register
    const isAuthRequest =
      config.url?.includes("/Auth/login") ||
      config.url?.includes("/TaiKhoan/login") ||
      config.url?.includes("/Auth/register") ||
      config.url?.includes("/TaiKhoan/register");

    if (isAuthRequest) {
      return config;
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    // Đảm bảo header Authorization luôn đúng chuẩn: Bearer ${token}
    if (token && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// ============================================================
// Response Interceptor: Xử lý lỗi response (401, 403, 500, ...)
// ============================================================
axiosInstance.interceptors.response.use(
  (response) => {
    try {
      // Kiểm tra response trước khi trả về
      // Nếu response có data là string "undefined" hoặc rỗng, trả về null
      if (typeof response?.data === "string") {
        const trimmed = response.data.trim().toLowerCase();
        if (
          trimmed === "undefined" ||
          trimmed === "" ||
          trimmed.startsWith("<!doctype") ||
          trimmed.startsWith("<html")
        ) {
          // Server trả về HTML error page thay vì JSON
          console.warn(
            "Server trả về HTML thay vì JSON:",
            response.data.substring(0, 100),
          );
          response.data = null;
        }
      }
    } catch (e) {
      console.warn("Lỗi xử lý response:", e);
    }
    return response;
  },
  (error) => {
    // Handle undefined error (network error, etc.)
    if (!error.response) {
      console.error("Network error or no response:", error);
      try {
        const isNotLoginPage = !window.location.pathname.includes("/login");
        if (isNotLoginPage) {
          toast.error("Lỗi kết nối! Vui lòng kiểm tra mạng.");
        }
      } catch (e) {
        // Ignore navigation errors
      }
      return Promise.reject(error);
    }

    try {
      const status = error.response?.status;
      const url = error.config?.url || "";

      // XỬ LÝ 405 METHOD NOT ALLOWED
      if (status === 405) {
        console.error("❌ Method Not Allowed (405):", error.response?.data);
        toast.error("API không hỗ trợ method này! Liên hệ admin.");
        return Promise.reject(error);
      }

      // XỬ LÝ 500 INTERNAL SERVER ERROR - Xử lý an toàn
      if (status >= 500) {
        console.error("❌ Server Error (500+):", status, error.response?.data);
        // Không cố parse JSON nếu response là undefined hoặc HTML
        toast.error("Lỗi hệ thống, vui lòng thử lại sau!");
        return Promise.reject(error);
      }

      // XỬ LÝ 401 UNAUTHORIZED - Redirect về /login
      if (status === 401) {
        const isAuthRequest =
          url.includes("/Auth/login") || url.includes("/TaiKhoan/login");

        // Nếu là request đăng nhập - KHÔNG làm gì cả
        if (isAuthRequest) {
          return Promise.reject(error);
        }

        // Kiểm tra nếu đang ở trang login thì không redirect
        const isOnLoginPage = window.location.pathname === "/login";
        const token = localStorage.getItem("token");
        const hasToken = !!token;
        const isExpired = hasToken ? isTokenExpired(token) : false;

        // Chỉ logout nếu token expired, không phải network fail hoặc auth request
        if (hasToken && isExpired && !isOnLoginPage) {
          console.log("Token expired, logging out...");

          console.warn(
            "🔴 Token hết hạn hoặc không hợp lệ - Redirecting to /login",
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
          window.location.href = "/login";
        }
      } else if (status === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (status >= 400) {
        // Handle other client errors (400, 404, etc.)
        const msg = error.response?.data?.message || error.response?.data;
        if (msg && typeof msg === "string") {
          const isNotLoginPage = !window.location.pathname.includes("/login");
          if (isNotLoginPage) {
            toast.error(msg);
          }
        }
      }
    } catch (e) {
      console.error("Lỗi xử lý interceptor:", e);
    }

    return Promise.reject(error);
  },
);

const handleResponse = (response) => {
  if (!response || !response.data) return null;
  return response.data;
};

export { handleResponse };
export default axiosInstance;
