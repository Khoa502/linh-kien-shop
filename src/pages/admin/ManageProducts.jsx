import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const emptyForm = {
  tenSP: "",
  moTa: "",
  giaBan: "",
  soLuongTon: "",
  maLoai: "",
  hinhAnh: "",
  trangThai: true,
  maNCC: "",
  maLinhKien: "",
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Quản lý sản phẩm – TechStore";
    load();
    categoryService
      .getAll()
      .then((r) => {
        const dataList = r?.data?.data || r?.data || r;
        setCategories(Array.isArray(dataList) ? dataList : []);
      })
      .catch((err) => console.log("Lỗi load danh mục:", err));
  }, []);

  const load = () => {
    setLoading(true);
    productService
      .getAll()
      .then((r) => {
        const dataList = r?.data?.data || r?.data || r;
        setProducts(Array.isArray(dataList) ? dataList : []);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API sản phẩm:", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    // Store all product fields in form, including hidden fields like maNCC, maLinhKien
    setForm({
      tenSP: p.tenSP || "",
      moTa: p.moTa || "",
      giaBan: p.giaBan || "",
      soLuongTon: p.soLuongTon || "",
      maLoai: p.maLoai || "",
      hinhAnh: p.hinhAnh || "",
      trangThai: p.trangThai ?? true,
      // Preserve hidden fields
      maNCC: p.maNCC ?? "",
      maLinhKien: p.maLinhKien ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.tenSP || !form.giaBan) {
      toast.error("Vui lòng nhập tên và giá!");
      return;
    }
    setSaving(true);
    try {
      // Sanitize payload - convert empty strings to null for numeric fields
      const sanitizeNumber = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      const payload = {
        tenSP: form.tenSP || "",
        moTa: form.moTa || "",
        giaBan: sanitizeNumber(form.giaBan) || 0,
        soLuongTon: sanitizeNumber(form.soLuongTon) || 0,
        maLoai: sanitizeNumber(form.maLoai),
        hinhAnh: form.hinhAnh || "",
        trangThai: form.trangThai ?? true,
        // Handle nullable int fields
        maNCC: sanitizeNumber(form.maNCC) || 1, // Default to 1 if not provided
        maLinhKien: form.maLinhKien || null, // Keep as string or null
      };

      if (editing) {
        // Loại bỏ maSP khỏi payload để tránh lỗi "cannot modify key" từ EF Core
        const { maSP, ...updatePayload } = payload;
        await productService.update(editing.maSP, updatePayload);
        toast.success("Cập nhật thành công!");
      } else {
        await productService.create(payload);
        toast.success("Thêm sản phẩm thành công!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (maSP) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await productService.delete(maSP);
      toast.success("Đã xóa!");
      load();
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const filtered = products.filter(
    (p) =>
      (p.tenSP || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tenLoai || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Quản lý sản phẩm
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {products.length} sản phẩm
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Thêm sản phẩm
        </button>
      </div>

      <div className="relative max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="input-field pl-10"
        />
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
                    "Mã SP",
                    "Ảnh",
                    "Tên sản phẩm",
                    "Loại",
                    "Nhà CC",
                    "Giá bán",
                    "Tồn kho",
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
                      Không có sản phẩm
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.maSP}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {p.maSP}
                      </td>
                      <td className="px-4 py-3">
                        <img
                          src={
                            p.hinhAnh ||
                            `https://placehold.co/40x40/e2e8f0/94a3b8?text=SP`
                          }
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg bg-slate-100"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white max-w-xs">
                        <span className="line-clamp-2">{p.tenSP}</span>
                        {p.maLinhKien && (
                          <span className="text-xs text-slate-400 block">
                            {p.maLinhKien}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.tenLoai || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.tenNCC || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {formatCurrency(p.giaBan)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${(p.soLuongTon || 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.soLuongTon || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${p.trangThai ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {p.trangThai ? "Kinh doanh" : "Ẩn"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(p.maSP)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { k: "tenSP", label: "Tên sản phẩm *", type: "text" },
                { k: "giaBan", label: "Giá bán *", type: "number" },
                { k: "soLuongTon", label: "Số lượng tồn", type: "number" },
                { k: "hinhAnh", label: "URL hình ảnh", type: "url" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.k]}
                    onChange={(e) =>
                      setForm({ ...form, [f.k]: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loại sản phẩm
                </label>
                <select
                  value={form.maLoai}
                  onChange={(e) => setForm({ ...form, maLoai: e.target.value })}
                  className="input-field"
                >
                  <option value="">Chọn loại</option>
                  {categories.map((c) => (
                    <option key={c.maLoai} value={c.maLoai}>
                      {c.tenLoai}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="trangThai"
                  checked={form.trangThai}
                  onChange={(e) =>
                    setForm({ ...form, trangThai: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="trangThai"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Kinh doanh (hiển thị sản phẩm)
                </label>
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
