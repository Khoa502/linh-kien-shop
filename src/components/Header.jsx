import { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  const { user, isAuthenticated, logout, isAdmin, isNhanVien } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const canManage = isAdmin || isNhanVien;

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
  };

  const navCls = ({ isActive }) =>
    `font-semibold transition-colors px-1 py-0.5 rounded ${
      isActive
        ? "text-blue-600 dark:text-blue-400"
        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-black text-2xl"
          >
            <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-sm shadow">
              ⚡
            </span>
            <span className="text-slate-900 dark:text-white">
              Tech<span className="text-blue-600">Store</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navCls}>
              Trang Chủ
            </NavLink>
            <NavLink to="/products" className={navCls}>
              Sản Phẩm
            </NavLink>
            <NavLink to="/build-pc" className={navCls}>
              Build PC
            </NavLink>
            {canManage && (
              <>
                <NavLink to="/admin" className={navCls}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/orders" className={navCls}>
                  Quản Lý
                </NavLink>
              </>
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <DarkModeToggle />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            >
              🛒
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
                    {user?.userName || "Quản trị viên"}
                  </span>
                  <span className="text-xs text-slate-400">▾</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-600 py-2 z-50">
                    <Link
                      to={canManage ? "/admin" : "/dashboard"}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl mx-1"
                    >
                      {canManage ? "📊 Dashboard" : "👤 Tài khoản của tôi"}
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl mx-1"
                    >
                      📦 Đơn hàng
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl mx-1"
                    >
                      🛒 Giỏ hàng
                    </Link>
                    {canManage && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl mx-1"
                      >
                        ⚙️ Quản lý
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100 dark:border-slate-600" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl mx-1"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 hidden sm:block"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-700 py-3 space-y-1">
            <NavLink
              to="/"
              end
              className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Trang Chủ
            </NavLink>
            <NavLink
              to="/products"
              className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Sản Phẩm
            </NavLink>
            <NavLink
              to="/build-pc"
              className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Build PC
            </NavLink>
            {canManage && (
              <>
                <NavLink
                  to="/admin"
                  className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/orders"
                  className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Quản Lý
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
