import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/products", label: "Sản phẩm", icon: "📦" },
  { to: "/admin/categories", label: "Danh mục", icon: "🗂️" },
  { to: "/admin/orders", label: "Đơn hàng", icon: "🛍️" },
  { to: "/admin/customers", label: "Khách hàng", icon: "👥" },
  { to: "/admin/tai-khoan", label: "Quản lý tài khoản", icon: "👤" },
  { to: "/admin/payments", label: "Thanh toán", icon: "💳" },
  { to: "/admin/imports", label: "Nhập kho", icon: "📥" },
  { to: "/admin/bao-hanh", label: "Bảo hành", icon: "🛡️" },
  { to: "/admin/login-history", label: "Lịch sử đăng nhập", icon: "📜" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
    ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-700 gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white flex-shrink-0 text-sm">
            ⚡
          </div>
          {sidebarOpen && (
            <span className="font-display font-black text-xl text-slate-900 dark:text-white">
              TechAdmin
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navCls}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.userName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {user?.userName || "Admin"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-semibold`}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            ☰
          </button>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <NavLink
              to="/"
              className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            >
              ← Trang người dùng
            </NavLink>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
