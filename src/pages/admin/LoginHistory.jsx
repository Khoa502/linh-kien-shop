import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { loginHistoryService } from "../../services/loginHistoryService";
import LoadingSpinner from "../../components/LoadingSpinner";

const formatDateTime = (isoString) =>
  new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusColor = (status) =>
  status === "Thành công"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

const getDeviceIcon = (device) =>
  device.includes("Chrome")
    ? "🦊"
    : device.includes("Safari")
      ? "🍎"
      : device.includes("Firefox")
        ? "🦝"
        : device.includes("Edge")
          ? "🟦"
          : "💻";

export default function LoginHistory() {
  const [loginData, setLoginData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch function - now safe since service never throws
  const fetchLoginHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await loginHistoryService.getLoginHistory();
      // Extra safety - ensure array
      const data = Array.isArray(result.data) ? result.data : [];
      setLoginData(data);
      console.log(
        `📊 LoginHistory: ${data.length} records loaded successfully`,
      );

      if (data.length === 0) {
        console.info("ℹ️ No login history data - normal if no logins recorded");
      }
    } catch (err) {
      // Should never reach here due to service catch, but extra safety
      console.error("💥 Unexpected fetch error:", err);
      setError("Lỗi không xác định. Vui lòng refresh trang.");
      toast.error("Lỗi tải dữ liệu");
      setLoginData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize fetch to prevent recreation during renders
  const fetchLoginHistoryMemo = useCallback(fetchLoginHistory, []);

  useEffect(() => {
    document.title = "Lịch sử đăng nhập – TechStore Admin";

    // Initial fetch
    fetchLoginHistoryMemo();

    // Polling every 30s for real-time updates
    const interval = setInterval(fetchLoginHistoryMemo, 30000);

    return () => clearInterval(interval);
  }, [fetchLoginHistoryMemo]);

  const filteredData = loginData.filter((item) => {
    const customerName = item.customer?.name || "";
    const customerEmail = item.customer?.email || "";
    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Lịch sử đăng nhập
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredData.length} / {loginData.length} bản ghi
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 max-w-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[140px]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Thành công">Thành công</option>
          <option value="Thất bại">Thất bại</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {[
                  "ID",
                  "Khách hàng",
                  "Thời gian",
                  "Thiết bị",
                  "Trạng thái",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {error ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-red-500">
                    {error}.{" "}
                    <button
                      onClick={fetchLoginHistory}
                      className="underline hover:no-underline"
                    >
                      Thử lại
                    </button>
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-slate-400 dark:text-slate-500"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">
                      {item.id || "#N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {item.customer?.avatar || "👤"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-white truncate">
                            {item.customer?.name || "N/A"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.customer?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.loginTime ? formatDateTime(item.loginTime) : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getDeviceIcon(item.device || "")}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                          {item.device || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(item.status || "Unknown")}`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
