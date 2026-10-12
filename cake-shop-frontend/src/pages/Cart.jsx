import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import api from "../api/axios";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CakeSlice,
  LoaderCircle,
  RefreshCw,
  Truck,
  Banknote,
  Smartphone,
  MapPin,
  Phone,
  Check,
  Sparkles,
  ShieldCheck,
  X,
  User,
  Lock,
  CreditCard,
} from "lucide-react";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../features/cart/cartSlice";

const formatPrice = (price = 0) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

/* ============================================================
   Fonts — Fraunces (display) + Outfit (body)
   A fresh, premium pairing for the cart experience.
   ============================================================ */
const FONT_LINK_ID = "cakezone-cart-fonts";

const useCartFonts = () => {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800;9..144,900&family=Outfit:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
};

/* ============================================================
   Motion presets
   ============================================================ */
const SPRING = { type: "spring", bounce: 0.18, visualDuration: 0.45 };
const SOFT = { type: "spring", bounce: 0.15, duration: 0.5 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING },
};

const FREE_DELIVERY_MIN = 999;
const STEPS = ["Cart", "Details", "Payment"];

/* ============================================================
   Small pieces
   ============================================================ */
function Stepper({ current }) {
  return (
    <div className="mx-auto mt-7 flex max-w-md items-center justify-center">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={SPRING}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${done
                  ? "bg-[#6B4423] text-[#FFF8E7]"
                  : active
                    ? "bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md"
                    : "bg-[#F5F0E8] text-[#8B7355]"
                  }`}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </motion.div>
              <span
                className={`text-xs font-semibold ${active || done ? "text-[#3E2C1C]" : "text-[#A1887F]"
                  }`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="mx-2 mb-5 h-0.5 w-10 overflow-hidden rounded-full bg-[#E8E0D5] sm:w-16">
                <motion.div
                  className="h-full bg-[#C9A227]"
                  initial={false}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FreeDeliveryBar({ total }) {
  const remaining = Math.max(0, FREE_DELIVERY_MIN - (Number(total) || 0));
  const progress = Math.min(100, ((Number(total) || 0) / FREE_DELIVERY_MIN) * 100);
  const unlocked = remaining === 0;

  return (
    <div className="rounded-2xl border border-[#E8D58A] bg-gradient-to-br from-[#FDF8E8] to-[#FBF2DA] p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[#6B4423]">
        <Truck className="h-4 w-4 text-[#8B6914]" />
        {unlocked
          ? "You've unlocked free delivery!"
          : `Add ₹${formatPrice(remaining)} more for free delivery`}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EFE3B8]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.9 }}
        />
      </div>
    </div>
  );
}

function PaymentOption({ value, selected, onSelect, icon: Icon, title, hint }) {
  const isOn = selected === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isOn}
      onClick={() => onSelect(value)}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${isOn
        ? "border-[#C9A227] bg-[#FDF8E8] shadow-sm"
        : "border-[#E8E0D5] bg-white hover:border-[#D9C9A3] hover:bg-[#FFFDF9]"
        }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isOn
          ? "bg-gradient-to-br from-[#6B4423] to-[#8B5E3C] text-[#FFF8E7]"
          : "bg-[#F5F0E8] text-[#8B6914]"
          }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#3E2C1C]">{title}</span>
        <span className="block text-xs text-[#8B7355]">{hint}</span>
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isOn ? "border-[#C9A227] bg-[#C9A227]" : "border-[#D9C9A3] bg-white"
          }`}
      >
        <AnimatePresence>
          {isOn && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={SPRING}
              className="flex items-center justify-center"
            >
              <Check className="h-3 w-3 text-[#2E1B0F]" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}

/* ============================================================
   Checkout Modal — the star of the show
   ============================================================ */
function CheckoutModal({
  open,
  onClose,
  onSubmit,
  address,
  setAddress,
  mobile,
  setMobile,
  paymentMethod,
  setPaymentMethod,
  placingOrder,
  items,
  totalPrice,
  totalItems,
  messagesByCake,
  setCakeMessage,
}) {
  // Lock scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && !placingOrder && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, placingOrder]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="checkout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2E1B0F]/55 p-0 backdrop-blur-md sm:items-center sm:p-6"
          onClick={() => !placingOrder && onClose()}
        >
          <motion.div
            key="checkout-modal"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={SOFT}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[#FFFDF9] shadow-2xl sm:rounded-3xl"
          >
            {/* Modal header */}
            <div className="relative flex items-center justify-between gap-3 border-b border-[#E8E0D5] bg-gradient-to-r from-[#5D3A1A] via-[#6B4423] to-[#8B5E3C] px-5 py-4 text-[#FFF8E7] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="cz-display text-lg font-extrabold leading-tight sm:text-xl">
                    Secure Checkout
                  </h3>
                  <p className="text-[11px] text-[#F5E6D3]/90 sm:text-xs">
                    {totalItems} {totalItems === 1 ? "item" : "items"} • Final step
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={placingOrder}
                aria-label="Close checkout"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#FFF8E7] transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
                {/* Section 1 — Delivery */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F0E8] text-xs font-extrabold text-[#6B4423]">
                      1
                    </span>
                    <h4 className="cz-display text-base font-extrabold sm:text-lg">
                      Delivery Details
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cart-address"
                        className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B7355]"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#8B6914]" />
                        Delivery Address
                      </label>
                      <textarea
                        id="cart-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        maxLength={500}
                        required
                        placeholder="House number, street, area, landmark…"
                        className="w-full resize-y rounded-xl border border-[#E8E0D5] bg-white p-3.5 text-sm text-[#3E2C1C] outline-none transition placeholder:text-[#B39C7A] focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cart-mobile"
                        className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B7355]"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#8B6914]" />
                        Mobile Number
                      </label>
                      <input
                        id="cart-mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) =>
                          setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        required
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-[#E8E0D5] bg-white p-3.5 text-sm text-[#3E2C1C] outline-none transition placeholder:text-[#B39C7A] focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/15"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 2 — Payment */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F0E8] text-xs font-extrabold text-[#6B4423]">
                      2
                    </span>
                    <h4 className="cz-display text-base font-extrabold sm:text-lg">
                      Payment Method
                    </h4>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Payment method"
                    className="space-y-2.5"
                  >
                    <PaymentOption
                      value="cod"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                      icon={Banknote}
                      title="Cash on Delivery"
                      hint="Pay when your cake arrives"
                    />
                    <PaymentOption
                      value="online"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                      icon={Smartphone}
                      title="Online / UPI"
                      hint="Fast & secure demo payment"
                    />
                  </div>
                </section>

                {/* Section 3 — Order summary mini */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F0E8] text-xs font-extrabold text-[#6B4423]">
                      3
                    </span>
                    <h4 className="cz-display text-base font-extrabold sm:text-lg">
                      Order Review
                    </h4>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#E8D58A] bg-gradient-to-br from-[#FDF8E8] to-[#FBF2DA]">

                    <ul className="divide-y divide-[#EFE3B8]">
                      {items.map((item) => {
                        const cake = item.cake;
                        if (!cake?._id) return null;

                        const message = messagesByCake?.[cake._id] || "";

                        return (
                          <li key={cake._id} className="space-y-3 px-4 py-4">
                            {/* Cake summary */}
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-[#EFE3B8]">
                                {cake.image ? (
                                  <img
                                    src={cake.image}
                                    alt={cake.name}
                                    className="h-full w-full object-contain p-1"
                                  />
                                ) : (
                                  <CakeSlice className="h-4 w-4 text-[#C9A227]" />
                                )}
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold text-[#3E2C1C]">
                                  {cake.name}
                                </span>

                                <span className="block text-xs text-[#8B7355]">
                                  Qty {item.quantity} × ₹{formatPrice(cake.price)}
                                </span>
                              </span>

                              <span className="text-sm font-extrabold text-[#6B4423]">
                                ₹{formatPrice(item.subtotal)}
                              </span>
                            </div>

                            {/* Optional message on this cake */}
                            <div>
                              <label
                                htmlFor={`cake-message-${cake._id}`}
                                className="mb-1.5 block text-xs font-bold text-[#6B4423]"
                              >
                                💌 Message on Cake (optional)
                              </label>

                              <textarea
                                id={`cake-message-${cake._id}`}
                                value={message}
                                onChange={(e) =>
                                  setCakeMessage(cake._id, e.target.value)
                                }
                                rows={2}
                                maxLength={100}
                                placeholder="E.g. Happy Birthday, Khushi! 🎉"
                                className="w-full resize-none rounded-xl border border-[#E8DCC8] bg-white p-3 text-sm text-[#3E2C1C] outline-none transition placeholder:text-[#B39C7A] focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/15"
                              />

                              <div className="mt-1 flex justify-between text-xs text-[#8B7355]">
                                <span>Max 100 characters</span>
                                <span className={message.length >= 100 ? "font-bold text-red-500" : ""}>
                                  {message.length}/100
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>


                    <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#D9C9A3] bg-white/40 px-4 py-3.5">
                      <span className="cz-display text-base font-extrabold">
                        Total
                      </span>
                      <span className="cz-display text-2xl font-extrabold text-[#8B6914]">
                        ₹{formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[#8B7355]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#8B6914]" />
                    Server recalculates the final total using current cake
                    prices.
                  </p>
                </section>
              </div>

              {/* Sticky footer */}
              <div className="border-t border-[#E8E0D5] bg-[#FFFDF9] px-5 py-4 sm:px-7 sm:py-5">
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    disabled={placingOrder}
                    onClick={onClose}
                    className="w-full rounded-full border border-[#E8E0D5] px-5 py-3 text-sm font-bold text-[#5D4037] transition hover:bg-[#F5F0E8] disabled:opacity-50 sm:w-auto"
                  >
                    Back to Cart
                  </button>

                  <motion.button
                    type="submit"
                    disabled={placingOrder || items.length === 0}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-3.5 font-extrabold text-[#2E1B0F] shadow-lg shadow-[#C9A227]/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
                  >
                    {placingOrder ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {placingOrder ? "Placing Order…" : "Place Order"}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   Main Cart page
   ============================================================ */
const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useCartFonts();

  const summaryRef = useRef(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [messagesByCake, setMessagesByCake] = useState({});

  const setCakeMessage = (cakeId, message) => {
    setMessagesByCake((previous) => ({
      ...previous,
      [cakeId]: message.slice(0, 100),
    }));
  };

  const { items = [], totalItems = 0, totalPrice = 0, loading, error } =
    useSelector((state) => state.cart || {});

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (cakeId, quantity) => {
    try {
      await dispatch(updateCartItem({ cakeId, quantity })).unwrap();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not update quantity");
    }
  };

  const handleRemove = async (cakeId) => {
    try {
      await dispatch(removeCartItem(cakeId)).unwrap();
      toast.success("Cake removed from your cart");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not remove cake");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    try {
      await dispatch(clearCart()).unwrap();
      toast.success("Your cart is now empty");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not clear cart");
    }
  };

  const handleRetry = () => dispatch(fetchCart());

  const openCheckout = () => setCheckoutOpen(true);
  const closeCheckout = () => !placingOrder && setCheckoutOpen(false);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await api.post("/orders/cart", {
        address: address.trim(),
        mobile,
        paymentMethod,
        messagesByCake,
      });
      const orderId = response.data?.order?._id;
      if (!orderId) throw new Error("Order was created without an order ID");

      dispatch(fetchCart());
      toast.success("Your order has been placed!");
      setCheckoutOpen(false);
      navigate(`/payment/${orderId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to place your order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const hasItems = items.length > 0;

  return (
    <main className="cz-cart relative min-h-screen overflow-hidden bg-[#FDFBF7] px-4 pb-28 pt-10 text-[#3E2C1C] sm:px-6 lg:px-8 lg:pb-12">
      <style>{`
        .cz-cart { font-family: "Outfit", system-ui, -apple-system, sans-serif; }
        .cz-cart .cz-display { font-family: "Fraunces", Georgia, serif; letter-spacing: -0.02em; }
        .cz-cart input, .cz-cart textarea, .cz-cart button { font-family: inherit; }

        /* Custom scrollbar for modal body */
        .cz-cart ::-webkit-scrollbar { width: 8px; height: 8px; }
        .cz-cart ::-webkit-scrollbar-track { background: transparent; }
        .cz-cart ::-webkit-scrollbar-thumb { background: #D9C9A3; border-radius: 8px; }
        .cz-cart ::-webkit-scrollbar-thumb:hover { background: #C9A227; }
      `}</style>

      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-[#6B4423]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="mb-10 text-center"
        >
          <p className="cz-display inline-flex items-center gap-2 text-lg italic text-[#8B6914]">
            <Sparkles className="h-4 w-4" />
            A little sweetness goes a long way
          </p>

          <h1 className="cz-display mt-2 text-4xl font-extrabold md:text-5xl">
            Your Shopping Cart
          </h1>

          <p className="mt-3 text-[#8B7355]">
            Review your favourite cakes before checkout.
          </p>

          {hasItems && <Stepper current={checkoutOpen ? 1 : 0} />}
        </motion.div>

        <Link
          to="/cakes"
          className="group mb-7 inline-flex items-center gap-2 font-bold text-[#8B6914] transition-colors hover:text-[#5C3A21]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Continue Shopping
        </Link>

        {/* Loading */}
        {loading && items.length === 0 && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                className="flex gap-5 rounded-2xl border border-[#E8E0D5] bg-[#FFFDF9] p-5"
              >
                <div className="h-32 w-32 shrink-0 rounded-xl bg-[#F0E8D8]" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-4 w-1/2 rounded-full bg-[#F0E8D8]" />
                  <div className="h-3 w-1/3 rounded-full bg-[#F5F0E8]" />
                  <div className="h-8 w-28 rounded-full bg-[#F0E8D8]" />
                </div>
              </motion.div>
            ))}
            <p className="flex items-center justify-center gap-2 pt-2 font-semibold text-[#8B7355]">
              <LoaderCircle className="h-5 w-5 animate-spin text-[#C9A227]" />
              Loading your cart…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-[#E8E0D5] bg-[#FFFDF9] p-10 text-center"
          >
            <p className="mb-4 font-semibold text-red-600">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-full bg-[#6B4423] px-6 py-3 font-bold text-white hover:bg-[#4A2E1B]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="rounded-3xl border border-[#E8E0D5] bg-[#FFFDF9] p-10 text-center shadow-lg md:p-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#F5F0E8] to-[#EFE3C8]"
            >
              <ShoppingCart className="h-12 w-12 text-[#C9A227]" />
            </motion.div>

            <h2 className="cz-display text-2xl font-extrabold md:text-3xl">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[#8B7355]">
              Your favourite cakes are waiting for you. Explore our collection
              and add something delicious.
            </p>

            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="mt-7 inline-block"
            >
              <Link
                to="/cakes"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-7 py-3 font-bold text-[#2E1B0F] shadow-md transition hover:shadow-lg"
              >
                <CakeSlice className="h-5 w-5" />
                Explore Cakes
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Cart + Summary */}
        {hasItems && (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="cz-display text-xl font-extrabold">
                  Cart Items ({totalItems})
                </h2>

                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </button>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const cake = item.cake;
                    if (!cake?._id) return null;

                    const quantity = Number(item.quantity) || 1;
                    const subtotal =
                      Number(item.subtotal) ||
                      (Number(cake.price) || 0) * quantity;

                    return (
                      <motion.article
                        key={cake._id}
                        layout
                        variants={fadeUp}
                        exit={{ opacity: 0, x: -40, scale: 0.96 }}
                        whileHover={{ y: -3 }}
                        className="flex flex-col gap-5 rounded-2xl border border-[#E8E0D5] bg-[#FFFDF9] p-4 shadow-sm transition-shadow hover:shadow-lg sm:flex-row sm:p-5"
                      >
                        <Link
                          to={`/cakes/${cake._id}`}
                          className="group flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#F5F0E8] to-[#EFE3C8] sm:h-36 sm:w-36"
                        >
                          {cake.image ? (
                            <img
                              src={cake.image}
                              alt={cake.name}
                              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <CakeSlice className="h-12 w-12 text-[#C9A227]" />
                          )}
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/cakes/${cake._id}`}
                                className="cz-display text-lg font-extrabold transition-colors hover:text-[#8B6914]"
                              >
                                {cake.name}
                              </Link>

                              <p className="mt-1 inline-block rounded-full bg-[#F5F0E8] px-2.5 py-0.5 text-xs font-semibold capitalize text-[#8B7355]">
                                {cake.category || "Cake"}
                              </p>
                            </div>

                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleRemove(cake._id)}
                              disabled={loading}
                              aria-label={`Remove ${cake.name}`}
                              title="Remove cake"
                              className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </motion.button>
                          </div>

                          <p className="mt-3 text-sm text-[#8B7355]">
                            ₹{formatPrice(cake.price)} each
                          </p>

                          <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D5] bg-[#FDFBF7] p-1">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() =>
                                  handleQuantityChange(cake._id, quantity - 1)
                                }
                                disabled={loading || quantity <= 1}
                                aria-label="Decrease quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8] disabled:opacity-30"
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>

                              <span className="relative flex h-8 min-w-6 items-center justify-center overflow-hidden text-center font-extrabold">
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={quantity}
                                    initial={{ y: 14, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -14, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    {quantity}
                                  </motion.span>
                                </AnimatePresence>
                              </span>

                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() =>
                                  handleQuantityChange(cake._id, quantity + 1)
                                }
                                disabled={loading}
                                aria-label="Increase quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8] disabled:opacity-50"
                              >
                                <Plus className="h-4 w-4" />
                              </motion.button>
                            </div>

                            <p className="cz-display whitespace-nowrap text-xl font-extrabold text-[#6B4423]">
                              ₹{formatPrice(subtotal)}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </section>

            {/* Summary */}
            <motion.aside
              ref={summaryRef}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.2 }}
              className="scroll-mt-28 overflow-hidden rounded-3xl border border-[#E8E0D5] bg-[#FFFDF9] shadow-lg lg:sticky lg:top-28"
            >
              <div className="bg-gradient-to-r from-[#5D3A1A] via-[#6B4423] to-[#8B5E3C] px-6 py-4 text-[#FFF8E7]">
                <h2 className="cz-display text-2xl font-extrabold">
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                <FreeDeliveryBar total={totalPrice} />

                <div className="mt-6 space-y-4 text-[#8B7355]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Total quantity</span>
                    <span className="font-bold text-[#3E2C1C]">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#3E2C1C]">
                      ₹{formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span>Delivery</span>
                    <span className="font-bold text-[#8B6914]">
                      Confirmed at checkout
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-[#E8E0D5]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="cz-display text-lg font-extrabold">Total</span>
                  <span className="cz-display text-3xl font-extrabold text-[#8B6914]">
                    ₹{formatPrice(totalPrice)}
                  </span>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-[#8B7355]">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Final charges will be confirmed before placing your order.
                </p>

                <motion.button
                  type="button"
                  onClick={openCheckout}
                  disabled={loading || items.length === 0}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-4 font-extrabold text-[#2E1B0F] shadow-lg shadow-[#C9A227]/25 transition-shadow hover:shadow-xl disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  Proceed to Checkout
                </motion.button>
              </div>
            </motion.aside>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar */}
      <AnimatePresence>
        {hasItems && !checkoutOpen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={SPRING}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E0D5] bg-[#FFFDF9]/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(107,68,35,0.35)] backdrop-blur lg:hidden"
          >
            <div className="mx-auto flex max-w-md items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#8B7355]">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
                <p className="cz-display text-xl font-extrabold text-[#6B4423]">
                  ₹{formatPrice(totalPrice)}
                </p>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={openCheckout}
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-3 font-extrabold text-[#2E1B0F] shadow-md disabled:opacity-50"
              >
                Checkout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={closeCheckout}
        onSubmit={handleCheckout}
        address={address}
        setAddress={setAddress}
        mobile={mobile}
        setMobile={setMobile}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        placingOrder={placingOrder}
        items={items}
        totalPrice={totalPrice}
        totalItems={totalItems}
        messagesByCake={messagesByCake}
        setCakeMessage={setCakeMessage}
      />
    </main>
  );
};

export default Cart;