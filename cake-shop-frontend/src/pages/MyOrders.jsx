import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as orderActions from "../features/orders/orderSlice";
import {
  ShoppingBag,
  CreditCard,
  Calendar,
  Package,
  Truck,
  XCircle,
  PlusCircle,
  Download,
  ChevronRight,
  Trash2,
  CheckCircle,
  Phone,
  MessageSquare,
  AlertCircle,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; } /* Bade Letters ke liye */
.cs-script  { font-family: 'Pacifico', cursive; }

.cs-frosting-bottom {
  height: 28px;
  background-image: radial-gradient(circle at 50% 100%, #FDFBF7 0 18px, transparent 19px);
  background-size: 44px 28px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes cs-pop   { 0% { opacity: 0; transform: translateY(20px) scale(.97); } 100% { opacity: 1; transform: none; } }
@keyframes cs-rise  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 5s ease-in-out infinite; }
.cs-pop   { animation: cs-pop .3s ease-out both; }
.cs-rise  { animation: cs-rise .45s ease-out both; }

.cs-hide-scrollbar { scrollbar-width: none; }
.cs-hide-scrollbar::-webkit-scrollbar { display: none; }

@media print {
  .no-print { display: none !important; }
  .cs-body { background: #fff !important; }
}
`;

const SPRINKLES = [
  { top: "14%", left: "6%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "62%", left: "14%", color: "bg-[#FDFBF7]", rot: "-35deg", delay: ".6s" },
  { top: "20%", left: "32%", color: "bg-[#E8C84A]", rot: "60deg", delay: "1.2s" },
  { top: "70%", left: "48%", color: "bg-[#D4AF37]", rot: "-15deg", delay: ".3s" },
  { top: "16%", right: "26%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
  { top: "58%", right: "12%", color: "bg-[#FDFBF7]", rot: "75deg", delay: "1.5s" },
  { top: "22%", right: "6%", color: "bg-[#C9A227]", rot: "-50deg", delay: "1.8s" },
];

/* 🎨 STATUS COLORS RESTORED (Original Vibrant Colors) */
const STATUS = {
  placed: { label: "Processing", icon: "⏳", badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-400" },
  confirmed: { label: "Confirmed", icon: "✅", badge: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-orange-400" },
  preparing: { label: "Preparing", icon: "👨‍🍳", badge: "bg-pink-50 text-pink-700 border-pink-200", bar: "bg-pink-400" },
  ready: { label: "Ready", icon: "📦", badge: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", bar: "bg-fuchsia-400" },
  delivered: { label: "Delivered", icon: "🚚", badge: "bg-green-50 text-green-700 border-green-200", bar: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: "❌", badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-400" },
  deleted: { label: "Archived", icon: "🗑️", badge: "bg-gray-50 text-gray-700 border-gray-200", bar: "bg-gray-300" },
};

const TRACKER = [
  { key: "placed", label: "Placed", icon: "⏳" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Baking", icon: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: "📦" },
  { key: "delivered", label: "Delivered", icon: "🚚" },
];

const SORTS = [
  { value: "recent", label: "Recent First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "price-asc", label: "Price: Low to High" },
];

const statusOf = (order) => order.status?.toLowerCase() || "placed";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatLabel = (value) =>
  value
    ? String(value)
        .split(/[-_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

/* 🎨 PAYMENT COLORS RESTORED */
const getPaymentMethodLabel = (method) => {
  const map = {
    cod: { label: "Cash on Delivery", icon: "💵", color: "text-orange-600" },
    online: { label: "Online Payment", icon: "💳", color: "text-pink-600" },
    dummy: { label: "Online Payment", icon: "💳", color: "text-pink-600" },
  };
  return map[method?.toLowerCase()] || { label: "Online Payment", icon: "💳", color: "text-pink-600" };
};

const MyOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders = [], loading, error } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.auth?.user);

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const canDelete = typeof orderActions.deleteOrder === "function";

  useEffect(() => {
    dispatch(orderActions.fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = confirm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [confirm]);

  const firstName = user?.name?.split(" ")[0];

  const archivedOrders = useMemo(() => orders.filter((o) => statusOf(o) === "deleted"), [orders]);
  const liveOrders = useMemo(() => orders.filter((o) => statusOf(o) !== "deleted"), [orders]);

  const counts = useMemo(
    () => ({
      active: orders.filter((o) => !["cancelled", "deleted", "delivered"].includes(statusOf(o))).length,
      delivered: orders.filter((o) => statusOf(o) === "delivered").length,
      cancelled: orders.filter((o) => statusOf(o) === "cancelled").length,
      spent: orders
        .filter((o) => !["cancelled", "deleted"].includes(statusOf(o)))
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    }),
    [orders]
  );

  const tabs = [
    { value: "all", label: "All Orders", count: liveOrders.length },
    { value: "active", label: "Active", count: counts.active },
    { value: "delivered", label: "Delivered", count: counts.delivered },
    { value: "cancelled", label: "Cancelled", count: counts.cancelled },
    ...(archivedOrders.length > 0 ? [{ value: "archived", label: "Archived", count: archivedOrders.length }] : []),
  ];

  const shownOrders = useMemo(() => {
    let list;
    if (filter === "active") list = orders.filter((o) => !["cancelled", "deleted", "delivered"].includes(statusOf(o)));
    else if (filter === "delivered") list = orders.filter((o) => statusOf(o) === "delivered");
    else if (filter === "cancelled") list = orders.filter((o) => statusOf(o) === "cancelled");
    else if (filter === "archived") list = archivedOrders;
    else list = liveOrders;

    const sorted = [...list];
    if (sortBy === "oldest") sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "price-desc") sorted.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    else if (sortBy === "price-asc") sorted.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted;
  }, [orders, liveOrders, archivedOrders, filter, sortBy]);

  const handleGiveFeedback = (orderId) => {
    navigate(`/feedback/${orderId}`);
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    const { type, order } = confirm;
    setBusy(true);
    try {
      const action =
        type === "delete" ? orderActions.deleteOrder(order._id) : orderActions.cancelOrder(order._id);
      const result = dispatch(action);
      if (result?.unwrap) await result.unwrap();

      toast.success(type === "delete" ? "Order deleted" : "Order cancelled");
      setConfirm(null);
      dispatch(orderActions.fetchMyOrders());
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : type === "delete"
          ? "Couldn't delete the order. Please try again."
          : "Couldn't cancel the order. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading && orders.length === 0) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7]">
        <style>{shopStyles}</style>
        <div className="h-56 bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F]"></div>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-5 -mt-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#FFFDF9] rounded-[1.75rem] p-6 border border-[#E8E0D5]">
                  <div className="h-10 w-10 bg-[#F5F0E8] rounded-2xl mb-3"></div>
                  <div className="h-7 bg-[#E8E0D5] rounded-full w-1/2 mb-2"></div>
                  <div className="h-4 bg-[#F5F0E8] rounded-full w-3/4"></div>
                </div>
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#FFFDF9] rounded-[2rem] p-6 border border-[#E8E0D5]">
                <div className="flex justify-between mb-5">
                  <div className="space-y-2">
                    <div className="h-6 bg-[#E8E0D5] rounded-full w-40"></div>
                    <div className="h-4 bg-[#F5F0E8] rounded-full w-32"></div>
                  </div>
                  <div className="h-8 bg-[#E8E0D5] rounded-full w-24"></div>
                </div>
                <div className="h-16 bg-[#F5F0E8] rounded-2xl"></div>
              </div>
            ))}
          </div>
          <p className="cs-script text-center text-xl text-[#8B6914] mt-8">Fetching your sweet orders...</p>
        </div>
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error && orders.length === 0) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <style>{shopStyles}</style>
        <div className="max-w-md w-full text-center bg-[#FFFDF9] rounded-[2rem] shadow-xl border border-[#E8E0D5] p-10">
          <div className="text-6xl mb-3">🍰</div>
          <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Oops, we couldn't load your orders</h3>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <button
            onClick={() => dispatch(orderActions.fetchMyOrders())}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* ================= Banner ================= */}
      <section className="relative bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#C9A227]/10"></div>
          <div className="absolute -bottom-24 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-[#C9A227]/10"></div>
          {SPRINKLES.map((s, i) => (
            <span
              key={i}
              className={`cs-float absolute hidden sm:block h-2 w-6 rounded-full opacity-80 ${s.color}`}
              style={{ top: s.top, left: s.left, right: s.right, "--r": s.rot, animationDelay: s.delay }}
            ></span>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 md:pt-14 md:pb-28">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="cs-script text-2xl md:text-3xl text-[#E8C84A] cs-rise">
                Hey {firstName || "there"}! 👋
              </p>
              <h1 className="cs-display mt-1 text-4xl md:text-5xl font-extrabold cs-rise">My Cake Orders</h1>
              <p className="mt-3 text-lg text-[#E8E0D5] max-w-xl cs-rise">
                Track and manage all your delicious cake orders in one place
              </p>
            </div>
            <button
              onClick={() => navigate("/cakes")}
              className="no-print inline-flex items-center justify-center gap-2 self-start md:self-auto rounded-full bg-[#FDFBF7] px-7 py-3.5 font-bold text-[#5C3A21] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5" />
              Order More
            </button>
          </div>
        </div>

        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ================= Stats (ICON COLORS RESTORED) ================= */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-14 relative z-10 mb-8">
            <StatBox
              icon={<ShoppingBag className="w-5 h-5" />}
              gradient="from-pink-500 to-rose-500"
              value={counts.active}
              label="Active Orders"
              hint="Currently in progress"
            />
            <StatBox
              icon={<CheckCircle className="w-5 h-5" />}
              gradient="from-emerald-500 to-green-500"
              value={counts.delivered}
              label="Delivered"
              hint="Safely at your door"
            />
            <StatBox
              icon={<CreditCard className="w-5 h-5" />}
              gradient="from-orange-500 to-amber-500"
              value={`₹${counts.spent.toLocaleString("en-IN")}`}
              label="Total Spent"
              hint="Excluding cancelled orders"
            />
            <StatBox
              icon={<XCircle className="w-5 h-5" />}
              gradient="from-gray-400 to-gray-500"
              value={counts.cancelled}
              label="Cancelled"
              hint="Orders you cancelled"
            />
          </div>
        )}

        {orders.length === 0 ? (
          /* ================= Empty ================= */
          <div className="mt-[-3rem] relative z-10 max-w-2xl mx-auto bg-[#FFFDF9] rounded-[2.25rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-10 md:p-14 text-center">
            <div className="text-7xl mb-4 cs-float inline-block">🎂</div>
            <h3 className="cs-display text-3xl font-extrabold text-[#3E2C1C] mb-3">No orders yet, let's fix that!</h3>
            <p className="text-[#8B7355] mb-8 max-w-md mx-auto">
              Your cake journey hasn't started yet. Explore our delicious collection or design your very own custom cake!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/cakes")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-8 py-3.5 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Cake Collection
              </button>
              <button
                onClick={() => navigate("/custom-cake")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-8 py-3.5 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
              >
                <PlusCircle className="w-5 h-5" />
                Design Custom Cake
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ================= Tabs + sort ================= */}
            <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div className="flex gap-2 overflow-x-auto cs-hide-scrollbar pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
                {tabs.map((tab) => {
                  const active = filter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value)}
                      className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border-2 transition ${
                        active
                          ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow-lg shadow-[#C9A227]/30"
                          : "bg-[#FFFDF9] text-[#8B6914] border-[#E8E0D5] hover:bg-[#FDF8E8] hover:border-[#E8D58A]"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          active ? "bg-black/10 text-[#2E1B0F]" : "bg-[#FDF8E8] text-[#8B6914]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="inline-flex items-center gap-2 self-start lg:self-auto text-sm font-bold text-[#8B7355]">
                Sort by
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-4 py-2 font-bold text-[#3E2C1C] focus:outline-none focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/20 transition"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mb-5 text-sm font-semibold text-[#8B7355]">
              Showing <span className="text-[#8B6914]">{shownOrders.length}</span>{" "}
              {shownOrders.length === 1 ? "order" : "orders"}
            </p>

            {/* ================= Orders ================= */}
            {shownOrders.length === 0 ? (
              <div className="bg-[#FFFDF9] rounded-[2rem] border-2 border-dashed border-[#E8E0D5] py-14 px-6 text-center">
                <div className="text-5xl mb-3">🧁</div>
                <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Nothing here yet</h3>
                <p className="text-[#8B7355] mb-5">No orders match this filter.</p>
                <button
                  onClick={() => setFilter("all")}
                  className="rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-7 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl transition"
                >
                  Show all orders
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {shownOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    canDelete={canDelete}
                    onView={() => navigate(`/orders/${order._id}`)}
                    onFeedback={() => handleGiveFeedback(order._id)}
                    onCancel={() => setConfirm({ type: "cancel", order })}
                    onDelete={() => setConfirm({ type: "delete", order })}
                  />
                ))}
              </div>
            )}

            {/* ================= Help footer ================= */}
            <div className="no-print mt-14 pt-8 border-t-2 border-dashed border-[#E8E0D5] text-center">
              <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-1">Need a hand with your orders?</h3>
              <p className="text-[#8B7355] mb-6">We're always happy to help 💖</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("/cakes")}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Order More Cakes
                </button>
                <button
                  onClick={() => navigate("/custom-cake")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-6 py-3 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Design Custom Cake
                </button>
                <button
                  onClick={() => navigate("/support")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-6 py-3 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
                >
                  <Phone className="w-4 h-4" />
                  Contact Support
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-6 py-3 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
                >
                  <Download className="w-4 h-4" />
                  Print Orders
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= Confirm dialog ================= */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2E1B0F]/50 backdrop-blur-sm" onClick={() => !busy && setConfirm(null)}></div>
          <div className="cs-pop relative w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] bg-[#FDFBF7] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-5 text-white flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="cs-display text-2xl font-bold">
                  {confirm.type === "delete" ? "Delete this order?" : "Cancel this order?"}
                </h3>
                <p className="text-sm text-white/85">Order #{confirm.order._id?.slice(-8)?.toUpperCase()}</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-[#8B7355] mb-5">
                {confirm.type === "delete"
                  ? "This will remove the order from your list. This can't be undone."
                  : "Changed your mind? Cancelling can't be undone, but you can always place a new order."}
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  disabled={busy}
                  className="flex-1 h-12 rounded-full border-2 border-[#E8E0D5] text-[#8B7355] font-bold hover:bg-[#F5F0E8] transition disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={runConfirmed}
                  disabled={busy}
                  className="flex-1 h-12 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg hover:from-red-700 hover:to-rose-700 hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {busy ? "Working..." : confirm.type === "delete" ? "Delete Order" : "Yes, Cancel It"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Order card ---------- */
const OrderCard = ({ order, canDelete, onView, onFeedback, onCancel, onDelete }) => {
  const status = statusOf(order);
  const st = STATUS[status] || { label: status, icon: "📋", badge: "bg-gray-50 text-gray-700 border-gray-200", bar: "bg-gray-300" };
  const isCustom = order.orderType === "custom";
  const isDelivered = status === "delivered";
  const isCancelled = status === "cancelled";
  const canCancel = ["placed", "confirmed"].includes(status);
  const payment = getPaymentMethodLabel(order.paymentMethod);
  const [imageFailed, setImageFailed] = useState(false);

  const customMessage = order.customDetails?.messageOnCake || order.customDetails?.message;
  const fixedMessage = !isCustom ? order.messageOnCake : "";
  const trackerIndex = TRACKER.findIndex((t) => t.key === status);

  const paymentBadge = (() => {
    const map = {
      paid: { cls: "bg-green-50 text-green-700 border-green-200", label: "Paid", icon: "💰" },
      pending: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending", icon: "⏳" },
      failed: { cls: "bg-red-50 text-red-700 border-red-200", label: "Failed", icon: "❌" },
    };
    return (
      map[order.paymentStatus?.toLowerCase()] || {
        cls: "bg-gray-50 text-gray-700 border-gray-200",
        label: order.paymentStatus || "Pending",
        icon: "💳",
      }
    );
  })();

  return (
    <div className="group relative bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-2xl hover:border-[#C9A227]/50 transition-all duration-300 overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${st.bar}`}></span>

      <div className="p-5 sm:p-7 pl-6 sm:pl-9">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b-2 border-dashed border-[#E8E0D5]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="cs-display text-xl font-extrabold text-[#3E2C1C]">
                Order #{order._id?.slice(-8)?.toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  isCustom ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-pink-50 text-pink-700 border-pink-200"
                }`}
              >
                {isCustom ? "Custom Design" : "Regular Cake"}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.badge}`}>
                <span>{st.icon}</span>
                {st.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#8B7355]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-500" />
                Placed on {formatDate(order.createdAt)}
              </span>
              {order.deliveredAt && <span>• Delivered on {formatDate(order.deliveredAt)}</span>}
            </div>
          </div>

          <div className="md:text-right">
            <div className="cs-display text-3xl font-extrabold text-[#3E2C1C]">
              <span className="text-[#8B6914]">₹</span>
              {order.totalPrice?.toLocaleString("en-IN")}
            </div>
            <div className="text-sm font-semibold text-[#8B7355]">Total Amount</div>
          </div>
        </div>

        {/* Progress / cancelled banner */}
        {isCancelled ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-50 border-2 border-dashed border-red-200 p-4">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700">This order was cancelled</p>
              <p className="text-sm text-red-600/90">No worries. You can always place a new order whenever you like.</p>
            </div>
          </div>
        ) : (
          trackerIndex !== -1 && (
            <div className="mt-6 flex items-start">
              {TRACKER.map((step, i) => {
                const done = trackerIndex > i;
                const current = trackerIndex === i;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <span
                        className={`absolute top-4 right-1/2 w-full h-1 -translate-y-1/2 rounded-full ${
                          trackerIndex >= i ? "bg-gradient-to-r from-pink-500 to-orange-500" : "bg-pink-100"
                        }`}
                      ></span>
                    )}
                    <span
                      className={`relative z-10 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-sm border-4 border-[#FFFDF9] shadow ${
                        done || current ? "bg-gradient-to-br from-pink-500 to-orange-500" : "bg-pink-50 grayscale opacity-70"
                      } ${current && !isDelivered ? "ring-4 ring-pink-200" : ""}`}
                    >
                      {done || (current && isDelivered) ? <Check className="w-4 h-4 text-white" /> : step.icon}
                    </span>
                    <span
                      className={`mt-1.5 text-[10px] sm:text-xs text-center font-bold ${
                        done || current ? "text-[#3E2C1C]" : "text-[#8B7355]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cake */}
          <div className="flex items-start gap-4">
            <div
              className={`h-16 w-16 shrink-0 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#FDFBF7] shadow-md ${
                isCustom ? "bg-gradient-to-br from-orange-100 to-pink-100" : "bg-gradient-to-br from-pink-100 to-orange-100"
              }`}
            >
              {!isCustom && order.cake?.image && !imageFailed ? (
                <img
                  src={order.cake.image}
                  alt={order.cake?.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span className="text-3xl">{isCustom ? "✨" : "🎂"}</span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="cs-display font-bold text-[#3E2C1C] text-lg leading-snug">
                {isCustom ? "Custom Cake" : order.cake?.name || "Cake"}
                {!isCustom && order.quantity > 1 && (
                  <span className="ml-2 text-sm font-bold text-pink-600">×{order.quantity}</span>
                )}
              </h4>
              <p className="text-sm text-[#8B7355]">
                {isCustom
                  ? `${formatLabel(order.customDetails?.flavor) || "Classic"}, ${order.customDetails?.weight || "1kg"}`
                  : order.cake?.description?.slice(0, 60) || "Delicious cake"}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="lg:border-l-2 lg:border-dashed lg:border-[#E8E0D5] lg:pl-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">Payment</div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${paymentBadge.cls}`}
            >
              <span>{paymentBadge.icon}</span>
              {paymentBadge.label}
            </span>
            <div className={`mt-2 text-sm font-bold ${payment.color}`}>
              {payment.icon} {payment.label}
            </div>
          </div>

          {/* Delivery */}
          <div className="lg:border-l-2 lg:border-dashed lg:border-[#E8E0D5] lg:pl-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">Delivery</div>
            <div className="flex items-center gap-2 mb-1">
              <Truck
                className={`w-5 h-5 ${isDelivered ? "text-green-600" : isCancelled ? "text-red-500" : "text-pink-500"}`}
              />
              <span className="font-bold text-[#3E2C1C]">
                {isDelivered ? "Delivered" : isCancelled ? "Cancelled" : "In Progress"}
              </span>
            </div>
            {order.deliveryDate && <div className="text-sm text-[#8B7355]">{formatDate(order.deliveryDate)}</div>}
            {order.deliveredAt && <div className="text-sm text-green-600 font-bold">✓ Successfully delivered</div>}
          </div>

          {/* Actions */}
          <div className="no-print lg:border-l-2 lg:border-dashed lg:border-[#E8E0D5] lg:pl-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">Quick Actions</div>
            <div className="space-y-2">
              <button
                onClick={onView}
                className="w-full px-4 py-2.5 text-sm font-bold text-pink-700 bg-pink-50 rounded-full hover:bg-pink-100 transition flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                View Details
              </button>

              {isDelivered && (
                <>
                  <button
                    onClick={onFeedback}
                    className="w-full px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-orange-500 rounded-full shadow hover:shadow-md hover:from-pink-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Give Feedback
                  </button>
                  {canDelete && (
                    <button
                      onClick={onDelete}
                      className="w-full px-4 py-2.5 text-sm font-bold text-red-600 bg-[#FFFDF9] border-2 border-red-200 rounded-full hover:bg-red-50 hover:border-red-300 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Order
                    </button>
                  )}
                </>
              )}

              {!isDelivered && canCancel && (
                <button
                  onClick={onCancel}
                  className="w-full px-4 py-2.5 text-sm font-bold text-red-600 bg-[#FFFDF9] border-2 border-red-200 rounded-full hover:bg-red-50 hover:border-red-300 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message on a regular cake */}
        {fixedMessage && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100 px-5 py-3 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-pink-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Message on cake</div>
              <div className="cs-script text-pink-700 break-words">“{fixedMessage}”</div>
            </div>
          </div>
        )}

        {/* Custom details */}
        {isCustom && order.customDetails && (
          <div className="mt-6 rounded-3xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-pink-600" />
              <div className="text-sm font-bold text-[#5C3A21]">Your customization</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailTile label="Flavor" value={formatLabel(order.customDetails.flavor) || "Classic"} />
              <DetailTile label="Weight" value={order.customDetails.weight || "1kg"} />
              <DetailTile label="Occasion" value={order.customDetails.occasion || "Celebration"} />
              {customMessage && <DetailTile label="Message" value={`“${customMessage}”`} script />}
            </div>
          </div>
        )}

        {/* Delivered celebration */}
        {isDelivered && (
          <div className="no-print mt-6 rounded-3xl bg-gradient-to-r from-pink-50 to-orange-50 border-2 border-dashed border-pink-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-12 w-12 shrink-0 rounded-full bg-[#FFFDF9] shadow flex items-center justify-center text-2xl">
                🎉
              </div>
              <div className="flex-1">
                <div className="cs-display font-bold text-[#3E2C1C] text-lg">Yum! Your order has been delivered</div>
                <div className="text-sm text-[#8B7355]">
                  Thank you for choosing CakeCraft! We hope you loved every bite.
                  {!order.feedbackGiven && " Tell us how it went?"}
                </div>
              </div>
              {order.feedbackGiven ? (
                <span className="text-sm font-bold text-pink-600">Thanks for your feedback 💖</span>
              ) : (
                <button
                  onClick={onFeedback}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-pink-700 hover:to-orange-600 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Rate Order
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer link */}
        <button
          onClick={onView}
          className="no-print mt-6 w-full pt-4 border-t-2 border-dashed border-[#E8E0D5] flex items-center justify-between text-left"
        >
          <span className="text-sm text-[#8B7355] group-hover:text-[#5C3A21] transition-colors">
            Tap to see everything about this order
          </span>
          <span className="text-sm font-bold text-pink-600 group-hover:text-pink-700 transition-colors flex items-center gap-1">
            View Complete Details
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const StatBox = ({ icon, gradient, value, label, hint }) => (
  <div className="relative overflow-hidden bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] shadow-lg shadow-[#E8E0D5]/60 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`}></div>
    <div className="relative flex items-center justify-between gap-3 mb-3">
      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md flex items-center justify-center`}>
        {icon}
      </div>
      <div className="cs-display text-2xl md:text-3xl font-extrabold text-[#3E2C1C] text-right truncate">{value}</div>
    </div>
    <div className="relative">
      <div className="text-sm font-bold text-[#5C3A21]">{label}</div>
      <div className="text-xs text-[#8B7355]">{hint}</div>
    </div>
  </div>
);

const DetailTile = ({ label, value, script }) => (
  <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-[#E8E0D5]">
    <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">{label}</div>
    <div className={`font-bold text-[#3E2C1C] truncate ${script ? "cs-script text-pink-700 font-normal" : ""}`}>{value}</div>
  </div>
);

export default MyOrders;