import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminStats } from "../../features/admin/adminSlice";
import {
  Users,
  Cake,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  CheckCircle,
  Clock,
  ChevronRight,
  Star,
  AlertCircle,
  Package,
  ShoppingBag,
} from "lucide-react";

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; } /* Bade Letters ke liye */
.cs-script  { font-family: 'Pacifico', cursive; }

.cs-frosting {
  height: 22px;
  background-image: radial-gradient(circle at 50% 0, #C9A227 0 15px, transparent 16px);
  background-size: 36px 22px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes cs-grow  { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.cs-float { animation: cs-float 4s ease-in-out infinite; }
.cs-bar   { transform-origin: bottom; animation: cs-grow .7s ease-out both; }
`;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    dispatch(getAdminStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getAdminStats());
    setLastUpdated(new Date());
  };

  // Sample data
  const recentOrders = [
    { id: 1, customer: "John Doe", type: "Custom", amount: "₹2,500", status: "completed", time: "2 hours ago" },
    { id: 2, customer: "Jane Smith", type: "Fixed", amount: "₹1,800", status: "pending", time: "4 hours ago" },
    { id: 3, customer: "Robert Johnson", type: "Custom", amount: "₹4,200", status: "processing", time: "6 hours ago" },
  ];

  const topProducts = [
    { name: "Chocolate Fantasy", orders: 142, revenue: "₹3,55,000" },
    { name: "Red Velvet Delight", orders: 128, revenue: "₹2,88,000" },
    { name: "Vanilla Dream", orders: 95, revenue: "₹1,90,000" },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekValues = [12000, 19000, 15000, 25000, 22000, 30000, 28000];

  // 🎨 ORDER MIX COLORS UPDATED TO GOLD/BROWN THEME
  const orderMix = [
    { label: "Custom", value: 35, color: "#C9A227" }, // Gold
    { label: "Fixed", value: 40, color: "#D4AF37" },  // Light Gold
    { label: "Bulk", value: 15, color: "#8B6914" },   // Dark Gold
    { label: "Express", value: 10, color: "#5C3A21" },// Brown
  ];

  // build the donut gradient from the mix above
  let acc = 0;
  const donutGradient = `conic-gradient(${orderMix
    .map((o) => {
      const start = acc;
      acc += o.value;
      return `${o.color} ${start}% ${acc}%`;
    })
    .join(", ")})`;

  if (loading) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <style>{shopStyles}</style>
        <div className="text-center">
          <div className="text-6xl cs-float">🧁</div>
          <p className="cs-script mt-4 text-2xl text-[#8B6914]">Baking your dashboard...</p>
          <div className="mt-4 mx-auto h-1.5 w-40 rounded-full bg-[#E8E0D5] overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* Header banner with frosting edge */}
      <div className="bg-gradient-to-r from-[#4A2E1B] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="cs-script text-xl text-[#E8C84A]">Welcome back!</p>
              <h1 className="cs-display text-3xl md:text-4xl font-extrabold">Admin Dashboard</h1>
              <p className="text-[#E8E0D5] mt-1 font-semibold">Here's how your bakery is doing today.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full bg-[#FDFBF7]/20 p-1 backdrop-blur border border-[#C9A227]/30">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 text-sm font-bold rounded-full transition ${
                      timeRange === range
                        ? "bg-[#FDFBF7] text-[#5C3A21] shadow"
                        : "text-[#E8E0D5] hover:bg-[#FDFBF7]/20"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRefresh}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/30 transition border border-[#C9A227]/30"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-[#E8C84A]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="cs-frosting"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            gradient="from-pink-500 to-rose-500"
            change="+15%"
            positive={true}
          />
          <StatCard
            title="Total Orders"
            value={(stats?.totalOrders || 0).toLocaleString()}
            icon={<ShoppingCart className="h-5 w-5" />}
            gradient="from-orange-500 to-amber-500"
            change="+8%"
            positive={true}
          />
          <StatCard
            title="Active Users"
            value={(stats?.totalUsers || 0).toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            gradient="from-rose-500 to-pink-600"
            change="+12%"
            positive={true}
          />
          <StatCard
            title="Cakes"
            value={(stats?.totalCakes || 0).toLocaleString()}
            icon={<Cake className="h-5 w-5" />}
            gradient="from-amber-500 to-orange-500"
            change="+5%"
            positive={true}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue chart */}
          <Card>
            <CardTitle title="Revenue Overview" icon={<Filter className="h-4 w-4" />} />
            <div className="h-56 flex items-end gap-2 sm:gap-3 pt-2">
              {weekDays.map((day, index) => {
                const height = (weekValues[index] / 35000) * 100;
                return (
                  <div key={day} className="group flex-1 h-full flex flex-col">
                    <div className="flex-1 w-full flex items-end relative">
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-[#2E1B0F] text-[#FDFBF7] text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        ₹{weekValues[index].toLocaleString()}
                      </span>
                      {/* 🎨 BAR GRADIENT CHANGED TO GOLD */}
                      <div
                        className="cs-bar w-full rounded-t-2xl bg-gradient-to-t from-[#C9A227] to-[#D4AF37] group-hover:from-[#B8911E] group-hover:to-[#C9A227] transition-colors"
                        style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-[#8B7355] text-center mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Orders donut */}
          <Card>
            <CardTitle title="Order Distribution" icon={<Package className="h-4 w-4" />} />
            <div className="flex flex-col sm:flex-row items-center gap-6 min-h-[14rem]">
              <div className="sm:w-1/2 flex items-center justify-center">
                <div className="relative h-40 w-40 rounded-full shadow-inner" style={{ background: donutGradient }}>
                  <div className="absolute inset-[22px] rounded-full bg-[#FFFDF9] shadow flex items-center justify-center border border-[#E8E0D5]">
                    <div className="text-center">
                      <p className="cs-display text-2xl font-extrabold text-[#3E2C1C]">{stats?.totalOrders || 0}</p>
                      <p className="text-xs font-bold text-[#8B7355]">Total Orders</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-1/2 space-y-3">
                {orderMix.map((item) => (
                  <div key={item.label} className="flex items-center">
                    <span className="h-3 w-3 rounded-full mr-3" style={{ background: item.color }}></span>
                    <span className="text-sm font-bold text-[#5C3A21] flex-1">{item.label}</span>
                    <span className="font-extrabold text-[#3E2C1C]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="cs-display text-xl font-bold text-[#3E2C1C]">Recent Orders</h3>
              <button className="text-[#8B6914] hover:text-[#C9A227] text-sm font-bold flex items-center transition-colors">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-dashed border-[#E8E0D5]">
                    {["Customer", "Type", "Amount", "Status", "Time"].map((h) => (
                      <th key={h} className="text-left py-3 text-xs font-bold uppercase tracking-wider text-[#8B7355]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#F5F0E8] hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] text-sm font-bold flex items-center justify-center border border-[#E8D58A]">
                            {order.customer.charAt(0)}
                          </span>
                          <span className="font-bold text-sm text-[#3E2C1C]">{order.customer}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.type === "Custom" ? "bg-pink-50 text-pink-700 border border-pink-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold text-sm text-[#3E2C1C]">{order.amount}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize border ${
                            order.status === "completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : order.status === "processing"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {order.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.status === "processing" && <Clock className="h-3 w-3 mr-1" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-semibold text-[#8B7355]">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-6">
            {/* Top products */}
            <Card>
              <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-4">Top Cakes</h3>
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F5F0E8] transition-colors"
                  >
                    <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-extrabold flex items-center justify-center cs-display border border-[#E8D58A]">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#3E2C1C] truncate">{product.name}</p>
                      <div className="flex items-center mt-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                        <span className="text-xs font-semibold text-[#8B7355] ml-1">4.8</span>
                        <span className="text-xs text-[#E8E0D5] mx-2">•</span>
                        <span className="text-xs font-semibold text-[#8B7355]">{product.orders} orders</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-[#3E2C1C]">{product.revenue}</p>
                      <p className="text-xs font-bold text-green-600">+12%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="cs-display text-xl font-bold text-[#3E2C1C]">Notifications</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] text-xs font-bold rounded-full shadow-sm">
                  2 new
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { text: "New custom order received", type: "order", time: "10 min ago", unread: true },
                  { text: "Inventory low for baking supplies", type: "alert", time: "2 hours ago", unread: true },
                  { text: "Monthly revenue target achieved", type: "success", time: "1 day ago", unread: false },
                ].map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border text-sm transition-colors ${
                      notification.unread ? "bg-[#FDF8E8] border-[#E8D58A]" : "bg-[#FFFDF9] border-[#E8E0D5]"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {notification.type === "order" && <ShoppingBag className="h-4 w-4 text-pink-600" />}
                        {notification.type === "alert" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {notification.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#3E2C1C]">{notification.text}</p>
                        <p className="text-xs font-semibold text-[#8B7355] mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t-2 border-dashed border-[#E8E0D5] flex flex-col sm:flex-row items-center justify-between text-sm text-[#8B7355] gap-2">
          <div>
            Last updated:{" "}
            <span className="font-bold text-[#3E2C1C]">
              {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full bg-[#FFFDF9] border border-[#E8E0D5] px-4 py-2 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] shadow-lg shadow-[#E8E0D5]/60 p-5 md:p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ title, icon }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="cs-display text-xl font-bold text-[#3E2C1C]">{title}</h3>
    <span className="h-8 w-8 rounded-full bg-[#FDF8E8] text-[#8B6914] flex items-center justify-center border border-[#E8D58A]">{icon}</span>
  </div>
);

const StatCard = ({ title, value, icon, gradient, change, positive }) => {
  return (
    <div className="relative overflow-hidden bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] shadow-lg shadow-[#E8E0D5]/60 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      {/* decorative sprinkle blob */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`}></div>

      <div className="relative flex items-start justify-between mb-4">
        <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md flex items-center justify-center`}>
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
              positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <p className="relative text-sm font-bold text-[#8B7355] mb-1">{title}</p>
      <p className="relative cs-display text-3xl font-extrabold text-[#3E2C1C]">{value}</p>
    </div>
  );
};

export default AdminDashboard;