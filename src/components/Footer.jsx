import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display font-black text-2xl mb-3">
              <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-sm">⚡</span>
              <span className="text-white">Tech<span className="text-blue-400">Store</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Cửa hàng linh kiện điện tử uy tín hàng đầu Việt Nam. Chất lượng đảm bảo, giá cả cạnh tranh.
            </p>
            <div className="flex gap-3 mt-4">
              {['Facebook', 'Zalo', 'YouTube'].map(s => (
                <span key={s} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">{s}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-3">Danh mục</h4>
            <ul className="space-y-2 text-sm">
              {['CPU & VGA', 'Bo mạch chủ', 'RAM', 'Ổ cứng', 'Nguồn máy tính'].map(l => (
                <li key={l}><Link to="/products" className="hover:text-blue-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tra cứu đơn hàng</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs">© 2024 TechStore. All rights reserved.</p>
          <p className="text-xs">Hotline: <span className="text-blue-400 font-semibold">1800 xxxx</span></p>
        </div>
      </div>
    </footer>
  )
}
