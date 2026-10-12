import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderByIdAdmin } from "../../features/admin/adminOrderSlice";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Truck,
  Cake,
  FileText,
  AlertCircle,
  Shield,
  MessageSquare,
  Gift,
  Clock,
  ShoppingBag,
  Printer,
  Download,
  Home,
  Hash,
  RefreshCw,
} from "lucide-react";

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; }
.cs-script  { font-family: 'Pacifico', cursive; }

.cs-frosting {
  height: 22px;
  background-image: radial-gradient(circle at 50% 0, #f97316 0 15px, transparent 16px);
  background-size: 36px 22px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.cs-float { animation: cs-float 4s ease-in-out infinite; }

/* clean print-out of the order ticket */
@media print {
  .no-print { display: none !important; }
  .cs-body { background: #fff !important; }
  .print-card { box-shadow: none !important; break-inside: avoid; }
}
`;

const STEPS = [
  { key: "placed", label: "Placed", icon: "⏳" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: "📦" },
  { key: "delivered", label: "Delivered", icon: "🚚" },
];

const STATUS_ICON = {
  placed: "⏳",
  confirmed: "✅",
  preparing: "👨‍🍳",
  ready: "📦",
  delivered: "🚚",
  cancelled: "❌",
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, loading, error } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(getOrderByIdAdmin(id));
  }, [dispatch, id]);

  const getPaymentMethodLabel = (method) => {
    const map = {
      cod: {
        label: "Cash on Delivery",
        icon: "💵",
        color: "text-orange-600",
      },
      online: {
        label: "Online Payment",
        icon: "💳",
        color: "text-pink-600",
      },
      dummy: {
        label: "Online Payment",
        icon: "💳",
        color: "text-pink-600",
      },
    };

    return (
      map[method] || {
        label: "Not Provided",
        icon: "💳",
        color: "text-gray-600",
      }
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      placed: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-orange-50 text-orange-700 border-orange-200",
      preparing: "bg-pink-50 text-pink-700 border-pink-200",
      ready: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Get payment status color
  const getPaymentColor = (status) => {
    const colors = {
      paid: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      failed: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="cs-body min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <style>{shopStyles}</style>
        <div className="text-center">
          <div className="text-6xl cs-float">🧾</div>
          <p className="cs-script mt-4 text-2xl text-pink-600">Loading order details...</p>
          <div className="mt-4 mx-auto h-1.5 w-40 rounded-full bg-pink-100 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <div className="cs-body min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <style>{shopStyles}</style>
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-pink-100 p-10 text-center">
          <div className="text-6xl mb-3">📋</div>
          <h3 className="cs-display text-2xl font-bold text-gray-900 mb-2">Couldn't load this order</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-full border-2 border-pink-200 text-pink-700 font-bold hover:bg-pink-50 transition inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => dispatch(getOrderByIdAdmin(id))}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status?.toLowerCase());
  const isCancelled = order.status?.toLowerCase() === "cancelled";
  const paymentMethod = getPaymentMethodLabel(order.paymentMethod);

  return (
    <div className="cs-body min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-amber-50 text-gray-800">
      <style>{shopStyles}</style>

      {/* Header banner */}
      <div className="bg-gradient-to-r from-pink-600 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-5">
          <button
            onClick={() => navigate(-1)}
            className="no-print inline-flex items-center gap-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 text-sm font-bold transition mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                🧾
              </div>
              <div>
                <p className="cs-script text-xl text-white/90">Order ticket</p>
                <h1 className="cs-display text-3xl md:text-4xl font-extrabold">
                  Order #{order._id?.slice(-8)?.toUpperCase()}
                </h1>
                <p className="text-white/85 text-sm mt-0.5">Placed {formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="no-print flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-pink-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Printer className="w-4 h-4" />
                Print Ticket
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur px-5 py-2.5 font-bold transition">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="cs-frosting"></div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-12 space-y-8">
        {/* Progress tracker */}
        <div className="print-card bg-white rounded-[1.75rem] shadow-lg shadow-pink-100/50 border border-pink-100 p-5 md:p-7">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="cs-display text-xl font-bold text-gray-900">Order Progress</h2>
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${getStatusColor(
                order.status
              )}`}
            >
              <span>{STATUS_ICON[order.status?.toLowerCase()] || "•"}</span>
              <span className="capitalize">{order.status}</span>
            </span>
          </div>

          {isCancelled ? (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 border-2 border-dashed border-red-200 p-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700">This order has been cancelled</p>
                <p className="text-sm text-red-600/90">
                  No further status updates can be made. Last updated {formatDate(order.updatedAt)}.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              {STEPS.map((step, i) => {
                const done = currentStepIndex > i;
                const current = currentStepIndex === i;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {/* connector line */}
                    {i > 0 && (
                      <span
                        className={`absolute top-5 right-1/2 w-full h-1 -translate-y-1/2 rounded-full ${currentStepIndex >= i ? "bg-gradient-to-r from-pink-500 to-orange-500" : "bg-pink-100"
                          }`}
                      ></span>
                    )}
                    <span
                      className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center text-lg border-4 border-white shadow ${done || current
                        ? "bg-gradient-to-br from-pink-500 to-orange-500"
                        : "bg-pink-50 grayscale opacity-70"
                        } ${current ? "ring-4 ring-pink-200" : ""}`}
                    >
                      {step.icon}
                    </span>
                    <span
                      className={`mt-2 text-xs sm:text-sm text-center font-bold ${done || current ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer */}
            <div className="print-card bg-white rounded-[1.75rem] shadow-lg shadow-pink-100/50 border border-pink-100 p-6 md:p-8">
              <SectionTitle icon={<User className="w-5 h-5" />} title="Customer & Delivery Contact" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoTile icon={<User className="w-4 h-4" />} label="Full Name">
                  {order.user?.name || "Unknown User"}
                </InfoTile>

                <InfoTile icon={<Mail className="w-4 h-4" />} label="Email Address">
                  <span className="break-all">{order.user?.email || "N/A"}</span>
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
                      <span className="block text-sm font-medium text-gray-600 mt-1">
                        {[order.city, order.pincode].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </InfoTile>
                )}
              </div>
            </div>

            {/* Cake details */}
            <div className="print-card bg-white rounded-[1.75rem] shadow-lg shadow-pink-100/50 border border-pink-100 p-6 md:p-8">

              <SectionTitle
                icon={
                  order.orderType === "custom" ? (
                    <Gift className="w-5 h-5" />
                  ) : (
                    <Cake className="w-5 h-5" />
                  )
                }
                title={
                  order.orderType === "custom"
                    ? "Custom Cake — Bake Sheet"
                    : order.orderType === "cart"
                      ? "Cart Order — Bake Sheet"
                      : "Fixed Cake — Bake Sheet"
                }
                badge={
                  <span
                    className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${order.orderType === "custom"
                      ? "bg-orange-100 text-orange-700"
                      : order.orderType === "cart"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-pink-100 text-pink-700"
                      }`}
                  >
                    {order.orderType === "custom"
                      ? "Custom Design"
                      : order.orderType === "cart"
                        ? "Cart Order"
                        : "Fixed Cake"}
                  </span>
                }
              />


              {/* Fixed */}
              {order.orderType === "fixed" && order.cake && (
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-pink-100 to-orange-100">
                      {order.cake.image ? (
                        <img src={order.cake.image} alt={order.cake.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🎂</div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="cs-display text-2xl font-bold text-gray-900">{order.cake.name}</h3>
                      <span className="cs-display text-2xl font-extrabold text-pink-600 whitespace-nowrap">
                        {formatPrice(order.cake.price)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-5">{order.cake.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MiniStat label="Quantity" value={`${order.quantity || 1} item`} />
                      <MiniStat label="Category" value={order.cake.category || "Regular"} capitalize />
                      <MiniStat label="Flavor" value={order.cake.flavor || "Standard"} />
                      <MiniStat label="Weight" value={order.cake.weight || "Regular"} />
                    </div>

                    {order.messageOnCake && (
                      <div className="mt-6 pt-5 border-t-2 border-dashed border-pink-100">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-pink-500" />
                          <div className="text-sm font-bold text-gray-700">Message to write on the cake</div>
                        </div>
                        <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-4 rounded-2xl border border-pink-100">
                          <div className="cs-script text-xl text-gray-900">"{order.messageOnCake}"</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* Cart Order — multiple cake details */}
              {order.orderType === "cart" && (
                <div className="space-y-6">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <>
                      {order.items.map((item, index) => {
                        const populatedCake =
                          item.cake && typeof item.cake === "object"
                            ? item.cake
                            : null;

                        const cakeName =
                          item.name || populatedCake?.name || "Cake";

                        const cakeImage =
                          item.image || populatedCake?.image || "";

                        const cakePrice = Number(
                          item.price ?? populatedCake?.price ?? 0
                        );

                        const quantity = Number(item.quantity) || 1;
                        const subtotal = cakePrice * quantity;

                        const messageOnCake = item.messageOnCake?.trim();

                        return (
                          <div
                            key={
                              populatedCake?._id ||
                              (typeof item.cake === "string" ? item.cake : null) ||
                              `${cakeName}-${index}`
                            }
                            className="flex flex-col sm:flex-row gap-5 border-b border-dashed border-pink-100 pb-6 last:border-b-0 last:pb-0"
                          >
                            {/* Cake Image */}
                            <div className="w-36 h-36 shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                              {cakeImage ? (
                                <img
                                  src={cakeImage}
                                  alt={cakeName}
                                  className="w-full h-full object-contain p-2"
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
                              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                                <h3 className="cs-display text-xl sm:text-2xl font-bold text-gray-900">
                                  {cakeName}
                                </h3>

                                <span className="cs-display text-xl font-extrabold text-pink-600 whitespace-nowrap">
                                  {formatPrice(subtotal)}
                                </span>
                              </div>

                              {populatedCake?.description && (
                                <p className="text-gray-600 mb-4">
                                  {populatedCake.description}
                                </p>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <MiniStat
                                  label="Quantity"
                                  value={`${quantity} ${quantity === 1 ? "item" : "items"}`}
                                />

                                <MiniStat
                                  label="Price per cake"
                                  value={formatPrice(cakePrice)}
                                />

                                <MiniStat
                                  label="Subtotal"
                                  value={formatPrice(subtotal)}
                                />

                                <MiniStat
                                  label="Category"
                                  value={populatedCake?.category || "Regular"}
                                  capitalize
                                />
                              </div>

                              {/* Message written on this cake */}
                              {messageOnCake && (
                                <div className="mt-5 pt-4 border-t-2 border-dashed border-pink-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-5 h-5 text-pink-500" />
                                    <div className="text-sm font-bold text-gray-700">
                                      Message to write on the cake
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-4 rounded-2xl border border-pink-100">
                                    <div className="cs-script text-xl text-gray-900 break-words">
                                      “{messageOnCake}”
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Cart Order Total */}
                      <div className="pt-5 border-t-2 border-dashed border-pink-200 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-extrabold text-gray-900">
                            Cart Order Total
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.items.length} different cake type(s)
                          </p>
                        </div>

                        <span className="cs-display text-2xl sm:text-3xl font-extrabold text-pink-600">
                          {formatPrice(order.totalPrice)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <p className="font-bold text-amber-800">
                        Cart item details are missing from the server response.
                      </p>
                      <p className="mt-2 text-sm text-amber-700">
                        Order ID: {order._id}
                      </p>
                      <p className="mt-2 font-bold text-gray-900">
                        Order Total: {formatPrice(order.totalPrice)}
                      </p>
                    </div>
                  )}
                </div>
              )}


              {/* Custom */}
              {order.orderType === "custom" && (
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0">
                    <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 border-4 border-white shadow-lg flex items-center justify-center text-6xl cs-float">
                      ✨
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="cs-display text-2xl font-bold text-gray-900">Custom Cake</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        Personalized Design
                      </span>
                    </div>
                    <p className="text-gray-600 mb-5">
                      Custom order. Check the customer's requirements below before baking.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <MiniStat label="Flavor" value={order.customDetails?.flavor} />
                      <MiniStat label="Weight" value={order.customDetails?.weight} />
                      <MiniStat
                        label="Delivery Date"
                        value={
                          order.customDetails?.deliveryDate
                            ? new Date(order.customDetails.deliveryDate).toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                            : "Not specified"
                        }
                      />
                      <MiniStat label="Price per kg" value={formatPrice(order.customDetails?.pricePerKg || 0)} />
                      {order.customDetails?.occasion && (
                        <MiniStat label="Occasion" value={order.customDetails.occasion} />
                      )}
                      {order.customDetails?.message && (
                        <MiniStat label="Message on Cake" value={`"${order.customDetails.message}"`} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Order summary */}
            <div className="print-card bg-white rounded-[1.75rem] shadow-lg shadow-pink-100/50 border-2 border-dashed border-pink-200 p-6 md:p-7">
              <SectionTitle icon={<FileText className="w-5 h-5" />} title="Order Summary" />

              <div className="space-y-1">
                <SummaryRow icon={<Hash className="w-4 h-4" />} label="Order ID">
                  <span className="font-mono text-sm">#{order._id?.slice(-8)?.toUpperCase()}</span>
                </SummaryRow>
                <SummaryRow icon={<Calendar className="w-4 h-4" />} label="Placed on">
                  <span className="text-sm text-right">{formatDate(order.createdAt)}</span>
                </SummaryRow>
                <SummaryRow icon={<Clock className="w-4 h-4" />} label="Last updated">
                  <span className="text-sm text-right">{formatDate(order.updatedAt)}</span>
                </SummaryRow>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Order Status</div>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <span className="text-lg">{STATUS_ICON[order.status?.toLowerCase()] || "•"}</span>
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Payment Status</div>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold ${getPaymentColor(
                      order.paymentStatus
                    )}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="capitalize">{order.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & delivery */}
            <div className="print-card bg-white rounded-[1.75rem] shadow-lg shadow-pink-100/50 border border-pink-100 p-6 md:p-7">
              <SectionTitle icon={<CreditCard className="w-5 h-5" />} title="Payment & Delivery" />

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Payment Method</div>
                  <div className={`font-bold flex items-center gap-2 ${paymentMethod.color}`}>
                    <span>{paymentMethod.icon}</span>
                    {paymentMethod.label}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {order.paymentMethod === "cod" ? "Amount to Collect" : "Total Amount"}
                  </div>
                  <div className="cs-display text-4xl font-extrabold text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </div>
                </div>

                {order.deliveryDate && (
                  <div className="pt-4 border-t-2 border-dashed border-pink-100">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      <Truck className="w-4 h-4" />
                      Scheduled Delivery
                    </div>
                    <div className="font-bold text-gray-900">
                      {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-dashed border-pink-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Delivery Type</div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <Home className="w-4 h-4 text-pink-500" />
                    {order.address ? "Home Delivery" : "Store Pickup"}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin actions */}
            <div className="no-print rounded-[1.75rem] bg-gradient-to-br from-pink-50 to-orange-50 border border-pink-200 p-6">
              <h3 className="cs-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-600" />
                Admin Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/admin/orders/edit/${order._id}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Update Order Status
                </button>
                <button className="w-full px-4 py-3 bg-white text-pink-700 font-bold rounded-full border-2 border-pink-200 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contact Customer
                </button>
                <button className="w-full px-4 py-3 bg-white text-pink-700 font-bold rounded-full border-2 border-pink-200 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  View Similar Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const SectionTitle = ({ icon, title, badge }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-pink-100">
    <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-md flex items-center justify-center">
      {icon}
    </div>
    <h2 className="cs-display text-xl font-bold text-gray-900">{title}</h2>
    {badge}
  </div>
);

const InfoTile = ({ icon, label, children }) => (
  <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100">
    <div className="flex items-center text-pink-600 mb-1.5 gap-2">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-base font-bold text-gray-900">{children}</div>
  </div>
);

const MiniStat = ({ label, value, capitalize }) => (
  <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100">
    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
    <div className={`font-bold text-gray-900 ${capitalize ? "capitalize" : ""}`}>{value || "—"}</div>
  </div>
);

const SummaryRow = ({ icon, label, children }) => (
  <div className="flex justify-between items-center gap-4 py-3 border-b border-pink-50 last:border-0">
    <div className="text-gray-500 flex items-center gap-2 text-sm font-semibold">
      {icon}
      {label}
    </div>
    <div className="font-bold text-gray-900">{children}</div>
  </div>
);

export default AdminOrderDetails;