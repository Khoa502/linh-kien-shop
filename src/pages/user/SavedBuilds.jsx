import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { buildPCService } from "../../services/buildPCService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function SavedBuilds() {
  const { user } = useAuth();
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Cấu hình của tôi - TechStore";
    loadSavedBuilds();
  }, [user?.maKH]);

  const loadSavedBuilds = async () => {
    if (!user?.maKH) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await buildPCService.getCauHinhDaLuu(user.maKH);
      setSavedBuilds(data || []);
    } catch (err) {
      console.error("Failed to load saved builds:", err);
      setError("Không thể tải danh sách cấu hình. Vui lòng thử lại sau.");
      toast.error("Không thể tải danh sách cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button onClick={loadSavedBuilds} className="btn-primary mt-4">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white mb-2">
          🖥️ Cấu hình của tôi
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý các cấu hình máy tính bạn đã lưu
        </p>
      </div>

      {/* Empty state */}
      {!savedBuilds || savedBuilds.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
            Bạn chưa lưu cấu hình nào
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Hãy truy cập trang Build PC để tạo và lưu cấu hình máy tính của bạn
          </p>
          <a href="/build-pc" className="btn-primary inline-block">
            🛠️ Tạo cấu hình ngay
          </a>
        </div>
      ) : (
        /* Saved builds grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBuilds.map((build, index) => (
            <BuildCard
              key={build.maCauHinh || build.id || index}
              build={build}
              setSavedBuilds={setSavedBuilds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BuildCard({ build, setSavedBuilds }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Get components list - handle various API response formats
  const components =
    build.danhSachLinhKien || build.linhKiens || build.components || [];

  // Get build name and total price
  const tenCauHinh = build.tenCauHinh || build.tenCauHinh || "Cấu hình của tôi";
  const tongTien = build.tongTien || build.tongTien || 0;
  const ngayTao = build.ngayTao || build.createdAt || build.ngayTao;
  const buildId = build.maCauHinh || build.id;

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Handle "Mua" button - navigate to checkout with formatted items
  const handleBuyNow = () => {
    // Map components to checkout format
    const formattedItems = components.map((item) => ({
      maSP: item.maSP || item.maLinhKien || item.id || item.idSanPham,
      tenSP:
        item.tenSP ||
        item.tenSanPham ||
        item.name ||
        item.tenLinhKien ||
        "Linh kiện",
      giaBan: item.gia || item.giaBan || item.donGia || item.price || 0,
      donGia: item.gia || item.giaBan || item.donGia || item.price || 0,
      hinhAnh: item.anhDaiDien || item.hinhAnh || item.image || null,
      soLuong: 1,
      quantity: 1,
    }));

    if (formattedItems.length === 0) {
      toast.error("Cấu hình không có linh kiện nào!");
      return;
    }

    // Navigate to checkout with buyNowItems
    navigate("/checkout", { state: { buyNowItems: formattedItems } });
  };

  // Handle "Chỉnh sửa" button - navigate to Build PC page with build data
  const handleEditBuild = () => {
    navigate("/build-pc", { state: { editBuildData: build } });
  };

  // Handle "Xóa" button - delete the build with confirmation
  const handleDeleteBuild = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa cấu hình này không?",
    );

    if (!confirmed) return;

    try {
      await buildPCService.xoaCauHinh(buildId);
      toast.success("Xóa cấu hình thành công!");

      // Update the state to remove the deleted build
      setSavedBuilds((prevBuilds) =>
        prevBuilds.filter((b) => (b.maCauHinh || b.id) !== buildId),
      );
    } catch (error) {
      console.error("Failed to delete build:", error);
      toast.error("Xóa cấu hình thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Build header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            {tenCauHinh}
          </h3>
          {ngayTao && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ngày tạo: {formatDate(ngayTao)}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">
            {formatCurrency(tongTien)}
          </div>
        </div>
      </div>

      {/* Components list */}
      <div className="mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {expanded ? "▼" : "▶"} Xem chi tiết linh kiện ({components.length})
        </button>

        {expanded && (
          <div className="mt-2 space-y-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 max-h-64 overflow-y-auto">
            {components.length > 0 ? (
              components.map((item, idx) => (
                <ComponentItem key={idx} item={item} />
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                Không có thông tin linh kiện
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={handleEditBuild}
          className="flex-1 btn-secondary text-sm py-2 text-center"
        >
          ✏️ Chỉnh sửa
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 btn-primary text-sm py-2"
        >
          🛒 Mua ngay
        </button>
        <button
          onClick={handleDeleteBuild}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
          title="Xóa cấu hình"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
}

function ComponentItem({ item }) {
  // Handle various API response formats for component
  const tenSP =
    item.tenSP ||
    item.tenSanPham ||
    item.name ||
    item.tenLinhKien ||
    "Linh kiện";
  const gia = item.gia || item.giaBan || item.donGia || item.price || 0;
  const loai = item.loai || item.loaiLinhKien || item.type || "";

  // Icon mapping based on component type
  const getIcon = (type) => {
    const typeLower = String(type).toLowerCase();
    if (typeLower.includes("cpu")) return "🧠";
    if (typeLower.includes("mainboard") || typeLower.includes("bo mạch"))
      return "🔌";
    if (typeLower.includes("ram")) return "💾";
    if (typeLower.includes("gpu") || typeLower.includes("card")) return "🎮";
    if (typeLower.includes("ssd") || typeLower.includes("ổ cứng")) return "💿";
    if (typeLower.includes("psu") || typeLower.includes("nguồn")) return "⚡";
    if (typeLower.includes("case") || typeLower.includes("vỏ")) return "🏠";
    return "🔧";
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon(loai)}</span>
        <span className="text-slate-700 dark:text-slate-300 line-clamp-1">
          {tenSP}
        </span>
      </div>
      <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
        {formatCurrency(gia)}
      </span>
    </div>
  );
}
