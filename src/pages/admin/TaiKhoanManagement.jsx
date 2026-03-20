import { useState, useEffect } from "react";
import { taiKhoanService } from "../../services/taiKhoanService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const emptyForm = {
  tenDangNhap: "",
  email: "",
  matKhau: "",
  hoTen: "",
  soDienThoai: "",
  role: 2,
  trangThai: true,
};

const roleOptions = [
  { value: 1, label: "Admin" },
  { value: 2, label: "Khách hàng" },
  { value: 3, label: "Nhân viên" },
]; // Fixed: value = RoleID numeric để match DB PhanQuyen.ID (1=Admin, 2=User, 3=Staff)

export default function TaiKhoanManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    document.title = "Quản lý tài khoản – LinhKienShop";
    load();
  }, []);

  const load = () => {
    setLoading(true);
    taiKhoanService
      .getAll()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setAccounts(data);
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setForm({
      tenDangNhap: account.tenDangNhap || "",
      email: account.email || "",
      hoTen: account.hoTen || "",
      soDienThoai: account.soDienThoai || "",
      role: parseInt(account.role) || 2,
      trangThai: account.trangThai ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.tenDangNhap || !form.email) {
      toast.error("Vui lòng nhập tên đăng nhập và email!");
      return;
    }
    if (!editing && !form.matKhau) {
      toast.error("Vui lòng nhập mật khẩu!");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await taiKhoanService.update(editing.maTaiKhoan || editing.id, form);
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await taiKhoanService.create(form);
        toast.success("Tạo tài khoản thành công!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: null });
    try {
      await taiKhoanService.delete(id);
      toast.success("Đã xóa tài khoản!");
      load();
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const filtered = accounts.filter(
    (acc) =>
      (acc.tenDangNhap || "").toLowerCase().includes(search.toLowerCase()) ||
      (acc.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Quản lý tài khoản
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {accounts.length} tài khoản
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Thêm tài khoản
        </button>
      </div>

      <div className="relative max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên đăng nhập hoặc email..."
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
                    "ID",
                    "Tên đăng nhập",
                    "Email",
                    "Họ tên",
                    "Số điện thoại",
                    "Trạng thái",
                    "Ngày tạo",
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
                      colSpan={8}
                      className="text-center py-12 text-slate-400"
                    >
                      {search
                        ? "Không tìm thấy tài khoản"
                        : "Không có tài khoản nào"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((acc) => (
                    <tr
                      key={acc.maTaiKhoan || acc.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {acc.maTaiKhoan || acc.id || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        {acc.tenDangNhap || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {acc.email || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white max-w-xs">
                        {acc.hoTen || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {acc.soDienThoai || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            acc.trangThai
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {acc.trangThai ? "Hoạt động" : "Khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">
                        {acc.ngayTao || acc.createdAt
                          ? new Date(
                              acc.ngayTao || acc.createdAt,
                            ).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(acc)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(acc.maTaiKhoan || acc.id)
                            }
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
                {editing ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
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
                { k: "tenDangNhap", label: "Tên đăng nhập *", type: "text" },
                { k: "email", label: "Email *", type: "email" },
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

              {!editing && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={form.matKhau}
                    onChange={(e) =>
                      setForm({ ...form, matKhau: e.target.value })
                    }
                    className="input-field"
                    placeholder="Nhập mật khẩu mạnh"
                  />
                </div>
              )}

              {[
                { k: "hoTen", label: "Họ tên", type: "text" },
                { k: "soDienThoai", label: "Số điện thoại", type: "tel" },
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
                  Vai trò
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  Tài khoản hoạt động
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Bạn có chắc chắn muốn xóa tài khoản này? Thao tác không thể hoàn
                tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="btn-secondary flex-1"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger flex-1 font-semibold"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
