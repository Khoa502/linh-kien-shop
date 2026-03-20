import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 600);
  };

  // Hàm render sao
  const renderStars = (num) => {
    const rating = num || 0;
    return "⭐".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  // API fields: maSP, tenSP, giaBan, soLuongTon, hinhAnh, tenLoai, maLoai, trungBinhSao
  const id = product.maSP;
  const tenSP = product.tenSP || product.tenSanPham || "";
  const giaBan = product.giaBan || product.gia || 0;
  const tenLoai = product.tenLoai || product.tenDanhMuc || "Linh kiện";
  const ton = product.soLuongTon ?? 1;
  const imgSrc =
    product.hinhAnh ||
    product.anhDaiDien ||
    `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(tenSP.substring(0, 10) || "SP")}`;
  const trungBinhSao = product.trungBinhSao || 0; // Lấy số sao từ API, mặc định là 0

  return (
    <Link to={`/products/${id}`} className="group block">
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 bg-slate-100 dark:bg-slate-700 overflow-hidden">
          {!imgLoaded && <div className="skeleton absolute inset-0" />}
          <img
            src={imgSrc}
            alt={tenSP}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          {ton === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Vùng chứa Danh mục và Đánh giá (nằm ngang hàng nhau) */}
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
              {tenLoai}
            </p>

            {/* Hiển thị số sao */}
            <div className="flex items-center text-sm">
              <span className="text-xs font-bold text-slate-500 mr-1">
                {trungBinhSao > 0 ? trungBinhSao.toFixed(1) : ""}
              </span>
              <span className="text-yellow-400 text-xs tracking-tighter">
                {renderStars(trungBinhSao)}
              </span>
            </div>
          </div>

          <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {tenSP}
          </h3>

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                {formatCurrency(giaBan)}
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={ton === 0 || adding}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200
                ${
                  adding
                    ? "bg-green-500 scale-90"
                    : "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {adding ? "✓" : "+"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
