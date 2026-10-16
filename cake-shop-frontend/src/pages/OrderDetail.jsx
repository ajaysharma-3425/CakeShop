import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../features/orders/orderSlice";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Printer,
  Truck,
  User,
  AlertCircle,
  FileText,
  MessageSquare,
  Mail,
  HelpCircle,
  Check,
  Hash,
  XCircle,
  RefreshCw,
} from "lucide-react";

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
@keyframes cs-rise  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 5s ease-in-out infinite; }
.cs-rise  { animation: cs-rise .45s ease-out both; }

@media print {
  .no-print { display: none !important; }
  .cs-body { background: #fff !important; }
  .print-card { box-shadow: none !important; break-inside: avoid; }
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

const PHONE_DISPLAY = "+91 98765 43210";
const PHONE_DIGITS = "919876543210";
const SUPPORT_EMAIL = "support@CakeCraft.com";

// progress steps (a "pending" status counts as "placed")
const STEPS = [
  { key: "placed", title: "Order Placed", icon: "⏳", message: "We've got your order!" },
  { key: "confirmed", title: "Confirmed", icon: "✅", message: "Your order has been confirmed" },
  { key: "preparing", title: "Preparing", icon: "👨‍🍳", message: "Our chef is working on your cake 👩‍🍳" },
  { key: "ready", title: "Ready", icon: "📦", message: "Your cake is ready and waiting 🎂" },
  { key: "delivered", title: "Delivered", icon: "🚚", message: "Enjoy your cake! 🎉" },
];

/* 🎨 STATUS COLORS RESTORED (Original Vibrant Colors) */
const STATUS_CONFIG = {
  placed: { color: "bg-amber-50 text-amber-800 border-amber-200", label: "Pending", icon: "⏳" },
  confirmed: { color: "bg-orange-50 text-orange-800 border-orange-200", label: "Confirmed", icon: "✅" },
  preparing: { color: "bg-pink-50 text-pink-800 border-pink-200", label: "Preparing", icon: "👨‍🍳" },
  ready: { color: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200", label: "Ready for Delivery", icon: "📦" },
  delivered: { color: "bg-green-50 text-green-800 border-green-200", label: "Delivered", icon: "🚚" },
  cancelled: { color: "bg-red-50 text-red-800 border-red-200", label: "Cancelled", icon: "❌" },
};

const PAYMENT_CONFIG = {
  paid: { color: "bg-green-50 text-green-800 border-green-200", label: "Paid", icon: "💰" },
  pending: { color: "bg-amber-50 text-amber-800 border-amber-200", label: "Pending", icon: "⏳" },
  failed: { color: "bg-red-50 text-red-800 border-red-200", label: "Failed", icon: "❌" },
};

const getPaymentMethodLabel = (method) => {
  const map = {
    cod: { label: "Cash on Delivery", icon: "💵", color: "text-orange-600" },
    online: { label: "Online Payment", icon: "💳", color: "text-pink-600" },
    dummy: { label: "Online Payment", icon: "💳", color: "text-pink-600" },
  };
  return map[method] || { label: "Not Provided", icon: "💳", color: "text-gray-600" };
};

const normalizeStatus = (status) => {
  const s = status?.toLowerCase() || "placed";
  return s === "pending" ? "placed" : s;
};

const formatLabel = (value) =>
  value
    ? String(value)
      .split(/[-_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
    : "";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ---------- loading skeleton ---------- */
const LoadingSkeleton = () => (
  <div className="cs-body min-h-screen bg-[#FDFBF7]">
    <style>{shopStyles}</style>
    <div className="h-56 bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F]"></div>
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="animate-pulse -mt-24 space-y-6">
        <div className="bg-[#FFFDF9] rounded-[2rem] border border-[#E8E0D5] p-8">
          <div className="h-5 bg-[#F5F0E8] rounded-full w-40 mb-6"></div>
          <div className="h-12 bg-[#F5F0E8] rounded-2xl"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#FFFDF9] rounded-[2rem] border border-[#E8E0D5] p-8">
            <div className="flex gap-6">
              <div className="h-32 w-32 bg-[#F5F0E8] rounded-3xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-[#E8E0D5] rounded-full w-3/4"></div>
                <div className="h-4 bg-[#F5F0E8] rounded-full"></div>
                <div className="h-4 bg-[#F5F0E8] rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="bg-[#FFFDF9] rounded-[2rem] border border-[#E8E0D5] p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-[#F5F0E8] rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
      <p className="cs-script text-center text-xl text-[#8B6914] mt-8">Looking up your order...</p>
    </div>
  </div>
);

/* ---------- main component ---------- */
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [imageFailed, setImageFailed] = useState(false);

  const { order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
    setImageFailed(false);
    window.scrollTo({ top: 0 });
  }, [dispatch, id]);

  const isCurrent = order && String(order._id) === String(id);

  /* ---------------- Error ---------------- */
  if (error && !isCurrent) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <style>{shopStyles}</style>
        <div className="max-w-md w-full text-center bg-[#FFFDF9] rounded-[2rem] shadow-xl border border-[#E8E0D5] p-10">
          <div className="text-6xl mb-3">🔍</div>
          <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Order Not Found</h3>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/my-orders")}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
            <button
              onClick={() => dispatch(fetchOrderById(id))}
              className="px-6 py-3 rounded-full border-2 border-[#E8E0D5] text-[#8B6914] font-bold hover:bg-[#FDF8E8] transition inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Loading ---------------- */
  if (!order || (loading && !isCurrent)) return <LoadingSkeleton />;

  /* ---------- derived ---------- */
  const status = normalizeStatus(order.status || order.orderStatus);
  const isCancelled = status === "cancelled";
  const isDelivered = status === "delivered";
  const statusObj = STATUS_CONFIG[status] || {
    color: "bg-gray-50 text-gray-800 border-gray-200",
    label: status,
    icon: "📋",
  };
  const paymentObj = PAYMENT_CONFIG[order.paymentStatus?.toLowerCase()] || {
    color: "bg-gray-50 text-gray-800 border-gray-200",
    label: order.paymentStatus || "Pending",
    icon: "💳",
  };
  const payment = getPaymentMethodLabel(order.paymentMethod);

  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.key === status));
  const orderCode = order._id?.slice(-8)?.toUpperCase();
  const customMessage = order.customDetails?.message || order.customDetails?.messageOnCake;

  const whatsappHref = `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(
    `Hi CakeCraft! 👋 I need help with my order #${orderCode}.`
  )}`;

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

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-28">
          <button
            onClick={() => navigate("/my-orders")}
            className="no-print inline-flex items-center gap-2 rounded-full bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/30 px-4 py-2 text-sm font-bold transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-3xl bg-[#FDFBF7]/20 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
                🧾
              </div>
              <div>
                <p className="cs-script text-xl md:text-2xl text-[#E8C84A]">Your order ticket</p>
                <h1 className="cs-display text-3xl md:text-5xl font-extrabold leading-tight">Order #{orderCode}</h1>
                {order.createdAt && <p className="text-[#E8E0D5] text-sm mt-1">Placed {formatDate(order.createdAt)}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center md:flex-col md:items-end gap-3">
              <div className="cs-display text-4xl md:text-5xl font-extrabold text-[#E8C84A]">
                ₹{order.totalPrice?.toLocaleString("en-IN")}
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold bg-[#FFFDF9] ${statusObj.color}`}
              >
                <span className="text-base">{statusObj.icon}</span>
                {statusObj.label}
              </span>
            </div>
          </div>
        </div>

        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-8 relative z-10 space-y-6">
        {/* ================= Progress ================= */}
        <div className="print-card bg-[#FFFDF9] rounded-[2rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-5 sm:p-8 cs-rise">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="cs-display text-xl sm:text-2xl font-bold text-[#3E2C1C]">Order Progress</h2>
          </div>

          {isCancelled ? (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 border-2 border-dashed border-red-200 p-5">
              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-700 text-lg">Order Cancelled</p>
                {order.cancelReason && (
                  <p className="text-sm text-red-600 mt-1">
                    <span className="font-bold">Reason:</span> {order.cancelReason}
                  </p>
                )}
                {order.cancelledBy === "user" && (
                  <p className="text-sm text-red-600 mt-1">This order was cancelled by you.</p>
                )}
                <p className="text-sm text-red-600/90 mt-2">
                  No worries. You can always place a new order whenever you like 💖
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start">
                {STEPS.map((step, i) => {
                  const done = isDelivered ? true : stepIndex > i;
                  const current = !isDelivered && stepIndex === i;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <span
                          className={`absolute top-5 right-1/2 w-full h-1 -translate-y-1/2 rounded-full ${isDelivered || stepIndex >= i
                            ? "bg-gradient-to-r from-pink-500 to-orange-500"
                            : "bg-pink-100"
                            }`}
                        ></span>
                      )}
                      <span
                        className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center text-base border-4 border-[#FFFDF9] shadow ${done || current ? "bg-gradient-to-br from-pink-500 to-orange-500" : "bg-pink-50 grayscale opacity-70"
                          } ${current ? "ring-4 ring-pink-200" : ""}`}
                      >
                        {done ? <Check className="w-5 h-5 text-white" /> : step.icon}
                      </span>
                      <span
                        className={`mt-2 text-[10px] sm:text-sm text-center font-bold ${done || current ? "text-[#3E2C1C]" : "text-[#8B7355]"
                          }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-6 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100 px-5 py-3 text-center font-bold text-pink-700">
                {STEPS[stepIndex].message}
              </p>
            </>
          )}
        </div>

        {/* ================= Content grid ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---------- Left ---------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order summary */}
            <div className="print-card bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-dashed border-[#E8E0D5]">
                <h2 className="cs-display text-xl sm:text-2xl font-bold text-[#3E2C1C]">Order Summary</h2>

                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border ${order.orderType === "custom"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : order.orderType === "cart"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-pink-50 text-pink-700 border-pink-200"
                    }`}
                >
                  {order.orderType === "custom"
                    ? "Custom Cake"
                    : order.orderType === "cart"
                      ? "Cart Order"
                      : "Fixed Cake"}
                </span>

              </div>

              {/* Fixed cake */}
              {order.orderType === "fixed" && order.cake && (
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0">
                    <div className="h-36 w-36 rounded-3xl overflow-hidden border-4 border-[#FDFBF7] shadow-lg bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] p-2 flex items-center justify-center">
                      {order.cake.image && !imageFailed ? (
                        <img
                          src={order.cake.image}
                          alt={order.cake.name}
                          className="h-full w-full object-contain"
                          onError={() => setImageFailed(true)}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl">🎂</div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="cs-display text-2xl font-bold text-[#3E2C1C]">{order.cake.name}</h3>
                      <span className="cs-display text-2xl font-extrabold text-[#8B6914] whitespace-nowrap">
                        ₹{order.cake.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[#8B7355] mb-5">
                      {order.cake.description || "Delicious premium cake crafted with love"}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Tile label="Quantity" value={`${order.quantity || 1} item`} />
                      <Tile label="Category" value={formatLabel(order.cake.category) || "Regular"} />
                      <Tile label="Flavor" value={formatLabel(order.cake.flavor) || "Standard"} />
                      <Tile label="Weight" value={order.cake.weight || "Regular"} />
                    </div>

                    {order.messageOnCake && (
                      <MessageBox message={order.messageOnCake} />
                    )}
                  </div>
                </div>
              )}


              {/* Cart order - multiple cakes */}
              {order.orderType === "cart" && (
                <div className="space-y-5">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <>
                      {order.items.map((item, index) => {
                        const itemCake =
                          item.cake && typeof item.cake === "object"
                            ? item.cake
                            : null;

                        const cakeName =
                          item.name || itemCake?.name || "Cake";

                        const cakeImage =
                          item.image || itemCake?.image;

                        const cakePrice = Number(
                          item.price ?? itemCake?.price ?? 0
                        );

                        const cakeQuantity = Number(item.quantity) || 1;

                        const subtotal = cakePrice * cakeQuantity;

                        return (
                          <div
                            key={
                              itemCake?._id ||
                              (typeof item.cake === "string" ? item.cake : null) ||
                              `${cakeName}-${index}`
                            }
                            className="flex flex-col sm:flex-row gap-5 border-b border-dashed border-[#E8E0D5] pb-5 last:border-b-0 last:pb-0"
                          >
                            {/* Cake Image */}
                            <div className="h-32 w-32 shrink-0 rounded-3xl overflow-hidden border-4 border-[#FDFBF7] shadow-lg bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] p-2 flex items-center justify-center">
                              {cakeImage ? (
                                <img
                                  src={cakeImage}
                                  alt={cakeName}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-5xl">🎂</span>
                              )}
                            </div>

                            {/* Cake Information */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <h3 className="cs-display text-xl sm:text-2xl font-bold text-[#3E2C1C]">
                                  {cakeName}
                                </h3>

                                <span className="cs-display text-xl font-extrabold text-[#8B6914] whitespace-nowrap">
                                  ₹{subtotal.toLocaleString("en-IN")}
                                </span>
                              </div>

                              {itemCake?.description && (
                                <p className="text-[#8B7355] mt-2">
                                  {itemCake.description}
                                </p>
                              )}

                              <p className="text-sm text-[#8B7355] mt-2">
                                Price per cake: ₹
                                {cakePrice.toLocaleString("en-IN")}
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                <Tile
                                  label="Quantity"
                                  value={`${cakeQuantity} ${cakeQuantity === 1 ? "item" : "items"
                                    }`}
                                />

                                <Tile
                                  label="Category"
                                  value={
                                    formatLabel(itemCake?.category) || "Cake"
                                  }
                                />

                                <Tile
                                  label="Subtotal"
                                  value={`₹${subtotal.toLocaleString("en-IN")}`}
                                />
                              </div>

                              {item.messageOnCake?.trim() && (
                                <MessageBox message={item.messageOnCake} />
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Total for all cart items */}
                      <div className="border-t-2 border-dashed border-[#E8E0D5] pt-5 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-extrabold text-lg">
                            Cart Order Total
                          </h3>

                          <p className="text-sm text-[#8B7355] mt-1">
                            {order.items.length} cake type(s)
                          </p>
                        </div>

                        <span className="cs-display text-2xl font-extrabold text-[#8B6914]">
                          ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-[#F5F0E8] p-5 text-center">
                      <p className="font-bold text-[#5C3A21]">
                        Cart item details are unavailable.
                      </p>

                      <p className="text-sm text-[#8B7355] mt-2">
                        Please refresh the order or contact support if the
                        problem continues.
                      </p>

                      <p className="font-bold mt-3">
                        Order Total: ₹
                        {Number(order.totalPrice || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              )}


              {/* Custom cake */}
              {order.orderType === "custom" && order.customDetails && (
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0">
                    <div className="h-36 w-36 rounded-3xl bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] border-4 border-[#FDFBF7] shadow-lg flex items-center justify-center text-6xl cs-float">
                      ✨
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="cs-display text-2xl font-bold text-[#3E2C1C]">Custom Cake</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        Personalized Design
                      </span>
                    </div>
                    <p className="text-[#8B7355] mb-5">
                      This cake was custom designed just for you with premium ingredients!
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <Tile label="Flavor" value={formatLabel(order.customDetails.flavor) || "—"} />
                      <Tile label="Weight" value={order.customDetails.weight || "—"} />
                      {order.customDetails.pricePerKg != null && (
                        <Tile
                          label="Price per kg"
                          value={`₹${order.customDetails.pricePerKg?.toLocaleString("en-IN")}`}
                        />
                      )}
                      {order.customDetails.occasion && (
                        <Tile label="Occasion" value={order.customDetails.occasion} />
                      )}
                    </div>

                    {customMessage && <MessageBox message={customMessage} />}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery & contact */}
            {order.user && (
              <div className="print-card bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-[#E8E0D5]">
                  <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="cs-display text-xl sm:text-2xl font-bold text-[#3E2C1C]">Contact & Delivery</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoTile icon={<User className="w-4 h-4" />} label="Full Name">
                    {order.user.name}
                  </InfoTile>
                  <InfoTile icon={<Mail className="w-4 h-4" />} label="Email Address">
                    <span className="break-all">{order.user.email}</span>
                  </InfoTile>
                  {order.mobile && (
                    <InfoTile icon={<Phone className="w-4 h-4" />} label="Mobile Number">
                      {order.mobile}
                    </InfoTile>
                  )}
                  {order.address && (
                    <InfoTile icon={<MapPin className="w-4 h-4" />} label="Delivery Address">
                      {order.address}
                      {(order.city || order.pincode) && (
                        <span className="block text-sm font-medium text-[#8B7355] mt-1">
                          {[order.city, order.pincode].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </InfoTile>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ---------- Right ---------- */}
          <div className="space-y-6">
            {/* Order details */}
            <div className="print-card bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border-2 border-dashed border-[#E8D58A] p-6 md:p-7">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-dashed border-[#E8E0D5]">
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="cs-display text-xl font-bold text-[#3E2C1C]">Order Details</h2>
              </div>

              <div className="divide-y divide-[#F5F0E8]">
                <Row icon={<CreditCard className="w-4 h-4" />} label="Payment Status">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${paymentObj.color}`}
                  >
                    <span>{paymentObj.icon}</span>
                    {paymentObj.label}
                  </span>
                </Row>
                <Row icon={<CreditCard className="w-4 h-4" />} label="Payment Method">
                  <span className={`font-bold text-sm ${payment.color}`}>
                    {payment.icon} {payment.label}
                  </span>
                </Row>
                <Row icon={<Calendar className="w-4 h-4" />} label="Order Date">
                  <span className="text-sm text-right text-[#8B7355]">{formatDate(order.createdAt)}</span>
                </Row>
                {order.deliveryDate && (
                  <Row icon={<Truck className="w-4 h-4" />} label="Delivery Date">
                    <span className="text-sm text-[#8B7355]">{formatShortDate(order.deliveryDate)}</span>
                  </Row>
                )}
                <Row icon={<Hash className="w-4 h-4" />} label="Order ID">
                  <span className="font-mono text-sm text-[#8B7355]">#{orderCode}</span>
                </Row>
              </div>
            </div>

            {/* Quick actions */}
            <div className="no-print rounded-[2rem] bg-gradient-to-br from-[#F5F0E8] to-[#FDFBF7] border border-[#E8E0D5] p-6">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#C9A227]" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {isDelivered && (
                  <button
                    onClick={() => navigate(`/feedback/${order._id}`)}
                    className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Give Feedback
                  </button>
                )}
                <button
                  onClick={() => navigate("/contact")}
                  className={`w-full px-4 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${isDelivered
                    ? "bg-[#FFFDF9] text-[#8B6914] border-2 border-[#E8E0D5] hover:bg-[#FDF8E8]"
                    : "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl"
                    }`}
                >
                  <Phone className="w-4 h-4" />
                  Contact Support
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 rounded-full bg-[#FFFDF9] text-[#8B6914] font-bold border-2 border-[#E8E0D5] hover:bg-[#FDF8E8] transition flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  WhatsApp About This Order
                </a>
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-3 rounded-full bg-[#FFFDF9] text-[#8B6914] font-bold border-2 border-[#E8E0D5] hover:bg-[#FDF8E8] transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Order
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="no-print bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-1">Need Immediate Help?</h3>
              <p className="text-sm text-[#8B7355] mb-4">Our customer support team is available 24/7 to assist you.</p>
              <a
                href={`tel:+${PHONE_DIGITS}`}
                className="flex items-center gap-3 text-sm font-semibold text-[#5C3A21] hover:text-[#8B6914] transition"
              >
                <span className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FDF8E8] to-[#E8E0D5] flex items-center justify-center text-[#8B6914]">
                  <Phone className="w-4 h-4" />
                </span>
                {PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-3 flex items-center gap-3 text-sm font-semibold text-[#5C3A21] hover:text-[#8B6914] transition"
              >
                <span className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FDF8E8] to-[#E8E0D5] flex items-center justify-center text-[#8B6914]">
                  <Mail className="w-4 h-4" />
                </span>
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const Tile = ({ label, value }) => (
  <div className="rounded-2xl bg-gradient-to-br from-[#F5F0E8] to-[#FDFBF7] border border-[#E8E0D5] p-4">
    <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">{label}</div>
    <div className="font-bold text-[#3E2C1C] break-words">{value}</div>
  </div>
);

const InfoTile = ({ icon, label, children }) => (
  <div className="rounded-2xl bg-[#F5F0E8]/60 border border-[#E8E0D5] p-4">
    <div className="flex items-center gap-2 text-[#8B6914] mb-1.5">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="font-bold text-[#3E2C1C]">{children}</div>
  </div>
);

const MessageBox = ({ message }) => (
  <div className="mt-6 pt-5 border-t-2 border-dashed border-[#E8E0D5]">
    <div className="flex items-center gap-2 mb-3">
      <MessageSquare className="w-5 h-5 text-[#C9A227]" />
      <div className="text-sm font-bold text-[#5C3A21]">Message on your cake</div>
    </div>
    <div className="rounded-2xl bg-gradient-to-r from-[#F5F0E8] to-[#FDFBF7] border border-[#E8E0D5] p-4">
      <div className="cs-script text-xl text-[#8B6914] break-words">“{message}”</div>
    </div>
  </div>
);

const Row = ({ icon, label, children }) => (
  <div className="flex justify-between items-center gap-4 py-3">
    <div className="text-[#8B7355] flex items-center gap-2 text-sm font-semibold">
      {icon}
      {label}
    </div>
    <div className="font-bold text-[#3E2C1C]">{children}</div>
  </div>
);

export default OrderDetails;