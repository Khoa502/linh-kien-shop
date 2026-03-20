import { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    document.title = 'Quản lý khách hàng – TechStore'
    orderService.getCustomers()
      .then(r => setCustomers(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    (c.hoTen || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.tenDangNhap || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.soDienThoai || '').includes(search)
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">Quản lý khách hàng</h1>
        <p className="text-slate-500 text-sm">{customers.length} khách hàng</p>
      </div>

      <div className="relative max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, SĐT..." className="input-field pl-10"/>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <div className="p-6 flex justify-center"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Mã KH','Họ tên','Tài khoản','SĐT','Địa chỉ','Điểm tích lũy','Công nợ'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Không tìm thấy khách hàng</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.maKH} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-mono text-slate-400">{c.maKH}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{c.hoTen || '—'}</td>
                    <td className="px-4 py-3 text-blue-600 dark:text-blue-400">{c.tenDangNhap || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{c.soDienThoai || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs"><span className="line-clamp-1">{c.diaChi || '—'}</span></td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {c.diemTichLuy || 0} điểm
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-500">{formatCurrency(c.tongNo || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
