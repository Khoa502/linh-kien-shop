import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { thanhToanService } from "../../services/thanhToanService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleString("vi-VN");
  } catch {
    return str;
  }
}

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Handle view payment details
  const handleViewDetails = async (payment) => {
    setShowModal(true);
    setSelectedPayment(null);
    setLoadingDetails(true);

    try {
      const response = await thanhToanService.getById(payment.maThanhToan);
      // API trả về response.data chứa object thanh toán
      setSelectedPayment(response.data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      // Fallback to existing data if API fails
      setSelectedPayment(payment);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  useEffect(() => {
    document.title = "Quản lý thanh toán – TechStore";
    orderService
      .getPayments()
      .then((r) =>
        setPayments(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + (p.soTien || 0), 0);
  const success = payments.filter((p) => p.trangThai === "DaThanhToan").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
          Quản lý thanh toán
        </h1>
        <p className="text-slate-500 text-sm">{payments.length} giao dịch</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "💳",
            value: payments.length,
            label: "Tổng giao dịch",
            color: "text-blue-600",
          },
          {
            icon: "✅",
            value: success,
            label: "Thành công",
            color: "text-green-600",
          },
          {
            icon: "💰",
            value: formatCurrency(total),
            label: "Tổng giá trị",
            color: "text-amber-600",
          },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-extrabold ${s.color}`}>
              {s.value}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
          </div>
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
                    "Mã TT",
                    "Mã giao dịch",
                    "Mã hóa đơn",
                    "Phương thức",
                    "Số tiền",
                    "Trạng thái",
                    "Ngày thanh toán",
                    "Chi tiết",
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
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-slate-400"
                    >
                      Chưa có giao dịch
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p.maThanhToan}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {p.maThanhToan}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {p.maGiaoDich || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {p.maHoaDon || `HD${p.maHD}`}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.tenPhuongThuc || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                        {formatCurrency(p.soTien)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            p.trangThai === "DaThanhToan"
                              ? "bg-green-100 text-green-700"
                              : p.trangThai?.toLowerCase().includes("hủy")
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.trangThai || "Chờ xử lý"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(p.ngayThanhToan)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi tiết thanh toán */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                Chi tiết thanh toán
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : selectedPayment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Mã thanh toán:
                    </span>
                    <span className="col-span-2 font-mono font-semibold text-slate-900 dark:text-white">
                      {selectedPayment.maThanhToan || "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Mã hóa đơn:
                    </span>
                    <span className="col-span-2 font-semibold text-blue-600 dark:text-blue-400">
                      {selectedPayment.maHoaDon ||
                        `HD${selectedPayment.maHD}` ||
                        "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Khách hàng:
                    </span>
                    <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                      {selectedPayment.tenKH || selectedPayment.hoTen || "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Phương thức:
                    </span>
                    <span className="col-span-2 text-slate-900 dark:text-white">
                      {selectedPayment.tenPhuongThuc || "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Số tiền:
                    </span>
                    <span className="col-span-2 font-bold text-amber-600">
                      {formatCurrency(selectedPayment.soTien)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Ngày thanh toán:
                    </span>
                    <span className="col-span-2 text-slate-900 dark:text-white">
                      {formatDate(selectedPayment.ngayThanhToan)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Trạng thái:
                    </span>
                    <span className="col-span-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          selectedPayment.trangThai === "DaThanhToan"
                            ? "bg-green-100 text-green-700"
                            : selectedPayment.trangThai
                                  ?.toLowerCase()
                                  .includes("hủy")
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {selectedPayment.trangThai || "Chờ xử lý"}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500">Không có dữ liệu</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={closeModal} className="w-full btn-secondary">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
