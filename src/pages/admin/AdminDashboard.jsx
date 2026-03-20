import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const MONTHS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("vi-VN");
  } catch {
    return str;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    customers: 0,
    revenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard – TechStore";

    // Nâng cấp: Bắt lỗi cho từng API để lỡ 1 cái lỗi thì các cái khác vẫn lên data
    Promise.all([
      orderService.getAll().catch(() => []),
      productService.getAll().catch(() => []),
      orderService.getCustomers().catch(() => []),
    ])
      .then(([ordersRes, productsRes, customersRes]) => {
        // Hàm "bao lô" mọi trường hợp trả về của API
        const extractData = (res) => {
          const dataList = res?.data?.data || res?.data || res;
          return Array.isArray(dataList) ? dataList : [];
        };

        const orders = extractData(ordersRes);
        const products = extractData(productsRes);
        const customers = extractData(customersRes);

        // Tính tổng doanh thu
        const revenue = orders.reduce(
          (s, o) => s + (o.thanhTien || o.tongTien || 0),
          0,
        );
        setStats({
          orders: orders.length,
          products: products.length,
          customers: customers.length,
          revenue,
        });

        // Hóa đơn mới nhất
        setRecentOrders(orders.slice(0, 5));

        // Doanh thu theo tháng
        const monthly = {};
        MONTHS.forEach((m) => {
          monthly[m] = { month: m, revenue: 0, orders: 0 };
        });

        orders.forEach((o) => {
          const d = new Date(o.ngayBan || o.ngayDat || o.createdAt);
          if (!isNaN(d)) {
            const m = MONTHS[d.getMonth()];
            monthly[m].revenue += o.thanhTien || o.tongTien || 0;
            monthly[m].orders++;
          }
        });
        setRevenueData(Object.values(monthly));

        // Trạng thái đơn
        const sc = {};
        orders.forEach((o) => {
          const s = o.trangThai || "Chưa xác định";
          sc[s] = (sc[s] || 0) + 1;
        });
        setStatusData(
          Object.entries(sc).map(([name, value]) => ({ name, value })),
        );
      })
      .catch((err) => console.error("Lỗi load Dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Tổng hóa đơn",
      value: stats.orders,
      icon: "🛍️",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Sản phẩm",
      value: stats.products,
      icon: "📦",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Khách hàng",
      value: stats.customers,
      icon: "👥",
      color: "from-violet-500 to-violet-600",
    },
    {
      label: "Doanh thu",
      value: formatCurrency(stats.revenue),
      icon: "💰",
      color: "from-amber-500 to-amber-600",
    },
  ];

  if (loading)
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Tổng quan hệ thống TechStore
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm opacity-80 font-medium mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-5">
            📈 Doanh thu theo tháng
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) =>
                  v > 0 ? `${(v / 1e6).toFixed(0)}M` : "0"
                }
              />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#grad)"
                name="Doanh thu"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-5">
            🥧 Trạng thái đơn
          </h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-5">
            📊 Số đơn theo tháng
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="orders"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                name="Đơn hàng"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white">
              Hóa đơn mới nhất
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">
                Chưa có hóa đơn
              </p>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.maHD}
                  className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">
                      {o.maHoaDon || `#${o.maHD}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {o.tenKH || "—"} · {formatDate(o.ngayBan)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(o.thanhTien || o.tongTien)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {o.trangThai || "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
