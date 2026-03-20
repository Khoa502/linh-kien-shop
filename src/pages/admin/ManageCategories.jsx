import { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ManageCategories() {
  const [cats, setCats]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState({ tenLoai:'', moTa:'' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => { document.title = 'Quản lý danh mục – TechStore'; load() }, [])

  const load = () => {
    setLoading(true)
    categoryService.getAll()
      .then(r => setCats(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => setCats([]))
      .finally(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm({ tenLoai:'', moTa:'' }); setShowModal(true) }
  const openEdit   = (c) => { setEditing(c); setForm({ tenLoai: c.tenLoai||'', moTa: c.moTa||'' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.tenLoai) { toast.error('Vui lòng nhập tên loại!'); return }
    setSaving(true)
    try {
      if (editing) {
        await categoryService.update(editing.maLoai, form)
        toast.success('Cập nhật thành công!')
      } else {
        await categoryService.create(form)
        toast.success('Thêm danh mục thành công!')
      }
      setShowModal(false); load()
    } catch { toast.error('Thao tác thất bại!') }
    finally { setSaving(false) }
  }

  const handleDelete = async (maLoai) => {
    if (!confirm('Xóa danh mục này?')) return
    try { await categoryService.delete(maLoai); toast.success('Đã xóa!'); load() }
    catch { toast.error('Xóa thất bại!') }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">Quản lý danh mục</h1>
          <p className="text-slate-500 text-sm">{cats.length} danh mục</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Thêm danh mục</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><LoadingSpinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.length === 0 ? (
            <p className="text-slate-400 col-span-3 text-center py-12">Chưa có danh mục</p>
          ) : cats.map(cat => (
            <div key={cat.maLoai} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl mb-3">🗂️</div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{cat.tenLoai}</h3>
                  <p className="text-xs text-blue-500 font-mono mt-0.5">ID: {cat.maLoai}</p>
                  {cat.moTa && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{cat.moTa}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">✏️</button>
                  <button onClick={() => handleDelete(cat.maLoai)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">{editing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Tên loại sản phẩm *</label>
                <input value={form.tenLoai} onChange={e => setForm({...form, tenLoai: e.target.value})} className="input-field" placeholder="VD: CPU, RAM, SSD..."/>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Mô tả</label>
                <textarea value={form.moTa} onChange={e => setForm({...form, moTa: e.target.value})} rows={3} className="input-field resize-none" placeholder="Mô tả loại sản phẩm..."/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Hủy</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
