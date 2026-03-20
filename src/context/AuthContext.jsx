import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import { decodeToken } from "../utils/decodeToken";
import { safeJsonParse, safeGetLocalStorage } from "../utils/safeJsonParse";
import { isTokenExpired } from "../utils/decodeToken";
import toast from "react-hot-toast";

const AuthContext = createContext();

function normalizeRole(data) {
  // Thử tất cả tên field có thể có
  const raw =
    data.tenQuyen ||
    data.role ||
    data.roles?.[0] ||
    data.Role ||
    data.permission ||
    data.userType ||
    data.quyen ||
    data.quyenTen ||
    "";
  const lower = String(raw).toLowerCase().trim();

  if (lower === "admin") return "Admin";
  if (
    lower === "nhanvien" ||
    lower === "nhan vien" ||
    lower === "staff" ||
    lower === "nv"
  )
    return "NhanVien";
  if (
    lower === "khachhang" ||
    lower === "khach hang" ||
    lower === "user" ||
    lower === "customer" ||
    lower === "kh"
  )
    return "KhachHang";

  // Fallback by roleID
  const rid = Number(
    data.roleID || data.RoleID || data.roleId || data.maQuyen || 0,
  );

  if (rid === 1) return "Admin";
  if (rid === 2) return "NhanVien";
  if (rid === 3) return "KhachHang";

  // Default to KhachHang if nothing matches
  return "KhachHang";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session từ localStorage với safe helpers
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUserData = safeGetLocalStorage("user", null);

      // 🆕 ENHANCED DEBUG: Add expiry details
      const isExpired = token ? isTokenExpired(token) : true;
      const decoded = token ? decodeToken(token) : null;
      const expTime = decoded?.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : "N/A";
      /* console.log("🔍 AuthContext Restore [DEBUG]:", {
        hasToken: !!token,
        tokenPreview: token ? `${token.slice(0, 20)}...` : null,
        hasUserData: !!savedUserData,
        isObject: savedUserData && typeof savedUserData === "object",
        userPreview:
          savedUserData?.tenDangNhap || savedUserData?.userName || "MISSING",
        isExpired,
        expTime, // Token expiry timestamp
        now: new Date().toISOString(),
        timeLeft: decoded?.exp
          ? Math.round((decoded.exp * 1000 - Date.now()) / 1000 / 60) + "min"
          : "N/A",
      });*/

      // 🚨 TEMP BYPASS EXPIRY CHECK FOR DEBUG - RE-ENABLE AFTER TESTING
      if (
        token && // COMMENTED: && !isTokenExpired(token)  ← Bypass expiry check
        savedUserData &&
        typeof savedUserData === "object"
      ) {
        // Validate required fields
        if (savedUserData.userName || savedUserData.tenDangNhap) {
          setUser({
            userName: savedUserData.tenDangNhap || savedUserData.userName || "",
            tenDangNhap: savedUserData.tenDangNhap || "",
            roleID: savedUserData.roleID,
            role: savedUserData.role,
            userId: savedUserData.userId || null,
            maNV: savedUserData.maNV || null,
            maKH: savedUserData.maKH || null,
          });
        } else {
          console.warn("Invalid user data structure in localStorage");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        /*console.warn("❌ Session restore failed:", {
          token: !!token,
          hasUserData: !!savedUserData,
          isExpired: token ? isTokenExpired(token) : true,
        });*/
        // Clear invalid data
        if (!token || !savedUserData) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      /* console.log(
        `✅ AuthContext restore complete. User: ${user ? user.userName : "null"} ` +
          `(expiry bypassed: ${isExpired ? "YES - token was expired" : "NO"})`,
      );*/
    } catch (error) {
      console.error("Lỗi khôi phục session:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({ userName, password }) => {
    // Gọi API chính thức /api/Auth/login trả về JWT thật
    const res = await axiosInstance.post("/Auth/login", {
      tenDangNhap: userName,
      matKhau: password,
    });
    const data = res.data;

    // Tìm token - thử nhiều tên field
    const token =
      data.token ||
      data.accessToken ||
      data.Token ||
      data.jwt ||
      data.bearerToken ||
      data.access_token;
    if (!token) {
      throw new Error(
        "API không trả về token. Kiểm tra Console > Network tab.",
      );
    }

    localStorage.setItem("token", token);

    // Decode token để lấy userId/maKH
    const decodedToken = decodeToken(token);

    // Tìm userId (TaiKhoanID) từ nguồn phù hợp
    // Lưu ý: userId là ID tài khoản, KHÁC với maKH (mã khách hàng)
    const userId =
      data.userId ||
      data.userID ||
      data.taiKhoanID ||
      data.accountId ||
      decodedToken?.sub ||
      decodedToken?.userId ||
      decodedToken?.nameid ||
      decodedToken?.id ||
      null;

    // Tìm customer ID (maKH) - chỉ có khi đăng nhập là khách hàng
    const maKH =
      data.maKH ||
      data.maKhachHang ||
      decodedToken?.maKH ||
      decodedToken?.maKhachHang ||
      null;

    // API mới trả về trường "role" thay vì "tenQuyen"
    const role = normalizeRole(data);

    // Tìm employee ID (maNV) - chỉ có khi đăng nhập là nhân viên
    const maNV = data.maNV || data.maNhanVien || null;

    const userInfo = {
      userName: data.tenDangNhap || data.userName || userName,
      tenDangNhap: data.tenDangNhap || userName,
      roleID: data.roleID || data.RoleID || data.roleId,
      role, // Lưu role thay vì tenQuyen
      userId: userId || null, // Lưu userId để dùng cho Cart và Checkout
      maNV: maNV || null, // Lưu employee ID nếu là nhân viên
      maKH: maKH || null, // Lưu customer ID nếu là khách hàng
    };

    // ✅ CRITICAL FIX: Validate before saving to prevent "undefined" JSON
    if (
      userInfo &&
      userInfo.userName &&
      userInfo.tenDangNhap &&
      typeof userInfo === "object"
    ) {
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);
      //console.log("✅ User session saved successfully:", userInfo.userName);
      return userInfo;
    } else {
      console.error("❌ Invalid userInfo, clearing storage:", userInfo);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Invalid user data from login API");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Đã đăng xuất!");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "Admin";
  const isNhanVien = user?.role === "NhanVien" || isAdmin;
  const isKhachHang = user?.role === "KhachHang";
  const hasRole = (roles = []) => !!(user && roles.includes(user.role));

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        isAdmin,
        isNhanVien,
        isKhachHang,
        hasRole,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
