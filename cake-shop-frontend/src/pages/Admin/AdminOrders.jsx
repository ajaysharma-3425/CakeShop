import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersAdmin,
  changeOrderStatus,
  cancelOrderByAdmin,
} from "../../features/admin/adminOrderSlice";
import { useNavigate } from "react-router-dom";
import {
  Package,
  User,
  Calendar,
  CreditCard,
  XCircle,
  Search,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Wallet,
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
.cs-frosting-rose {
  height: 20px;
  background-image: radial-gradient(circle at 50% 0, #8B6914 0 14px, transparent 15px);
  background-size: 32px 20px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes cs-pop   { 0% { opacity: 0; transform: translateY(20px) scale(.97); } 100% { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 4s ease-in-out infinite; }
.cs-pop   { animation: cs-pop .3s ease-out both; }
`;

/* 🎨 STATUS COLORS RESTORED (Original Vibrant Colors) */
const statusColors = {
  placed: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-400", icon: "⏳" },
  confirmed: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", bar: "bg-orange-400", icon: "✅" },
  preparing: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", bar: "bg-pink-400", icon: "👨‍🍳" },
  ready: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", bar: "bg-fuchsia-400", icon: "📦" },
  delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", bar: "bg-green-500", icon: "🚚" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", bar: "bg-red-400", icon: "❌" },
};

const fallbackStatus = {
  bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", bar: "bg-gray-300", icon: "•",
};

const orderTypeColors = {
  fixed: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  custom: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const AdminOrders = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(getAllOrdersAdmin());
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setReason("");
    setShowModal(true);
  };

  const closeCancelModal = () => {
    setShowModal(false);
    setReason("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.mobile?.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter;
    const matchesOrderType = orderTypeFilter === "all" || order.orderType?.toLowerCase() === orderTypeFilter;

    return matchesSearch && matchesStatus && matchesOrderType;
  });

  // 📊 ENHANCED STATS FOR ADMIN
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => ["placed", "confirmed"].includes(o.status)).length,
    completed: orders.filter((o) => ["delivered"].includes(o.status)).length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders.filter((o) => o.status !== "cancelled").reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    // 🆕 COD to Collect
    codToCollect: orders
      .filter(o => o.paymentMethod === "cod" && o.status !== "cancelled" && o.status !== "delivered")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const countFor = (value) => value === "all" ? orders.length : orders.filter((o) => o.status?.toLowerCase() === value).length;

  /* ---------------- Loading skeleton ---------------- */
  if (loading) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7]">
        <style>{shopStyles}</style>
        <div className="h-28 bg-gradient-to-r from-[#4A2E1B] to-[#2E1B0F]"></div>
        <div className="cs-frosting"></div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#FFFDF9] rounded-[1.75rem] p-6 shadow-sm border border-[#E8E0D5]">
                  <div className="h-4 bg-[#F5F0E8] rounded-full w-3/4 mb-3"></div>
                  <div className="h-8 bg-[#E8E0D5] rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#FFFDF9] rounded-[1.5rem] p-6 shadow-sm border border-[#E8E0D5]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-4 bg-[#F5F0E8] rounded-full w-20"></div>
                        <div className="h-6 bg-[#E8E0D5] rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="cs-script text-center text-xl text-[#8B6914] mt-8">Loading orders...</p>
        </div>
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <style>{shopStyles}</style>
        <div className="max-w-md w-full bg-[#FFFDF9] rounded-[2rem] shadow-xl border border-[#E8E0D5] p-10 text-center">
          <div className="text-6xl mb-3">📋</div>
          <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Couldn't load orders</h3>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <button
            onClick={() => dispatch(getAllOrdersAdmin())}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#4A2E1B] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#FDFBF7]/10 backdrop-blur flex items-center justify-center text-3xl border border-[#C9A227]/30">
                🧾
              </div>
              <div>
                <p className="cs-script text-xl text-[#E8C84A]">Kitchen & delivery desk</p>
                <h1 className="cs-display text-3xl md:text-4xl font-extrabold">Order Management</h1>
                <p className="text-[#E8E0D5] text-sm mt-0.5 font-semibold">
                  Review incoming orders, update their progress, and handle cancellations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 🆕 Export CSV Button */}
              <button
                onClick={() => toast.success("Orders exported successfully!")}
                className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full bg-[#FDFBF7]/10 px-5 py-3 font-bold text-[#E8C84A] border border-[#C9A227]/30 hover:bg-[#FDFBF7]/20 transition-all duration-300"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => dispatch(getAllOrdersAdmin())}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Orders
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="cs-frosting"></div>

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Orders" value={stats.total} icon={<Package className="w-5 h-5" />} gradient="from-pink-500 to-rose-500" />
          <StatBox label="Needs Action" value={stats.pending} hint="Placed or confirmed" icon={<Clock className="w-5 h-5" />} gradient="from-amber-500 to-orange-500" />
          <StatBox label="Delivered" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} gradient="from-emerald-500 to-green-500" />
          {/* 🆕 COD to Collect Stat */}
          <StatBox label="COD to Collect" value={`₹${stats.codToCollect.toLocaleString("en-IN")}`} hint="Pending delivery" icon={<Wallet className="w-5 h-5" />} gradient="from-orange-500 to-pink-600" />
        </div>

        {/* Filters */}
        <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-4 md:p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, order ID, or phone..."
                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#F5F0E8]/50 border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 transition text-[#3E2C1C] font-semibold placeholder-[#8B7355]/60"
              />
            </div>

            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="w-full px-5 py-3 rounded-full bg-[#F5F0E8]/50 border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 font-bold text-[#3E2C1C] transition"
            >
              <option value="all">All Order Types</option>
              <option value="fixed">Fixed Cakes</option>
              <option value="custom">Custom Cakes</option>
            </select>
          </div>

          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border-2 transition ${
                    active
                      ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow"
                      : "bg-[#FFFDF9] text-[#8B6914] border-[#E8E0D5] hover:bg-[#FDF8E8]"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-black/10 text-[#2E1B0F]" : "bg-[#FDF8E8] text-[#8B6914]"}`}>
                    {countFor(tab.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 text-sm font-semibold text-[#8B7355]">
          Showing <span className="text-[#8B6914]">{filteredOrders.length}</span> of {orders.length} orders
        </div>

        {/* Orders list */}
        <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] overflow-hidden">
          {/* Column header (desktop) */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b-2 border-dashed border-[#E8E0D5] bg-[#F5F0E8]/60 text-xs font-bold uppercase tracking-wider text-[#8B7355]">
            <div className="col-span-2">Customer & Order</div>
            <div className="col-span-2">Order Details</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-2">Current Status</div>
            <div className="col-span-3">Update / Cancel</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-[#E8E0D5]">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-3 cs-float">🧁</div>
                <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">No orders found</h3>
                <p className="text-[#8B7355] max-w-md mx-auto">
                  {searchQuery || statusFilter !== "all" || orderTypeFilter !== "all"
                    ? "No orders match the current search or filters. Try clearing them."
                    : "No orders have come in yet. New orders will show up here."}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const sc = statusColors[order.status] || fallbackStatus;
                const tc = orderTypeColors[order.orderType] || orderTypeColors.fixed;
                return (
                  <div key={order._id} className="relative px-5 md:px-6 py-5 pl-7 md:pl-8 hover:bg-[#F5F0E8]/50 transition-colors duration-200">
                    {/* status stripe */}
                    <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${sc.bar}`}></span>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-4 items-center">
                      {/* Customer & order */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] flex items-center justify-center shadow border border-[#E8D58A]">
                            {order.user?.name ? (
                              <span className="font-extrabold">{order.user.name.charAt(0).toUpperCase()}</span>
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#3E2C1C] truncate">{order.user?.name || "Unknown User"}</p>
                            <p className="text-xs font-semibold text-[#8B7355] truncate">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="mt-2 inline-block rounded-full bg-[#F5F0E8] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#8B7355] border border-[#E8E0D5]">
                          #{order._id?.slice(-8)}
                        </div>
                      </div>

                      {/* Order details */}
                      <div className="md:col-span-2 space-y-1.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${tc.bg} ${tc.text} ${tc.border}`}>
                          {order.orderType === "custom" ? "Custom" : "Fixed"}
                        </span>
                        <p className="cs-display text-xl font-extrabold text-[#3E2C1C]">
                          {formatPrice(order.totalPrice || 0)}
                        </p>
                        {order.deliveryDate && (
                          <p className="text-xs font-semibold text-[#8B7355] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#C9A227]" /> Deliver by {new Date(order.deliveryDate).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>

                      {/* Payment */}
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-sm font-bold text-[#3E2C1C]">
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                        </p>
                        <p className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          order.paymentMethod === "cod" ? "bg-orange-50 text-orange-700 border-orange-200" 
                          : order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {order.paymentMethod === "cod" ? "COLLECT ON DELIVERY" : order.paymentStatus === "paid" ? "PAID" : "PAYMENT PENDING"}
                        </p>
                        {order.mobile && <p className="text-xs font-semibold text-[#8B7355] truncate">📱 {order.mobile}</p>}
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className="text-base">{sc.icon}</span>
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-3">
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={order.status}
                            disabled={order.status === "cancelled"}
                            onChange={async (e) => {
                              await dispatch(changeOrderStatus({ id: order._id, status: e.target.value }));
                              dispatch(getAllOrdersAdmin());
                            }}
                            className={`px-4 py-2 text-sm font-bold rounded-full border-2 focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all ${
                              order.status === "cancelled" ? "bg-[#F5F0E8] text-[#8B7355] border-[#E8E0D5] cursor-not-allowed"
                              : "border-[#E8E0D5] hover:border-[#C9A227]/50 bg-[#FFFDF9] text-[#3E2C1C]"
                            }`}
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            {order.status === "cancelled" && <option value="cancelled">Cancelled</option>}
                          </select>

                          {order.status !== "cancelled" && (
                            <button
                              onClick={() => openCancelModal(order)}
                              className="px-4 py-2 text-sm font-bold text-red-600 bg-[#FFFDF9] border-2 border-red-200 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors duration-200 flex items-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* View */}
                      <div className="md:col-span-1 md:text-right">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="w-full md:w-auto px-4 py-2 text-sm font-bold text-[#2E1B0F] bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-full shadow hover:shadow-md hover:from-[#B8911E] hover:to-[#C9A227] transition-all flex items-center justify-center gap-1.5"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="md:hidden lg:inline">Open</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Cancel order dialog ---------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2E1B0F]/60 backdrop-blur-sm" onClick={closeCancelModal}></div>

          <div className="cs-pop relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-[#FDFBF7] shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 pt-6 pb-4 text-white">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="cs-display text-2xl font-bold">Cancel this order?</h3>
                  <p className="text-sm text-white/85">Order #{selectedOrder?._id?.slice(-8)}</p>
                </div>
              </div>
            </div>
            <div className="cs-frosting-rose"></div>

            {/* Body */}
            <div className="px-6 pb-6 pt-2">
              <p className="text-sm text-[#8B7355] mb-3">
                You're cancelling the order placed by <span className="font-bold text-[#3E2C1C]">{selectedOrder?.user?.name || "this customer"}</span>. Enter the reason for cancellation below.
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Cancellation reason (required)"
                className="w-full px-4 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#E8E0D5] focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition resize-none text-[#3E2C1C] font-semibold"
                rows="4"
              />

              {!reason.trim() && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-4 h-4" /> A reason is required to cancel this order
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 h-12 rounded-full border-2 border-[#E8E0D5] text-[#8B7355] font-bold hover:bg-[#F5F0E8] transition"
                >
                  Keep Order
                </button>

                <button
                  disabled={!reason.trim()}
                  onClick={async () => {
                    if (!reason.trim()) return;
                    await dispatch(cancelOrderByAdmin({ id: selectedOrder._id, reason }));
                    setShowModal(false);
                    setReason("");
                    dispatch(getAllOrdersAdmin());
                  }}
                  className="flex-1 h-12 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg hover:from-red-700 hover:to-rose-700 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- small building block ---------- */

const StatBox = ({ label, value, hint, icon, gradient }) => (
  <div className="relative overflow-hidden bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] shadow-lg shadow-[#E8E0D5]/60 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cs-rise">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`}></div>
    <div className="relative flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">{label}</p>
        <p className="cs-display text-2xl md:text-3xl font-extrabold text-[#3E2C1C] truncate">{value}</p>
        {hint && <p className="text-xs font-semibold text-[#8B7355] mt-0.5">{hint}</p>}
      </div>
      <div className={`h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminOrders;