import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { placeCustomCakeOrder } from "../features/orders/orderSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Cake,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  User,
  Gift,
  Sparkles,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  ArrowLeft,
  X,
  Check,
  AlertCircle,
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
.cs-drip {
  height: 12px;
  background-image: radial-gradient(circle at 50% 0, #FDFBF7 0 8px, transparent 9px);
  background-size: 18px 12px;
  background-repeat: repeat-x;
}

@keyframes cs-float   { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes cs-flicker { 0%,100% { transform: scale(1) rotate(-3deg); } 50% { transform: scale(1.15) rotate(3deg); } }
@keyframes cs-rise    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.cs-float   { animation: cs-float 5s ease-in-out infinite; }
.cs-flicker { animation: cs-flicker 1.2s ease-in-out infinite; transform-origin: bottom center; }
.cs-rise    { animation: cs-rise .35s ease-out both; }
`;

const SPRINKLES = [
  { top: "14%", left: "6%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "64%", left: "14%", color: "bg-[#FDFBF7]", rot: "-35deg", delay: ".6s" },
  { top: "22%", left: "32%", color: "bg-[#E8C84A]", rot: "60deg", delay: "1.2s" },
  { top: "72%", left: "48%", color: "bg-[#D4AF37]", rot: "-15deg", delay: ".3s" },
  { top: "16%", right: "26%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
  { top: "60%", right: "12%", color: "bg-[#FDFBF7]", rot: "75deg", delay: "1.5s" },
  { top: "24%", right: "6%", color: "bg-[#C9A227]", rot: "-50deg", delay: "1.8s" },
];

const FLAVORS = [
  { value: "chocolate", label: "Chocolate", emoji: "🍫" },
  { value: "vanilla", label: "Vanilla", emoji: "🌿" },
  { value: "strawberry", label: "Strawberry", emoji: "🍓" },
  { value: "red-velvet", label: "Red Velvet", emoji: "❤️" },
  { value: "butterscotch", label: "Butterscotch", emoji: "🍯" },
];

const WEIGHTS = [
  { value: "0.5kg", label: "0.5 kg", description: "Perfect for 4-6 people", price: 699, tiers: 1 },
  { value: "1kg", label: "1 kg", description: "Ideal for 8-10 people", price: 1299, tiers: 2 },
  { value: "1.5kg", label: "1.5 kg", description: "Great for 12-15 people", price: 1899, tiers: 2 },
  { value: "2kg", label: "2 kg", description: "Perfect for 16-20 people", price: 2499, tiers: 3 },
  { value: "3kg", label: "3 kg", description: "Feeds 25-30 people", price: 3599, tiers: 3 },
];

const PREMIUM_FLAVORS = ["red-velvet", "butterscotch"];
const FLAVOR_PREMIUM = 200;

// 🎂 ORIGINAL CAKE COLORS RESTORED (Pink/Orange/Yellow theme)
const FLAVOR_COLORS = {
  chocolate: "#7c4a2d",
  vanilla: "#fbe8b5",
  strawberry: "#f9a8d4",
  "red-velvet": "#be123c",
  butterscotch: "#f59e0b",
};

const STEPS = [
  { id: 1, label: "Your Details", icon: User },
  { id: 2, label: "Your Cake", icon: Cake },
  { id: 3, label: "Delivery", icon: Truck },
];

const FEATURES = [
  { icon: <Sparkles className="w-5 h-5" />, text: "Premium Ingredients" },
  { icon: <Heart className="w-5 h-5" />, text: "Made with Love" },
  { icon: <Clock className="w-5 h-5" />, text: "24hrs Freshness Guarantee" },
  { icon: <ShieldCheck className="w-5 h-5" />, text: "100% Quality Assured" },
  { icon: <Truck className="w-5 h-5" />, text: "Free Delivery" },
  { icon: <Gift className="w-5 h-5" />, text: "Beautiful Packaging" },
];

const inputBase =
  "w-full px-4 py-3.5 rounded-2xl bg-[#FFFDF9] border-2 focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all";

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const CustomCake = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.orders);

  const [form, setForm] = useState({
    flavor: "",
    weight: "",
    message: "",
    deliveryDate: "",
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("online");

  const minDateString = getMinDate();

  const selectedWeight = WEIGHTS.find((w) => w.value === form.weight);
  const selectedFlavor = FLAVORS.find((f) => f.value === form.flavor);
  const basePrice = selectedWeight ? selectedWeight.price : 0;
  const flavorPremium = selectedWeight && PREMIUM_FLAVORS.includes(form.flavor) ? FLAVOR_PREMIUM : 0;
  const estimatedPrice = basePrice + flavorPremium;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step) => {
    const e = {};

    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Please enter your full name";
      if (!form.mobile) e.mobile = "Please enter mobile number";
      else if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (step === 2) {
      if (!form.flavor) e.flavor = "Please select a flavor";
      if (!form.weight) e.weight = "Please select a size";
    }

    if (step === 3) {
      if (!form.deliveryDate) e.deliveryDate = "Please select delivery date";
      else if (form.deliveryDate < minDateString) e.deliveryDate = "Delivery date must be tomorrow or later";
      if (!form.address.trim()) e.address = "Please enter delivery address";
      if (!form.city.trim()) e.city = "Please enter city";
      if (!form.pincode) e.pincode = "Please enter pincode";
      else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (step) => {
    if (step < currentStep) {
      setErrors({});
      setCurrentStep(step);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (currentStep < 3) {
      goNext();
      return;
    }

    for (const step of [1, 2, 3]) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    try {
      const res = await dispatch(
        placeCustomCakeOrder({
          ...form,
          paymentMethod,
        })
      ).unwrap();

      toast.success("Custom Order placed successfully 🎂");

      if (paymentMethod === "online") {
        navigate(`/payment/${res._id}`);
      } else {
        navigate("/my-orders");
      }
    } catch (error) {
      console.error("Order failed:", error);
      toast.error(typeof error === "string" ? error : "Order failed. Please try again.");
    }
  };

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C] pb-28 lg:pb-0">
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

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 md:pb-24">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/30 px-4 py-2 text-sm font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate("/")}
              aria-label="Close"
              className="h-10 w-10 rounded-full bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/30 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-3xl bg-[#FDFBF7]/20 backdrop-blur flex items-center justify-center text-4xl mx-auto shadow-lg">
                🎂
              </div>
              <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-[#C9A227] text-[#2E1B0F] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <p className="cs-script mt-3 text-2xl md:text-3xl text-[#E8C84A]">Create something sweet</p>
            {/* Playfair Display for Big Letters */}
            <h1 className="cs-display mt-1 text-4xl md:text-5xl font-extrabold">Design Your Dream Cake</h1>
            <p className="mt-3 text-lg text-[#E8E0D5] max-w-2xl mx-auto">
              Create a custom cake that's as unique as your celebration. Every detail matters!
            </p>
          </div>
        </div>

        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* ================= Form column ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stepper */}
            <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] px-4 sm:px-8 py-5">
              <div className="flex items-start">
                {STEPS.map((step, i) => {
                  const done = currentStep > step.id;
                  const current = currentStep === step.id;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <span
                          className={`absolute top-5 right-1/2 w-full h-1 -translate-y-1/2 rounded-full transition-colors duration-500 ${
                            currentStep >= step.id ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37]" : "bg-[#E8E0D5]"
                          }`}
                        ></span>
                      )}
                      <button
                        type="button"
                        onClick={() => jumpTo(step.id)}
                        disabled={!done}
                        aria-label={`Step ${step.id}: ${step.label}`}
                        className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-4 border-[#FFFDF9] shadow transition-all duration-300 ${
                          current
                            ? "bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] ring-4 ring-[#C9A227]/30 scale-110"
                            : done
                            ? "bg-[#FDF8E8] text-[#8B6914] hover:bg-[#E8D58A] cursor-pointer"
                            : "bg-[#F5F0E8] text-[#8B7355] cursor-default"
                        }`}
                      >
                        {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </button>
                      <span
                        className={`mt-2 text-xs sm:text-sm text-center font-bold ${
                          current ? "text-[#8B6914]" : done ? "text-[#5C3A21]" : "text-[#8B7355]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form card */}
            <div className="bg-[#FFFDF9] rounded-[2rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-5 sm:p-8">
              <form onSubmit={submitHandler} noValidate>
                {/* ---------- Step 1 ---------- */}
                {currentStep === 1 && (
                  <div className="space-y-6 cs-rise">
                    <SectionTitle icon={<User className="w-5 h-5" />} title="Your Details" subtitle="So we know who to bake for" />

                    <div className="grid md:grid-cols-2 gap-5">
                      <Field label="Full Name" error={errors.fullName}>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]" />
                          <input
                            type="text"
                            className={`${inputBase} pl-12 ${
                              errors.fullName ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                            }`}
                            placeholder="John Doe"
                            value={form.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                          />
                        </div>
                      </Field>

                      <Field label="Mobile Number" error={errors.mobile}>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]" />
                          <input
                            type="tel"
                            className={`${inputBase} pl-12 ${
                              errors.mobile ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                            }`}
                            placeholder="9876543210"
                            value={form.mobile}
                            onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                            maxLength="10"
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={goNext}
                        className="w-full md:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Continue to Cake Details →
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------- Step 2 ---------- */}
                {currentStep === 2 && (
                  <div className="space-y-8 cs-rise">
                    <SectionTitle icon={<Cake className="w-5 h-5" />} title="Cake Details" subtitle="Pick a flavor and a size" />

                    <Field label="Select Flavor" error={errors.flavor}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {FLAVORS.map((flavor) => {
                          const active = form.flavor === flavor.value;
                          return (
                            <button
                              key={flavor.value}
                              type="button"
                              onClick={() => handleChange("flavor", flavor.value)}
                              className={`relative rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                                active
                                  ? "border-transparent bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-lg shadow-[#C9A227]/30 scale-105"
                                  : "border-[#E8E0D5] bg-[#FFFDF9] text-[#3E2C1C] hover:border-[#C9A227]/50 hover:shadow-md hover:-translate-y-0.5"
                              }`}
                            >
                              <div className="text-3xl mb-1">{flavor.emoji}</div>
                              <div className="font-bold text-sm">{flavor.label}</div>
                              {PREMIUM_FLAVORS.includes(flavor.value) && (
                                <div className={`text-[10px] font-bold mt-0.5 ${active ? "text-[#2E1B0F]/80" : "text-[#C9A227]"}`}>
                                  +₹{FLAVOR_PREMIUM}
                                </div>
                              )}
                              {active && (
                                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#FFFDF9] text-[#8B6914] flex items-center justify-center shadow">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="Select Size" error={errors.weight}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {WEIGHTS.map((weight) => {
                          const active = form.weight === weight.value;
                          return (
                            <button
                              key={weight.value}
                              type="button"
                              onClick={() => handleChange("weight", weight.value)}
                              className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                                active
                                  ? "border-[#C9A227] bg-[#FDF8E8] shadow-lg shadow-[#C9A227]/20"
                                  : "border-[#E8E0D5] bg-[#FFFDF9] hover:border-[#C9A227]/50 hover:shadow-md hover:-translate-y-0.5"
                              }`}
                            >
                              <TierIcon tiers={weight.tiers} active={active} />
                              <div className="flex-1 min-w-0">
                                <div className="font-extrabold text-[#3E2C1C]">{weight.label}</div>
                                <div className="text-xs text-[#8B7355]">{weight.description}</div>
                              </div>
                              <div className="cs-display text-lg font-extrabold text-[#8B6914]">₹{weight.price}</div>
                              {active && (
                                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] flex items-center justify-center shadow">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="Message on Cake (Optional)">
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#C9A227]" />
                        <textarea
                          className={`${inputBase} pl-12 border-[#E8E0D5] hover:border-[#C9A227]/50 resize-none`}
                          placeholder="Happy Birthday! 🎉 or Congratulations! 🎊"
                          rows="3"
                          value={form.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          maxLength="100"
                        />
                        <div className="absolute right-4 bottom-3 text-xs font-semibold text-[#8B7355]">
                          {form.message.length}/100
                        </div>
                      </div>
                      <p className="text-xs text-[#8B7355]">Watch it appear on your cake in the preview.</p>
                    </Field>

                    <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={goBack}
                        className="px-6 py-3 rounded-full border-2 border-[#E8E0D5] text-[#8B7355] font-bold hover:bg-[#F5F0E8] transition"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Continue to Delivery →
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------- Step 3 ---------- */}
                {currentStep === 3 && (
                  <div className="space-y-6 cs-rise">
                    <SectionTitle icon={<Truck className="w-5 h-5" />} title="Delivery Details" subtitle="Where and when should we deliver?" />

                    <Field label="Delivery Date" error={errors.deliveryDate}>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]" />
                        <input
                          type="date"
                          min={minDateString}
                          className={`${inputBase} pl-12 ${
                            errors.deliveryDate ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                          }`}
                          value={form.deliveryDate}
                          onChange={(e) => handleChange("deliveryDate", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                        <Clock className="w-4 h-4 text-[#C9A227]" />
                        <span>Delivery available between 9 AM - 9 PM</span>
                      </div>
                    </Field>

                    <Field label="Delivery Address" error={errors.address}>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#C9A227]" />
                        <textarea
                          className={`${inputBase} pl-12 resize-none ${
                            errors.address ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                          }`}
                          placeholder="House no, Street, Area, Landmark..."
                          rows="3"
                          value={form.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                        />
                      </div>
                    </Field>

                    <div className="grid md:grid-cols-2 gap-5">
                      <Field label="City" error={errors.city}>
                        <input
                          type="text"
                          className={`${inputBase} ${errors.city ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"}`}
                          placeholder="Enter city"
                          value={form.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                        />
                      </Field>

                      <Field label="Pincode" error={errors.pincode}>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`${inputBase} ${errors.pincode ? "border-red-400" : "border-[#E8E0D5] hover:border-[#C9A227]/50"}`}
                          placeholder="6-digit pincode"
                          value={form.pincode}
                          onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength="6"
                        />
                      </Field>
                    </div>

                    <Field label="Payment Method">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "online", title: "Online Payment", sub: "UPI / Card / Net Banking", icon: "📱" },
                          { value: "cod", title: "Cash on Delivery", sub: "Pay when cake is delivered", icon: "💵" },
                        ].map((opt) => {
                          const active = paymentMethod === opt.value;
                          return (
                            <label
                              key={opt.value}
                              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                active
                                  ? "border-[#C9A227] bg-[#FDF8E8] shadow-md"
                                  : "border-[#E8E0D5] bg-[#FFFDF9] hover:border-[#C9A227]/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={opt.value}
                                checked={active}
                                onChange={() => setPaymentMethod(opt.value)}
                                className="sr-only"
                              />
                              <span className="text-2xl">{opt.icon}</span>
                              <div>
                                <p className="font-bold text-[#3E2C1C] text-sm">{opt.title}</p>
                                <p className="text-xs text-[#8B7355]">{opt.sub}</p>
                              </div>
                              {active && (
                                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] flex items-center justify-center shadow">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </Field>

                    <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={loading}
                        className="px-6 py-3 rounded-full border-2 border-[#E8E0D5] text-[#8B7355] font-bold hover:bg-[#F5F0E8] transition disabled:opacity-50"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="h-5 w-5 rounded-full border-2 border-[#2E1B0F]/30 border-t-[#2E1B0F] animate-spin"></span>
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <Gift className="w-5 h-5" />
                            Place Order • ₹{estimatedPrice.toLocaleString("en-IN")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ================= Summary column ================= */}
          <div className="space-y-6 lg:sticky lg:top-28">
            {/* Live preview + summary */}
            <div className="rounded-[2rem] bg-gradient-to-br from-[#4A2E1B] to-[#2E1B0F] p-5 sm:p-6 text-[#FDFBF7] shadow-2xl shadow-[#C9A227]/20">
              <h3 className="cs-display text-xl font-bold mb-4 flex items-center gap-2">
                <Cake className="w-5 h-5" />
                Your Cake So Far
              </h3>

              {/* drawing */}
              <div className="rounded-3xl bg-[#fff7f2] px-4 pt-6 pb-4 mb-5 text-gray-800">
                <CakePreview flavor={form.flavor} weight={form.weight} message={form.message} />
              </div>

              <div className="space-y-3 text-sm sm:text-base">
                <SummaryRow label="Flavor" value={selectedFlavor ? `${selectedFlavor.emoji} ${selectedFlavor.label}` : "Not selected"} />
                <SummaryRow label="Size" value={selectedWeight ? selectedWeight.label : "Not selected"} />
                <SummaryRow
                  label="Delivery Date"
                  value={form.deliveryDate ? new Date(form.deliveryDate + "T00:00:00").toLocaleDateString("en-IN") : "Not selected"}
                />

                <div className="border-t border-[#FDFBF7]/30 my-2"></div>

                {selectedWeight && (
                  <>
                    <SummaryRow label="Base price" value={`₹${basePrice.toLocaleString("en-IN")}`} />
                    {flavorPremium > 0 && (
                      <SummaryRow label="Premium flavor" value={`+₹${flavorPremium}`} />
                    )}
                  </>
                )}

                <div className="flex justify-between items-end pt-1">
                  <span className="font-bold text-base sm:text-lg">Estimated Price</span>
                  <span className="cs-display text-2xl sm:text-3xl font-extrabold text-[#E8C84A]">
                    {estimatedPrice > 0 ? `₹${estimatedPrice.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>

                <p className="text-xs text-[#E8E0D5]">* Final price may vary based on customization</p>
              </div>
            </div>

            {/* Why choose us */}
            <div className="bg-[#FFFDF9] rounded-[1.75rem] p-5 sm:p-6 shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5]">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B6914]" />
                Why Choose Us?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FDF8E8] to-[#E8E0D5] flex items-center justify-center text-[#8B6914] shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-semibold text-[#5C3A21]">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Need help */}
            <div className="rounded-[1.75rem] bg-gradient-to-br from-[#F5F0E8] to-[#FDFBF7] border border-[#E8E0D5] p-5 sm:p-6">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-1">Need Help?</h3>
              <p className="text-sm text-[#8B7355] mb-4">
                Our cake experts are available 24/7 to assist you with your custom order.
              </p>
              <a
                href="tel:+919876543210"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-4 py-3 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
              >
                <Phone className="w-4 h-4" />
                Call +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Mobile sticky price bar ================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 border-t-2 border-[#E8E0D5] shadow-[0_-8px_30px_rgba(74,46,27,0.15)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#8B7355]">Estimated price</div>
            <div className="cs-display text-2xl font-extrabold text-[#8B6914]">
              {estimatedPrice > 0 ? `₹${estimatedPrice.toLocaleString("en-IN")}` : "—"}
            </div>
          </div>
          <span className="rounded-full bg-[#FDF8E8] border border-[#E8D58A] px-4 py-2 text-sm font-bold text-[#8B6914]">
            Step {currentStep} of 3
          </span>
        </div>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 pb-4 border-b-2 border-dashed border-[#E8E0D5]">
    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-md flex items-center justify-center">
      {icon}
    </div>
    <div>
      {/* Playfair Display for Big Letters */}
      <h2 className="cs-display text-xl sm:text-2xl font-bold text-[#3E2C1C] leading-tight">{title}</h2>
      {subtitle && <p className="text-sm text-[#8B7355]">{subtitle}</p>}
    </div>
  </div>
);

const Field = ({ label, error, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-[#5C3A21]">{label}</label>
    {children}
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <span className="text-[#E8E0D5]">{label}</span>
    <span className="font-bold text-right text-[#FDFBF7]">{value}</span>
  </div>
);

// little stack of layers that shows how big the cake is
const TierIcon = ({ tiers, active }) => {
  const widths = tiers === 1 ? ["w-8"] : tiers === 2 ? ["w-5", "w-8"] : ["w-4", "w-6", "w-9"];
  return (
    <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#FFFDF9] border border-[#E8E0D5] flex flex-col items-center justify-center gap-0.5 shadow-sm">
      {widths.map((w, i) => (
        <span
          key={i}
          className={`block h-2 ${w} rounded-full ${
            active ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37]" : "bg-[#E8E0D5]"
          }`}
        ></span>
      ))}
    </div>
  );
};

// 🎂 LIVE CAKE DRAWING: Original Pink/Orange/Yellow Colors Restored
const CakePreview = ({ flavor, weight, message }) => {
  const color = FLAVOR_COLORS[flavor] || "#fbcfe8";
  const found = WEIGHTS.find((w) => w.value === weight);
  const tiers = found ? found.tiers : 1;
  const widths = tiers === 1 ? ["w-40"] : tiers === 2 ? ["w-28", "w-44"] : ["w-24", "w-36", "w-48"];

  return (
    <div className="flex flex-col items-center">
      {/* candles - original orange/yellow/pink */}
      <div className="flex items-end gap-4 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <span
              className="cs-flicker block h-4 w-2.5 rounded-full bg-gradient-to-t from-orange-400 to-yellow-200"
              style={{ animationDelay: `${i * 0.25}s` }}
            ></span>
            <span className="block h-7 w-2 rounded-sm bg-pink-200"></span>
          </div>
        ))}
      </div>

      {/* tiers - original colors & sprinkles */}
      {widths.map((w, i) => (
        <div
          key={i}
          className={`relative h-14 ${w} ${i > 0 ? "-mt-1" : ""} overflow-hidden rounded-2xl shadow-md transition-all duration-500`}
          style={{ background: color }}
        >
          <div className="cs-drip absolute inset-x-0 top-0"></div>
          <span className="absolute bottom-3 left-5 h-2 w-4 rounded-full bg-yellow-300 rotate-12"></span>
          <span className="absolute bottom-6 right-6 h-2 w-4 rounded-full bg-white -rotate-12"></span>
          <span className="absolute bottom-2 right-12 h-2 w-4 rounded-full bg-pink-400 rotate-45"></span>
        </div>
      ))}

      {/* plate - original white/pink */}
      <div className="mt-1 h-3 w-56 rounded-full bg-white shadow-md border border-pink-100"></div>

      {/* message - original pink text */}
      <p className="cs-script mt-4 min-h-[1.75rem] text-center text-pink-600 break-words max-w-full px-2">
        {message ? `“${message}”` : <span className="text-gray-400 text-sm">Your message will appear here</span>}
      </p>
    </div>
  );
};

export default CustomCake;