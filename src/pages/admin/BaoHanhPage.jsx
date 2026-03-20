import { useState, useEffect } from "react";
import { baoHanhService } from "../../services/baoHanhService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const emptyForm = {
  maSP: "",
  tenSP: "",
  soSerial: "",
  thoiHanBaoHanh: "",
  ngayBatDau: "",
  diaChiBaoHanh: "",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
};

export default function BaoHanhPage() {
  const [baoHanhs, setBaoHanhs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMaSP, setFilterMaSP] = useState("");
  const [sapHetHan, setSapHetHan] = useState([]);

  useEffect(() => {
    document.title = "Quản lý bảo hành – TechAdmin";
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await baoHanhService.getAll();
      setBaoHanhs(Array.isArray(r.data) ? r.data : r.data?.data || []);
    } catch {
      setBaoHanhs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSapHetHan = async () => {
    try {
      const r = await baoHanhService.getSapHetHan();
      setSapHetHan(Array.isArray(r.data) ? r.data : r.data?.data || []);
      toast.success(`Tìm thấy ${sapHetHan.length} bảo hành sắp hết hạn!`);
    } catch (err) {
      toast.error("Lỗi tải danh sách sắp hết hạn!");
    }
  };

  const loadBySanPham = async () => {
    if (!filterMaSP) {
      load();
      return;
    }
    try {
      const r = await baoHanhService.getBySanPham(filterMaSP);
      setBaoHanhs(Array.isArray(r.data) ? r.data : r.data?.data || []);
      toast.success(`Tìm thấy bảo hành cho sản phẩm ${filterMaSP}`);
    } catch {
      toast.error("Không tìm thấy!");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      maSP: item.maSP || "",
      tenSP: item.tenSP || "",
      soSerial: item.soSerial || "",
      thoiHanBaoHanh: item.thoiHanBaoHanh || "",
      // FIX LỖI DATE: Cắt bỏ phần "T13:49:15..." đi, chỉ lấy ngày "YYYY-MM-DD"
      ngayBatDau: item.ngayBatDau ? item.ngayBatDau.split("T")[0] : "",
      diaChiBaoHanh: item.diaChiBaoHanh || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.soSerial || !form.ngayBatDau) {
      toast.error("Vui lòng nhập serial và ngày bắt đầu!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        maSP: form.maSP ? Number(form.maSP) : null,
        tenSP: form.tenSP || "",
        soSerial: form.soSerial,
        thoiHanBaoHanh: Number(form.thoiHanBaoHanh) || 0,
        ngayBatDau: form.ngayBatDau,
        diaChiBaoHanh: form.diaChiBaoHanh || "",
      };

      if (editing) {
        // FIX LỖI 500: Nhét thêm maBH vào payload để C# không bị nhầm ID thành số 0
        payload.maBH = editing.maBH;

        await baoHanhService.update(editing.maBH, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await baoHanhService.create(payload);
        toast.success("Thêm bảo hành thành công!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (maBH) => {
    if (!confirm("Xóa bảo hành này?")) return;
    try {
      await baoHanhService.delete(maBH);
      toast.success("Đã xóa!");
      load();
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const filtered = baoHanhs.filter(
    (bh) =>
      (bh.tenSP || "").toLowerCase().includes(search.toLowerCase()) ||
      (bh.soSerial || "").includes(search) ||
      String(bh.maBH || "").includes(search),
  );

  const getStatusBadge = (trangThai) => {
    if (trangThai === true || trangThai === "Đang bảo hành") {
      return "bg-green-100 text-green-700";
    }
    return "bg-red-100 text-red-700";
  };

  const statusText = (trangThai) =>
    trangThai === true || trangThai === "Đang bảo hành"
      ? "Đang bảo hành"
      : "Hết hạn";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Quản lý bảo hành
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {filtered.length} bảo hành {filterMaSP && `(SP: ${filterMaSP})`}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadSapHetHan} className="btn-warning">
            ⚠️ Bảo hành sắp hết hạn
          </button>
          <button onClick={openCreate} className="btn-primary">
            + Thêm bảo hành
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên SP, serial..."
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            📦
          </span>
          <input
            value={filterMaSP}
            onChange={(e) => setFilterMaSP(e.target.value)}
            placeholder="Mã SP để lọc..."
            className="input-field pl-10"
            onKeyDown={(e) => e.key === "Enter" && loadBySanPham()}
          />
          <button
            onClick={loadBySanPham}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            Go
          </button>
        </div>
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
                    "Mã BH",
                    "Tên SP",
                    "Serial",
                    "Thời hạn",
                    "Ngày bắt đầu",
                    "Ngày kết thúc",
                    "Địa chỉ BH",
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
                    <td
                      colSpan={9}
                      className="text-center py-12 text-slate-400"
                    >
                      Không có bảo hành
                    </td>
                  </tr>
                ) : (
                  filtered.map((bh) => (
                    <tr
                      key={bh.maBH}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {bh.maBH}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white max-w-xs">
                        {bh.tenSP}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {bh.soSerial}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {bh.thoiHanBaoHanh} ngày
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(bh.ngayBatDau)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(bh.ngayKetThuc)}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="line-clamp-1">{bh.diaChiBaoHanh}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadge(bh.trangThai)}`}
                        >
                          {statusText(bh.trangThai)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(bh)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(bh.maBH)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                {editing ? "Cập nhật bảo hành" : "Thêm bảo hành mới"}
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã sản phẩm
                </label>
                <input
                  type="text"
                  value={form.maSP}
                  onChange={(e) => setForm({ ...form, maSP: e.target.value })}
                  className="input-field"
                  placeholder="Nhập mã SP"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên SP *
                </label>
                <input
                  type="text"
                  value={form.tenSP}
                  onChange={(e) => setForm({ ...form, tenSP: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số serial *
                </label>
                <input
                  type="text"
                  value={form.soSerial}
                  onChange={(e) =>
                    setForm({ ...form, soSerial: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thời hạn (ngày)
                </label>
                <input
                  type="number"
                  value={form.thoiHanBaoHanh}
                  onChange={(e) =>
                    setForm({ ...form, thoiHanBaoHanh: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  value={form.ngayBatDau}
                  onChange={(e) =>
                    setForm({ ...form, ngayBatDau: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ bảo hành
                </label>
                <textarea
                  value={form.diaChiBaoHanh}
                  onChange={(e) =>
                    setForm({ ...form, diaChiBaoHanh: e.target.value })
                  }
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
                  {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
