import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { danhGiaSanPhamService } from "../../services/danhGiaSanPhamService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProductCard from "../../components/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ trungBinh: 0, tongSo: 0 });
  const [topRated, setTopRated] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maSP = product?.maSP || id;

  // Stars helper
  const renderStars = (num) =>
    "⭐".repeat(Math.floor(num)) + "☆".repeat(5 - Math.floor(num));

  useEffect(() => {
    console.log("🔍 ProductDetail: Loading ID:", id);
    setLoading(true);
    setError(null);
    productService
      .getById(id)
      .then((p) => {
        console.log("✅ Product loaded:", p?.maSP, p?.tenSP);
        setProduct(p);
        document.title = `${p?.tenSP || p?.tenSanPham || "Sản phẩm"} – TechStore`;
      })
      .catch((err) => {
        console.error("❌ ProductDetail getById failed:", id, err);
        setError(`Không tìm thấy sản phẩm ID: ${id}`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    fetchReviews();
  }, [product]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviewsRes = await danhGiaSanPhamService.getBySanPham(maSP);

      // Lấy data bất chấp việc service có tự động bóc tách .data hay chưa
      const data = reviewsRes?.data || reviewsRes;

      // Set danh sách review và thông số từ 1 API duy nhất
      setReviews(data?.chiTiet || []);
      setStats({
        trungBinh: data?.trungBinhSao || 0,
        tongSo: data?.tongDanhGia || 0,
      });

      const topRes = await danhGiaSanPhamService.getTopRated();
      setTopRated(topRes?.data?.data || topRes?.data || []);
    } catch (err) {
      console.error("Reviews API error:", err);
      // ... (Phần mock data fallback của bạn giữ nguyên) ...

      // Mock fallback data for offline testing
      const mockReviews = [
        {
          id: 1,
          tenKhachHang: "Nguyễn Văn A",
          sao: 5,
          noiDung: "Sản phẩm tuyệt vời, hiệu năng mạnh mẽ!",
          ngayDanhGia: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          tenKhachHang: "Trần Thị B",
          sao: 4,
          noiDung: "Chất lượng tốt, giao hàng nhanh.",
          ngayDanhGia: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ];
      setReviews(mockReviews);
      setStats({ trungBinh: 4.5, tongSo: 2 });
      setTopRated([]); // No top rated in mock

      toast.error("Sử dụng dữ liệu mẫu (backend offline)");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        maSP: parseInt(maSP),
        // Sửa tên trường thành 'soSao' và đảm bảo 'maKH' lấy đúng từ user.id nếu không có user.maKH
        soSao: rating,
        noiDung: content,
        maKH: user?.maKH || user?.id || user?.maKhachHang,
      };

      console.log("Dữ liệu gửi đi:", reviewData); // Xem ở Console xem đã đủ 4 trường chưa

      await danhGiaSanPhamService.create(reviewData);
      toast.success("Đánh giá đã được gửi thành công!");
      setContent("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error("Chi tiết lỗi:", err.response?.data);
      toast.error(err.response?.data?.message || "Lỗi gửi đánh giá. Thử lại!");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading)
    return (
      <div className="py-20">
        <LoadingSpinner />
      </div>
    );
  if (error || !product)
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😢</p>
        <p className="font-bold text-slate-600">{error}</p>
        <Link to="/products" className="btn-primary mt-4 inline-block">
          ← Quay lại
        </Link>
      </div>
    );

  const imgSrc =
    product.hinhAnh ||
    product.anhDaiDien ||
    `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.tenSP || product.tenSanPham)}`;

  const handleAdd = () => {
    setAdding(true);
    addItem(product, qty);
    setTimeout(() => setAdding(false), 600);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    if (product.soLuongTon === 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    setBuyingNow(true);

    const directBuyItem = {
      id: product.maSP || product.id,
      maSP: product.maSP || product.id,
      tenSP: product.tenSP || product.tenSanPham,
      tenSanPham: product.tenSP || product.tenSanPham,
      giaBan: product.giaBan || product.gia || product.donGia || 0,
      gia: product.gia || product.giaBan || product.donGia || 0,
      donGia: product.donGia || product.giaBan || product.gia || 0,
      hinhAnh: product.hinhAnh || product.anhDaiDien,
      soLuongTon: product.soLuongTon,
      quantity: qty,
    };

    try {
      toast.success("Chuyển đến trang thanh toán...");
      navigate("/checkout", { state: { directBuyItem } });
    } catch (e) {
      console.error("Lỗi navigate mua ngay:", e);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link to="/" className="hover:text-blue-600">
          Trang chủ
        </Link>
        <span>›</span>
        <Link to="/products" className="hover:text-blue-600">
          Sản phẩm
        </Link>
        <span>›</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
          {product.tenSP || product.tenSanPham}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="relative bg-slate-100 dark:bg-slate-700 rounded-3xl overflow-hidden h-80 lg:h-auto">
          {!imgLoaded && <div className="skeleton absolute inset-0" />}
          <img
            src={imgSrc}
            alt={product.tenSP || product.tenSanPham}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain p-8 transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
              {product.tenDanhMuc || product.danhMuc?.tenDanhMuc}
            </p>
            <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white leading-tight">
              {product.tenSP || product.tenSanPham}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatCurrency(product.giaBan || product.gia)}
            </span>
            {product.giaGoc > product.giaBan && (
              <span className="text-xl text-slate-400 line-through">
                {formatCurrency(product.giaGoc)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${product.soLuongTon > 0 ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`text-sm font-semibold ${product.soLuongTon > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {product.soLuongTon > 0
                ? `Còn ${product.soLuongTon} sản phẩm`
                : "Hết hàng"}
            </span>
          </div>

          {/* Description */}
          {product.moTa && (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {product.moTa}
            </p>
          )}

          {/* Qty & Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xl text-slate-600 dark:text-slate-300"
              >
                −
              </button>
              <span className="w-12 h-11 flex items-center justify-center font-bold text-slate-800 dark:text-white border-x border-slate-200 dark:border-slate-600">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-11 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xl text-slate-600 dark:text-slate-300"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.soLuongTon === 0 || adding}
              className={`flex-1 btn-primary py-3 flex items-center justify-center gap-2 ${adding ? "bg-green-600" : ""}`}
            >
              {adding ? "✓ Đã thêm!" : "🛒 Thêm vào giỏ"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.soLuongTon === 0 || buyingNow}
              className={`flex-1 btn-buynow-outline py-3 flex items-center justify-center gap-2 font-semibold ${buyingNow ? "opacity-70" : ""}`}
            >
              {buyingNow ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "⚡ Mua ngay"
              )}
            </button>
          </div>

          {/* Extra info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              ["🚚", "Giao hàng toàn quốc"],
              ["🔄", "Đổi trả 30 ngày"],
              ["🛡️", "Bảo hành chính hãng"],
              ["💬", "Hỗ trợ 24/7"],
            ].map(([icon, label]) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-8">
        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            ⭐ Trung bình đánh giá
          </h2>
          <div className="text-4xl mb-2">{renderStars(stats.trungBinh)}</div>
          <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
            {stats.trungBinh?.toFixed(1) || 0} ({stats.tongSo || 0} đánh giá)
          </p>
        </div>

        {/* Reviews List */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
            Đánh giá sản phẩm
          </h2>
          {loadingReviews ? (
            <LoadingSpinner />
          ) : reviews.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-12">
              Chưa có đánh giá nào.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews?.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {review.tenKH || "Khách hàng"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(review.ngayDanhGia).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="text-2xl mb-3">
                    {renderStars(review.soSao)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {review.noiDung}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            Viết đánh giá của bạn
          </h3>
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Đăng nhập để chia sẻ trải nghiệm của bạn!
              </p>
              <Link
                to="/login"
                className="btn-primary inline-flex items-center gap-2"
              >
                Đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Điểm số của bạn
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <span
                        className={`text-3xl ${
                          rating >= star
                            ? "text-yellow-400"
                            : "text-slate-300 dark:text-slate-500"
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-slate-500">
                    ({rating} sao)
                  </span>
                </div>
                {/* KẾT THÚC ĐOẠN DÁN */}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nhận xét
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows={4}
                  className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {content.length}/1000
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi đánh giá"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Top Rated Products */}
        {topRated.length > 0 && (
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
              Sản phẩm được đánh giá cao
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topRated?.map((p) => (
                <ProductCard key={p.maSP || p.id} product={p} />
              )) || null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
