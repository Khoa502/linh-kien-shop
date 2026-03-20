import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

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

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Quản lý đơn hàng – TechStore";
    load();
  }, []);

  const load = () => {
    setLoading(true);
    orderService
      .getAll()
      .then((r) =>
        setOrders(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const updateStatus = async (maHD, status) => {
    try {
      // Tìm order hiện tại để lấy đầy đủ thông tin
      const currentOrder = orders.find((o) => o.maHD === maHD);
      if (!currentOrder) {
        toast.error("Không tìm thấy đơn hàng!");
        return;
      }

      // Tạo payload với maHD bắt buộc (phải khớp với URL)
      const payload = {
        ...currentOrder,
        maHD: maHD,
        trangThai: status,
      };

      const response = await orderService.update(maHD, payload);

      // Kiểm tra response trước khi xử lý data
      if (!response || response.status === undefined) {
        console.error("Response không hợp lệ:", response);
        toast.error("Phản hồi từ server không hợp lệ!");
        return;
      }

      toast.success("Cập nhật trạng thái thành công!");
      setOrders((prev) =>
        prev.map((o) => (o.maHD === maHD ? { ...o, trangThai: status } : o)),
      );
    } catch (error) {
      // Log chi tiết lỗi từ server để debug
      console.error("❌ Lỗi chi tiết từ Backend:", error.response?.data);

      // Trích xuất thông báo lỗi từ server
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.title ||
        JSON.stringify(error.response?.data);

      // Xử lý lỗi chi tiết theo status code
      const statusCode = error.response?.status;

      if (statusCode === 405) {
        toast.error(
          `Cập nhật thất bại: Method không được hỗ trợ! Chi tiết: ${serverMessage}`,
        );
      } else if (statusCode >= 500) {
        toast.error(
          `Cập nhật thất bại: Lỗi server! Chi tiết: ${serverMessage}`,
        );
      } else if (statusCode >= 400) {
        toast.error(`Cập nhật thất bại: ${serverMessage}`);
      } else if (
        error.message?.includes("Network") ||
        error.message?.includes("fetch")
      ) {
        toast.error("Cập nhật thất bại: Lỗi kết nối mạng!");
      } else {
        toast.error(`Cập nhật thất bại: ${serverMessage}`);
      }
    }
  };

  const handleDelete = async (maHD) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng đã hủy này không?",
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Đang xóa đơn hàng:", maHD);
      await orderService.delete(maHD);
      console.log("✅ Xóa đơn hàng thành công!");
      toast.success("Xóa đơn hàng thành công!");
      // Cập nhật state để xóa dòng khỏi giao diện ngay lập tức
      setOrders((prev) => prev.filter((o) => o.maHD !== maHD));
    } catch (error) {
      console.error("❌ Lỗi khi xóa đơn hàng:", error);
      console.error("❌ Chi tiết lỗi từ Backend:", error.response?.data);

      // Trích xuất thông báo lỗi từ server
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.title ||
        JSON.stringify(error.response?.data);

      toast.error(`Xóa đơn hàng thất bại: ${serverMessage}`);
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = !filter || o.trangThai === filter;
    const matchSearch =
      !search ||
      (o.tenKH || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.maHoaDon || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Quản lý đơn hàng
          </h1>
          <p className="text-slate-500 text-sm">{orders.length} hóa đơn</p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên KH, mã HĐ..."
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", ...STATUS_OPTS].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
          >
            {s || "Tất cả"} (
            {s ? orders.filter((o) => o.trangThai === s).length : orders.length}
            )
          </button>
        ))}
      </div>

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
                    "Mã đơn hàng",
                    "Ngày bán",
                    "Khách hàng",
                    "Nhân viên",
                    "Thanh toán",
                    "Hình thức",
                    "Trạng thái",
                    "Cập nhật",
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
                    <td
                      colSpan={9}
                      className="text-center py-12 text-slate-400"
                    >
                      Không có hóa đơn
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
                        {formatDate(o.ngayBan)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        {o.tenKH || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {o.tenNV || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                        {formatCurrency(o.thanhTien || o.tongTien)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {o.hinhThucThanhToan || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[o.trangThai] || "bg-slate-100 text-slate-600"}`}
                        >
                          {o.trangThai || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.trangThai || ""}
                          onChange={(e) => updateStatus(o.maHD, e.target.value)}
                          className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>
                            Chọn...
                          </option>
                          {STATUS_OPTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {o.trangThai === "Đã hủy" && (
                          <button
                            onClick={() => handleDelete(o.maHD)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Xóa
                          </button>
                        )}
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
