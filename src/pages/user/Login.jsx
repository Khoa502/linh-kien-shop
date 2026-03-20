import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, isAuthenticated, isAdmin, isNhanVien } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loginSuccessRef = useRef(false);

  // Nếu đã login và đã xử lý login thành công → redirect
  useEffect(() => {
    if (!isAuthenticated || loginSuccessRef.current) return;

    // Chỉ redirect nếu đang ở trang login và đã đăng nhập thành công
    if (window.location.pathname === "/login") {
      loginSuccessRef.current = true;
      if (isAdmin || isNhanVien) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isNhanVien, navigate]);

  // ============================================================
  // Xử lý submit form đăng nhập với try...catch...finally
  // đảm bảo loading được tắt khi xảy ra lỗi
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName.trim() || !form.password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setSubmitting(true);
    try {
      const u = await login({
        userName: form.userName.trim(),
        password: form.password,
      });
      toast.success(`Chào mừng ${u.userName}!`);

      // Set flag để useEffect biết là login thành công
      loginSuccessRef.current = true;

      // Redirect ngay lập tức
      if (u.role === "Admin" || u.role === "NhanVien") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      loginSuccessRef.current = false;

      // Hiện lỗi cụ thể từ server
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Đăng nhập thất bại!";
      toast.error(
        typeof serverMsg === "string"
          ? serverMsg
          : "Sai tên đăng nhập hoặc mật khẩu!",
      );
    } finally {
      // ✅ QUAN TRỌNG: Luôn tắt loading trong finally
      // để màn hình không bị kẹt khi API lỗi
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
              ⚡
            </div>
            <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Đăng nhập
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Chào mừng bạn trở lại TechStore!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  👤
                </span>
                <input
                  type="text"
                  placeholder="Nhập username..."
                  value={form.userName}
                  onChange={(e) =>
                    setForm({ ...form, userName: e.target.value })
                  }
                  className="input-field pl-10"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔒
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="input-field pl-10 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập →"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
