import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    hoTen: "",
    email: "",
    soDienThoai: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setSubmitting(true);
    try {
      await authService.register({
        userName: form.userName,
        password: form.password,
        hoTen: form.hoTen,
        email: form.email,
        soDienThoai: form.soDienThoai,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Đăng ký thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
              ✨
            </div>
            <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Tạo tài khoản
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Tham gia TechStore ngay hôm nay!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                key: "userName",
                label: "Tên đăng nhập *",
                icon: "👤",
                placeholder: "Chọn username...",
                type: "text",
                autoComplete: "off",
              },
              {
                key: "hoTen",
                label: "Họ và tên",
                icon: "📝",
                placeholder: "Nhập họ tên...",
                type: "text",
                autoComplete: "off",
              },
              {
                key: "email",
                label: "Email",
                icon: "📧",
                placeholder: "Nhập email...",
                type: "email",
                autoComplete: "off",
              },
              {
                key: "soDienThoai",
                label: "Số điện thoại",
                icon: "📱",
                placeholder: "Nhập SĐT...",
                type: "tel",
                // ✅ CHỐNG AUTOFILL: autoComplete="new-password" để trình duyệt không tự điền "admin"
                autoComplete: "new-password",
              },
              {
                key: "password",
                label: "Mật khẩu *",
                icon: "🔒",
                placeholder: "Tối thiểu 6 ký tự...",
                type: "password",
                autoComplete: "new-password",
              },
              {
                key: "confirmPassword",
                label: "Xác nhận mật khẩu *",
                icon: "🔐",
                placeholder: "Nhập lại mật khẩu...",
                type: "password",
                autoComplete: "new-password",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {f.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {f.icon}
                  </span>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    autoComplete={f.autoComplete || "off"}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
