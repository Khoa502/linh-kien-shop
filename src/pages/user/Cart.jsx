import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { useEffect } from 'react'

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart()

  useEffect(() => { document.title = `Giỏ hàng (${count}) – TechStore` }, [count])

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-5">🛒</p>
        <h2 className="font-display font-black text-2xl text-slate-800 dark:text-white mb-3">Giỏ hàng trống</h2>
        <p className="text-slate-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng!</p>
        <Link to="/products" className="btn-primary px-8 py-3 inline-block">Mua sắm ngay</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
          Giỏ hàng <span className="text-blue-600">({count})</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline font-semibold">
          🗑️ Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const price = item.giaBan || item.gia || 0
            const img = item.hinhAnh || item.anhDaiDien || `https://placehold.co/80x80/e2e8f0/94a3b8?text=SP`
            return (
              <div key={item._cartId} className="card flex items-center gap-4 p-4">
                <img src={img} alt={item.tenSP || item.tenSanPham} className="w-20 h-20 object-contain rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.maSP ?? item._cartId}`} className="font-bold text-slate-800 dark:text-white hover:text-blue-600 line-clamp-2">
                    {item.tenSP || item.tenSanPham}
                  </Link>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mt-1">{formatCurrency(price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Qty controls */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item._cartId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-600">−</button>
                    <span className="w-10 h-9 flex items-center justify-center font-bold text-sm border-x border-slate-200 dark:border-slate-600">{item.quantity}</span>
                    <button onClick={() => updateQty(item._cartId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-600">+</button>
                  </div>
                  <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                    {formatCurrency(price * item.quantity)}
                  </p>
                  <button onClick={() => removeItem(item._cartId)} className="text-red-400 hover:text-red-600 text-xs font-semibold">✕ Xóa</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tạm tính ({count} sản phẩm)</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-semibold">Miễn phí</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between">
                <span className="font-bold text-slate-800 dark:text-white text-base">Tổng cộng</span>
                <span className="font-extrabold text-blue-600 text-xl">{formatCurrency(total)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full py-3 text-center block">
              Thanh toán ngay →
            </Link>
            <Link to="/products" className="btn-secondary w-full py-2.5 text-center block text-sm">
              ← Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
