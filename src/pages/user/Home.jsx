import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import ProductCard from "../../components/ProductCard";
import { SkeletonCard } from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "TechStore – Linh Kiện Điện Tử";

    // Load products using sanPhamService for correct data
    const loadProducts = async () => {
      try {
        console.log("Loading products from sanPhamService...");
        const data = await productService.getAll();
        console.log("Products loaded:", data?.length || 0, data);
        const prods = Array.isArray(data) ? data.slice(0, 8) : [];
        setProducts(prods);
      } catch (err) {
        console.error("Load products error:", err);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        const cats = Array.isArray(data) ? data : data?.data || [];
        setCategories(cats);
      } catch (err) {
        console.error("Load categories error:", err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadProducts(), loadCategories()]);
      } catch (err) {
        console.error("Fetch data error:", err);
        toast.error("Không thể tải dữ liệu sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryIcons = ["💻", "🖥️", "⌨️", "🖱️", "🪑", "🔌", "📡", "🔧"];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              ⚡ Linh kiện chính hãng • Giá tốt nhất
            </div>
            <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight mb-6">
              Cửa Hàng
              <br />
              <span className="text-blue-200">Linh Kiện</span>
              <br />
              Điện Tử
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Hàng nghìn linh kiện chính hãng từ các thương hiệu hàng đầu. Bảo
              hành uy tín, giao hàng nhanh toàn quốc.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all hover:shadow-lg active:scale-95"
              >
                Mua ngay →
              </Link>
              <Link
                to="/products"
                className="bg-white/20 backdrop-blur text-white font-bold px-8 py-3 rounded-xl hover:bg-white/30 transition-all"
              >
                Xem danh mục
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 bg-blue-900/40 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              ["10,000+", "Sản phẩm"],
              ["50,000+", "Khách hàng"],
              ["99%", "Hài lòng"],
              ["24/7", "Hỗ trợ"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black font-display">{n}</p>
                <p className="text-blue-200 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Danh mục sản phẩm
          </h2>
          <Link
            to="/products"
            className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(categories.length > 0 ? categories : Array(8).fill(null)).map(
            (cat, i) => (
              <Link
                key={cat?.maLoai || i}
                to={cat ? `/products?category=${cat.maLoai}` : "/products"}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {categoryIcons[i % categoryIcons.length]}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center line-clamp-2">
                  {cat?.tenLoai || `Danh mục ${i + 1}`}
                </span>
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Sản phẩm nổi bật
          </h2>
          <Link
            to="/products"
            className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-semibold text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4 inline-block"
            >
              Tải lại trang
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.maSP || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Promo banner */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display font-black text-3xl mb-4">
            🎉 Ưu đãi đặc biệt cho thành viên mới!
          </h2>
          <p className="text-blue-200 text-lg mb-6">
            Đăng ký ngay và nhận voucher giảm 10% cho đơn hàng đầu tiên
          </p>
          <Link
            to="/register"
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-3 rounded-xl transition-all hover:shadow-xl active:scale-95 inline-block"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
}
