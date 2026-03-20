import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import { nhaCungCapService } from "../../services/otherServices";
import axiosInstance from "../../services/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleString("vi-VN");
  } catch {
    return str;
  }
}

export default function ManageImports() {
  const { user } = useAuth();
  const [imports, setImports] = useState([]);
  const [products, setProducts] = useState([]);
  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    maNCC: "",
    maSP: "",
    soLuong: "",
    giaNhap: "",
    ghiChu: "",
  });
  const [saving, setSaving] = useState(false);
  const [showAddNCC, setShowAddNCC] = useState(false);
  const [newNhaCungCap, setNewNhaCungCap] = useState("");

  // Hàm mở modal và reload dữ liệu sản phẩm/nhà cung cấp
  const openModal = () => {
    setShowModal(true);
    // Reload lại danh sách sản phẩm và NCC để đảm bảo hiển thị sản phẩm mới thêm
    productService
      .getAll()
      .then((r) =>
        setProducts(Array.isArray(r.data) ? r.data : r.data?.data || []),
      );
    nhaCungCapService
      .getAll()
      .then((r) =>
        setNhaCungCap(Array.isArray(r.data) ? r.data : r.data?.data || []),
      );
  };

  useEffect(() => {
    document.title = "Quản lý nhập kho – TechStore";
    load();
    // Load initial data
    productService
      .getAll()
      .then((r) =>
        setProducts(Array.isArray(r.data) ? r.data : r.data?.data || []),
      );
    nhaCungCapService
      .getAll()
      .then((r) =>
        setNhaCungCap(Array.isArray(r.data) ? r.data : r.data?.data || []),
      );
  }, []);

  const load = () => {
    setLoading(true);
    orderService
      .getImports()
      .then((r) =>
        setImports(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => setImports([]))
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!form.maNCC) {
      toast.error("Vui lòng chọn nhà cung cấp!");
      return;
    }
    if (!form.maSP || !form.soLuong) {
      toast.error("Vui lòng chọn sản phẩm và số lượng!");
      return;
    }

    // Debug: Log user info để kiểm tra
    console.log("👤 User hiện tại:", user);
    console.log("👤 maNV từ AuthContext:", user?.maNV);
    console.log("👤 Role từ AuthContext:", user?.role);

    // Lấy maNV từ AuthContext - đây là MaNV thực từ bảng NhanVien
    // Admin có thể không có maNV trong bảng NhanVien, nên cần xử lý đặc biệt
    let maNV = user?.maNV;

    // Nếu là Admin mà không có maNV, thử lấy từ userId hoặc gán mặc định
    // Backend có thể chấp nhận giá trị này
    if (!maNV && user?.role === "Admin") {
      // Admin có thể dùng userId hoặc một giá trị mặc định
      // Lưu ý: Backend cần hỗ trợ điều này
      maNV = user?.userId || 1; // Hoặc giá trị mặc định phù hợp với Backend
      console.log("👤 Admin sử dụng maNV tạm thời:", maNV);
    }

    // Validate: chỉ cho phép nhân viên hoặc admin tạo phiếu nhập
    if (!maNV) {
      toast.error(
        "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!",
      );
      return;
    }

    // Build payload đúng format theo Backend yêu cầu
    // Lưu ý: Backend yêu cầu "donGiaNhap" thay vì "giaNhap"
    const payload = {
      maNCC: Number(form.maNCC),
      maNV: maNV,
      ghiChu: form.ghiChu || "",
      chiTietPhieuNhaps: [
        {
          maSP: Number(form.maSP),
          soLuong: Number(form.soLuong),
          donGiaNhap: Number(form.giaNhap) || 0,
        },
      ],
    };

    console.log("📤 Payload gửi đi:", JSON.stringify(payload, null, 2));

    setSaving(true);
    try {
      await orderService.createImport(payload);
      toast.success("Nhập kho thành công!");
      setShowModal(false);
      setForm({ maNCC: "", maSP: "", soLuong: "", giaNhap: "", ghiChu: "" });
      load();
    } catch (error) {
      // Log chi tiết lỗi từ server để debug
      console.error("❌ Lỗi chi tiết từ Backend:", error.response?.data);

      // Trích xuất thông báo lỗi từ server
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.title ||
        JSON.stringify(error.response?.data);

      // Hiển thị toast với thông báo lỗi chi tiết
      toast.error(`Nhập kho thất bại: ${serverMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (maPN) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập này không?")) {
      return;
    }

    try {
      await orderService.deleteImport(maPN);
      toast.success("Xóa phiếu nhập thành công!");
      // Cập nhật state để xóa dòng khỏi giao diện ngay lập tức
      setImports((prev) => prev.filter((imp) => imp.maPN !== maPN));
    } catch (error) {
      console.error("Lỗi khi xóa phiếu nhập:", error);
      toast.error("Xóa phiếu nhập thất bại!");
    }
  };

  const handleCreateNhaCungCap = async () => {
    if (!newNhaCungCap.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    try {
      const response = await nhaCungCapService.create({
        tenNCC: newNhaCungCap.trim(),
      });
      const createdNCC = response.data;

      // Thêm vào danh sách NCC hiện tại
      setNhaCungCap((prev) => [...prev, createdNCC]);

      // Gán maNCC mới vào form và ẩn input
      setForm((prev) => ({ ...prev, maNCC: createdNCC.maNCC }));
      setShowAddNCC(false);
      setNewNhaCungCap("");

      toast.success("Thêm nhà cung cấp thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm NCC:", error);
      toast.error("Thêm nhà cung cấp thất bại!");
    }
  };

  const totalValue = imports.reduce((s, i) => s + (i.tongTien || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Quản lý nhập kho
          </h1>
          <p className="text-slate-500 text-sm">
            {imports.length} phiếu nhập · Tổng: {formatCurrency(totalValue)}
          </p>
        </div>
        <button onClick={openModal} className="btn-primary">
          + Nhập hàng
        </button>
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
                    "Mã PN",
                    "Nhân viên",
                    "Nhà CC",
                    "Ngày nhập",
                    "Tổng tiền",
                    "Ghi chú",
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
                {imports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-slate-400"
                    >
                      Chưa có phiếu nhập
                    </td>
                  </tr>
                ) : (
                  imports.map((imp) => (
                    <tr
                      key={imp.maPN}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        PN{imp.maPN}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        {imp.tenNV || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {imp.tenNCC || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(imp.ngayNhap)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">
                        {formatCurrency(imp.tongTien)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {imp.ghiChu || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(imp.maPN)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          Xóa
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                📥 Nhập hàng mới
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nhà cung cấp *
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.maNCC}
                    onChange={(e) =>
                      setForm({ ...form, maNCC: e.target.value })
                    }
                    className="input-field flex-1"
                  >
                    <option value="">Chọn nhà cung cấp...</option>
                    {nhaCungCap.map((ncc) => (
                      <option key={ncc.maNCC} value={ncc.maNCC}>
                        {ncc.tenNCC}
                      </option>
                    ))}
                  </select>
                  {!showAddNCC ? (
                    <button
                      type="button"
                      onClick={() => setShowAddNCC(true)}
                      className="px-3 py-2 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-semibold whitespace-nowrap"
                    >
                      + Thêm mới
                    </button>
                  ) : (
                    <div className="flex gap-1 flex-1">
                      <input
                        type="text"
                        value={newNhaCungCap}
                        onChange={(e) => setNewNhaCungCap(e.target.value)}
                        placeholder="Tên NCC..."
                        className="input-field flex-1 text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateNhaCungCap}
                        className="px-3 py-2 text-sm bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-semibold"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddNCC(false);
                          setNewNhaCungCap("");
                        }}
                        className="px-3 py-2 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Sản phẩm *
                </label>
                <select
                  value={form.maSP}
                  onChange={(e) => setForm({ ...form, maSP: e.target.value })}
                  className="input-field"
                >
                  <option value="">Chọn sản phẩm...</option>
                  {products?.map((p) => (
                    <option key={p.maSP} value={p.maSP}>
                      {p.tenSP}
                    </option>
                  )) || (
                    <option disabled className="text-slate-400">
                      Không có sản phẩm
                    </option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    value={form.soLuong}
                    onChange={(e) =>
                      setForm({ ...form, soLuong: e.target.value })
                    }
                    className="input-field"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Giá nhập
                  </label>
                  <input
                    type="number"
                    value={form.giaNhap}
                    onChange={(e) =>
                      setForm({ ...form, giaNhap: e.target.value })
                    }
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Ghi chú
                </label>
                <textarea
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? "Đang lưu..." : "Nhập kho"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
