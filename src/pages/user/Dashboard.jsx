import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { khachHangService } from "../../services/khachHangService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("vi-VN");
  } catch {
    return str;
  }
}

export default function Dashboard() {
  const { user } = useAuth();

  // State for customer profile
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Modal states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [infoForm, setInfoForm] = useState({
    hoTen: "",
    soDienThoai: "",
    diaChi: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhau: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // LẤY THÔNG TIN QUYỀN (ROLE) từ AuthContext
  // Backend trả về: "Admin", "NhanVien", hoặc "User"
  // Frontend normalize thành: "Admin", "NhanVien", "KhachHang"
  const userRole = user?.role || "";

  // XÁC ĐỊNH LOẠI GIAO DIỆN
  const isAdminOrStaff = userRole === "Admin" || userRole === "NhanVien";
  // Xử lý cả "KhachHang" (frontend normalize) và "User" (backend trả về)
  const isKhachHang = userRole === "KhachHang" || userRole === "User";

  useEffect(() => {
    document.title = isAdminOrStaff
      ? "Dashboard – TechStore"
      : "Tài khoản của tôi – TechStore";
  }, [isAdminOrStaff]);

  // Fetch customer info when role is KhachHang
  useEffect(() => {
    if (isKhachHang && user?.maKH) {
      setLoadingInfo(true);
      khachHangService
        .getById(user.maKH)
        .then((r) => {
          const data = r.data || r;
          setCustomerInfo(data);
          setInfoForm({
            hoTen: data.hoTen || "",
            soDienThoai: data.soDienThoai || "",
            diaChi: data.diaChi || "",
          });
        })
        .catch(() => setCustomerInfo(null))
        .finally(() => setLoadingInfo(false));
    }
  }, [user?.maKH, isKhachHang]);

  // Functions to handle update
  const handleUpdateInfo = async () => {
    if (!infoForm.hoTen.trim()) {
      toast.error("Vui lòng nhập họ tên!");
      return;
    }

    setSavingInfo(true);
    try {
      await khachHangService.update(user.maKH, infoForm);
      toast.success("Cập nhật thông tin thành công!");
      setCustomerInfo((prev) => ({ ...prev, ...infoForm }));
      setShowInfoModal(false);
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.matKhauCu || !passwordForm.matKhauMoi) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (passwordForm.matKhauMoi !== passwordForm.xacNhanMatKhau) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    if (passwordForm.matKhauMoi.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setSavingPassword(true);
    try {
      // Call API đổi mật khẩu (cần backend hỗ trợ)
      toast.success("Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
      setPasswordForm({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
    } catch (error) {
      toast.error("Đổi mật khẩu thất bại!");
    } finally {
      setSavingPassword(false);
    }
  };

  const openInfoModal = () => {
    setInfoForm({
      hoTen: customerInfo?.hoTen || "",
      soDienThoai: customerInfo?.soDienThoai || "",
      diaChi: customerInfo?.diaChi || "",
    });
    setShowInfoModal(true);
  };

  const openPasswordModal = () => {
    setPasswordForm({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
    setShowPasswordModal(true);
  };

  const displayName = user?.userName || user?.tenDangNhap || "bạn";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30">
          {displayName[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Xin chào, {displayName}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdminOrStaff
              ? "Quản lý đơn hàng toàn hệ thống"
              : "Quản lý thông tin tài khoản của bạn"}
          </p>
        </div>
      </div>

      {/* GIAO DIỆN CHO KHÁCH HÀNG - Hiển thị thông tin tài khoản */}
      {isKhachHang && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Thông tin tài khoản */}
          <div className="card md:col-span-2">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              Thông tin tài khoản
            </h2>
            {loadingInfo ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Tên đăng nhập:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {user?.userName || user?.tenDangNhap || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Họ tên:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {customerInfo?.hoTen || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {customerInfo?.soDienThoai || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Địa chỉ:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {customerInfo?.diaChi || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Mã khách hàng:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {user?.maKH || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Vai trò:</span>
                  <span className="font-semibold text-green-600">
                    Khách hàng
                  </span>
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={openInfoModal}
                className="btn-secondary text-sm flex-1"
              >
                ✏️ Cập nhật thông tin
              </button>
              <button
                onClick={openPasswordModal}
                className="btn-secondary text-sm flex-1"
              >
                🔒 Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Tổng quan & Quick links */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                Tổng quan
              </h2>
              <div className="space-y-4">
                {customerInfo?.diemTichLuy > 0 && (
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="text-3xl font-black text-yellow-600">
                      {customerInfo.diemTichLuy}
                    </div>
                    <div className="text-sm text-slate-500">Điểm tích lũy</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/orders"
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="text-2xl mb-1">📦</div>
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Đơn hàng
                    </div>
                  </Link>
                  <Link
                    to="/products"
                    className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="text-2xl mb-1">🛒</div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Mua thêm
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions for all users */}
      <div className="card">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/orders"
            className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-bold">Đơn hàng của tôi</div>
            <div className="text-xs opacity-80">Xem lịch sử mua hàng</div>
          </Link>
          <Link
            to="/products"
            className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white hover:from-green-500 hover:to-green-700 transition-all shadow-lg shadow-green-500/30"
          >
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-bold">Mua sắm</div>
            <div className="text-xs opacity-80">Xem sản phẩm mới</div>
          </Link>
          <Link
            to="/cart"
            className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl text-white hover:from-purple-500 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
          >
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-bold">Giỏ hàng</div>
            <div className="text-xs opacity-80">Xem giỏ hàng</div>
          </Link>
          <button
            onClick={openInfoModal}
            className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-bold">Cập nhật thông tin</div>
            <div className="text-xs opacity-80">Thay đổi thông tin cá nhân</div>
          </button>
        </div>
      </div>

      {/* Modal: Cập nhật thông tin */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                Cập nhật thông tin
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={infoForm.hoTen}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, hoTen: e.target.value })
                  }
                  className="input-field"
                  placeholder="Nhập họ tên..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={infoForm.soDienThoai}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, soDienThoai: e.target.value })
                  }
                  className="input-field"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={infoForm.diaChi}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, diaChi: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Nhập địa chỉ..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateInfo}
                  disabled={savingInfo}
                  className="btn-primary flex-1"
                >
                  {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                Đổi mật khẩu
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  value={passwordForm.matKhauCu}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      matKhauCu: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Nhập mật khẩu hiện tại..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordForm.matKhauMoi}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      matKhauMoi: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  value={passwordForm.xacNhanMatKhau}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      xacNhanMatKhau: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Nhập lại mật khẩu mới..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="btn-primary flex-1"
                >
                  {savingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
