import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTS = ["Chờ xử lý", "Đang xử lý", "Đã thanh toán", "Đã hủy"];
const STATUS_COLOR = {
  "Chờ xử lý":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Đang xử lý":
    "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
  "Đã thanh toán":
    "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400",
  "Đã hủy":
    "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400",
};

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("vi-VN");
  } catch {
    return str;
  }
}

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Đơn hàng của tôi – TechStore";
    load();
  }, []);

  const load = () => {
    setLoading(true);

    // Kiểm tra role của user
    // Backend trả về: "Admin", "NhanVien", hoặc "User" (từ PhanQuyen.TenQuyen)
    // Frontend normalize thành: "Admin", "NhanVien", "KhachHang"
    const userRole = user?.role || "";
    const isAdminOrStaff = userRole === "Admin" || userRole === "NhanVien";

    // Nếu là Admin/NhanVien: gọi API lấy tất cả đơn hàng
    // Nếu là User/KhachHang: gọi API lấy đơn hàng theo mã khách hàng
    const apiCall = isAdminOrStaff
      ? orderService.getAll()
      : user?.maKH
        ? orderService.getByKhachHang(user.maKH)
        : Promise.resolve({ data: [] });

    apiCall
      .then((r) => {
        const allOrders = Array.isArray(r.data) ? r.data : r.data?.data || [];

        // Nếu là Admin đã gọi getAll thì không cần filter
        // Nếu là User (getByKhachHang) thì API đã trả về đơn hàng của user đó
        setOrders(allOrders);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const filtered = orders.filter((o) => {
    const matchFilter = !filter || o.trangThai === filter;
    const matchSearch =
      !search ||
      (o.maHoaDon || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.tenKH || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Tính thống kê
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.trangThai === "Chờ xử lý").length,
    processing: orders.filter((o) => o.trangThai === "Đang xử lý").length,
    paid: orders.filter((o) => o.trangThai === "Đã thanh toán").length,
    cancelled: orders.filter((o) => o.trangThai === "Đã hủy").length,
    totalSpent: orders.reduce(
      (s, o) => s + (o.thanhTien || o.tongTien || 0),
      0,
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Đơn hàng của tôi
          </h1>
          <p className="text-slate-500 text-sm">{orders.length} đơn hàng</p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã hóa đơn..."
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card text-center p-4">
          <div className="text-2xl font-black text-blue-600">{stats.total}</div>
          <div className="text-xs text-slate-500 font-medium">Tổng đơn</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl font-black text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-xs text-slate-500 font-medium">Chờ xử lý</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl font-black text-blue-600">
            {stats.processing}
          </div>
          <div className="text-xs text-slate-500 font-medium">Đang xử lý</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl font-black text-green-600">{stats.paid}</div>
          <div className="text-xs text-slate-500 font-medium">
            Đã thanh toán
          </div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl font-black text-purple-600">
            {formatCurrency(stats.totalSpent)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Tổng chi tiêu
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", ...STATUS_OPTS].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {s || "Tất cả"} (
            {s ? orders.filter((o) => o.trangThai === s).length : orders.length}
            )
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {[
                    "Mã HĐ",
                    "Ngày đặt",
                    "Sản phẩm",
                    "Thanh toán",
                    "Hình thức",
                    "Trạng thái",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="font-bold text-slate-600 dark:text-slate-400">
                          Chưa có đơn hàng nào
                        </p>
                        <Link
                          to="/products"
                          className="btn-primary mt-4 inline-block px-6"
                        >
                          Mua ngay
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr
                      key={o.maHD}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {o.maHoaDon || `HD${o.maHD}`}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(o.ngayBan || o.ngayDat)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs">
                        <div className="line-clamp-2 text-xs">
                          {o.sanPhams && o.sanPhams.length > 0
                            ? o.sanPhams
                                .map((sp) => `${sp.tenSP} (x${sp.soLuong})`)
                                .join(", ")
                            : o.tenSP || o.sanPham || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                        {formatCurrency(o.thanhTien || o.tongTien)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {o.hinhThucThanhToan || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                            STATUS_COLOR[o.trangThai] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {o.trangThai || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/orders/${o.maHD}/tracking`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Chi tiết →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
