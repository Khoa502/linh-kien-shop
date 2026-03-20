import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
})
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
})

const STORE_POS = [10.7769, 106.7009] // Ho Chi Minh City

const statusSteps = [
  { key: 'ChoXacNhan', label: 'Đặt hàng thành công', icon: '📋' },
  { key: 'DaXacNhan', label: 'Đã xác nhận', icon: '✅' },
  { key: 'DangGiao', label: 'Đang giao hàng', icon: '🚚' },
  { key: 'DaGiao', label: 'Giao thành công', icon: '🏠' },
]

export default function OrderTracking() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `Theo dõi đơn #${id} – TechStore`
    orderService.getById(id)
      .then(r => setOrder(r.data?.data || r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  )

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">😢</p>
      <p className="font-bold">Không tìm thấy đơn hàng</p>
      <Link to="/dashboard" className="btn-primary mt-4 inline-block">← Quay lại</Link>
    </div>
  )

  const currentStepIdx = statusSteps.findIndex(s => s.key === order.trangThai)
  const deliveryPos = order.lat && order.lng
    ? [order.lat, order.lng]
    : [STORE_POS[0] - 0.05, STORE_POS[1] + 0.05]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-slate-400 hover:text-blue-600">←</Link>
        <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
          Theo dõi đơn hàng <span className="text-blue-600">#{order.id}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: status + info */}
        <div className="space-y-4">
          {/* Status timeline */}
          <div className="card">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4">Trạng thái đơn hàng</h2>
            <div className="space-y-3">
              {statusSteps.map((step, idx) => {
                const done = idx <= currentStepIdx
                const active = idx === currentStepIdx
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all
                      ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                        : done ? 'bg-green-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {done ? (active ? step.icon : '✓') : step.icon}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${active ? 'text-blue-600 dark:text-blue-400' : done ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order info */}
          <div className="card text-sm space-y-2">
            <h2 className="font-bold text-slate-800 dark:text-white mb-3">Thông tin đơn hàng</h2>
            {[
              ['Người nhận', order.hoTen || order.tenNguoiNhan],
              ['Điện thoại', order.soDienThoai],
              ['Địa chỉ', order.diaChi],
              ['Thanh toán', order.phuongThucThanhToan],
              ['Tổng tiền', formatCurrency(order.tongTien)],
              ['Ngày đặt', formatDateTime(order.ngayDat || order.createdAt)],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{k}:</span>
                <span className="font-semibold text-slate-800 dark:text-white text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                🗺️ Theo dõi trên bản đồ
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {order.trangThai === 'DangGiao' ? '🚚 Đơn hàng đang trên đường đến bạn!' : 'Vị trí kho hàng và điểm giao'}
              </p>
            </div>
            <div style={{ height: '400px' }}>
              <MapContainer center={STORE_POS} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={STORE_POS} icon={storeIcon}>
                  <Popup><strong>📦 Kho TechStore</strong><br />Điểm xuất phát</Popup>
                </Marker>
                <Marker position={deliveryPos} icon={deliveryIcon}>
                  <Popup><strong>🏠 Điểm giao hàng</strong><br />{order.diaChi || 'Địa chỉ của bạn'}</Popup>
                </Marker>
                {order.trangThai === 'DangGiao' && (
                  <Polyline positions={[STORE_POS, deliveryPos]} color="#2563eb" weight={3} dashArray="10,5" />
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
