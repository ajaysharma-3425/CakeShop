import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchCakeById, fetchAllCakes } from "../features/cakes/cakeSlice";
import { placeFixedCakeOrder } from "../features/orders/orderSlice";
import toast from "react-hot-toast";
import { addToCart } from "../features/cart/cartSlice";
import { ShoppingCart } from "lucide-react";


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

@keyframes cs-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes cs-pop   { 0% { opacity: 0; transform: translateY(24px) scale(.97); } 100% { opacity: 1; transform: none; } }
@keyframes cs-rise  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 5s ease-in-out infinite; }
.cs-pop   { animation: cs-pop .35s ease-out both; }
.cs-rise  { animation: cs-rise .5s ease-out both; }
`;

const SPRINKLES = [
  { top: "4%", left: "-2%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "12%", right: "-3%", color: "bg-[#E8C84A]", rot: "-35deg", delay: ".6s" },
  { top: "48%", left: "-4%", color: "bg-[#D4AF37]", rot: "60deg", delay: "1.2s" },
  { bottom: "16%", right: "-4%", color: "bg-[#FDFBF7]", rot: "-15deg", delay: ".3s" },
  { bottom: "4%", left: "10%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
];

const FLAVOR_EMOJI = {
  vanilla: "🌿",
  chocolate: "🍫",
  strawberry: "🍓",
  "red-velvet": "❤️",
  butterscotch: "🍯",
  pineapple: "🍍",
};

const formatLabel = (value) =>
  value
    ? String(value)
      .split(/[-_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
    : "";

const getCategoryColor = (category) => {
  const colors = {
    birthday: "bg-[#FDFBF7] text-[#5C3A21] border-[#E8E0D5]",
    wedding: "bg-[#F5F0E8] text-[#4A2E1B] border-[#E8E0D5]",
    anniversary: "bg-[#FDFBF7] text-[#8B6914] border-[#E8E0D5]",
    custom: "bg-[#F5F0E8] text-[#5C3A21] border-[#E8E0D5]",
    vegan: "bg-[#F0EBE3] text-[#4A2E1B] border-[#E8E0D5]",
    premium: "bg-[#FDF8E8] text-[#8B6914] border-[#E8D58A]",
    regular: "bg-[#F5F0E8] text-[#5C3A21] border-[#E8E0D5]",
  };
  return colors[category?.toLowerCase()] || "bg-[#F5F0E8] text-[#5C3A21] border-[#E8E0D5]";
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const CakeDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cake, cakes = [], loading, error } = useSelector((state) => state.cakes);

  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const user = useSelector((state) => state.auth?.user);

  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");

  useEffect(() => {
    dispatch(fetchCakeById(id));
    setImageError(false);
    setQuantity(1);
    setShowModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch, id]);

  useEffect(() => {
    if (!cakes || cakes.length === 0) {
      dispatch(fetchAllCakes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const related = useMemo(() => {
    if (!cake) return { items: [], sameType: false };
    const pool = (cakes || []).filter((c) => c._id !== cake._id && c.isAvailable !== false);
    const key = cake.category?.toLowerCase();
    const same = key ? pool.filter((c) => c.category?.toLowerCase() === key) : [];
    if (same.length > 0) return { items: same.slice(0, 4), sameType: true };
    return { items: pool.slice(0, 4), sameType: false };
  }, [cakes, cake]);


  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add cakes to your cart");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      toast.error("Only customer accounts can use the cart");
      return;
    }

    if (!cake || cake.isAvailable === false) {
      toast.error("Sorry, this cake is currently unavailable");
      return;
    }

    try {
      setIsAddingToCart(true);

      await dispatch(
        addToCart({
          cakeId: cake._id,
          quantity,
        })
      ).unwrap();

      toast.success(`${cake.name} added to cart!`);
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Unable to add cake to cart"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };


  const finalOrderHandler = async () => {
    if (cake?.isAvailable === false) {
      toast.error("Sorry, this cake is currently unavailable");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter delivery address");
      return;
    }
    if (!mobile.trim()) {
      toast.error("Please enter mobile number");
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsOrdering(true);

      const res = await dispatch(
        placeFixedCakeOrder({
          cakeId: cake._id,
          quantity,
          message,
          address,
          mobile,
          paymentMethod,
        })
      ).unwrap();

      toast.success("Order placed successfully 🎂");

      setShowModal(false);
      setIsOrdering(false);
      setAddress("");
      setMobile("");
      setMessage("");

      if (paymentMethod === "cod") {
        navigate("/my-orders");
      } else {
        navigate(`/payment/${res._id}`);
      }
    } catch (err) {
      toast.error("Order failed. Please try again.");
      setIsOrdering(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isCurrent = cake && String(cake._id) === String(id);

  /* ---------------- Error ---------------- */
  if (error && !isCurrent) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <style>{shopStyles}</style>
        <div className="max-w-md w-full text-center bg-[#FFFDF9] rounded-[2rem] shadow-xl border border-[#E8E0D5] p-10">
          <div className="text-6xl mb-3">🍰</div>
          <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Oops, this cake slipped away</h3>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Loading ---------------- */
  if (!cake || (loading && !isCurrent)) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <style>{shopStyles}</style>
        <div className="text-center">
          <div className="text-6xl cs-float">🧁</div>
          <p className="cs-script mt-4 text-2xl text-[#8B6914]">Baking your page...</p>
          <div className="mt-4 mx-auto h-1.5 w-40 rounded-full bg-[#E8E0D5] overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- derived details ---------- */
  const unavailable = cake.isAvailable === false;
  const ingredientList = Array.isArray(cake.ingredients)
    ? cake.ingredients.filter(Boolean)
    : cake.ingredients
      ? String(cake.ingredients)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];
  const servingsText = cake.servings
    ? /^[\d\s\-–]+$/.test(String(cake.servings))
      ? `${cake.servings} people`
      : cake.servings
    : "";
  const flavorKey = cake.flavor?.toLowerCase();

  const detailTiles = [
    { label: "Category", value: formatLabel(cake.category) || "Regular", icon: "🏷️" },
    { label: "Flavor", value: formatLabel(cake.flavor), icon: FLAVOR_EMOJI[flavorKey] || "🍰" },
    { label: "Weight / Size", value: cake.weight, icon: "⚖️" },
    { label: "Serves", value: servingsText, icon: "👥" },
  ].filter((t) => t.value);

  const total = cake.price * quantity;
  const closeModal = () => !isOrdering && setShowModal(false);

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C] pb-28 lg:pb-0">
      <style>{shopStyles}</style>

      {/* ================= Banner strip with breadcrumb ================= */}
      <div className="bg-gradient-to-r from-[#4A2E1B] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center flex-wrap gap-2 text-sm font-bold">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/30 px-4 py-1.5 transition"
            >
              <span aria-hidden>←</span> Back
            </button>
            <span className="hidden sm:flex items-center gap-2 text-[#E8E0D5] font-semibold">
              <Link to="/" className="hover:text-[#FDFBF7]">Home</Link>
              <span>/</span>
              <Link to="/cakes" className="hover:text-[#FDFBF7]">Cakes</Link>
              <span>/</span>
              <span className="text-[#FDFBF7] truncate max-w-[200px]">{cake.name}</span>
            </span>
          </nav>
        </div>
      </div>
      <div className="cs-frosting"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* ================= Hero ================= */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image */}
          <div className="relative mx-auto w-full max-w-md lg:sticky lg:top-28 cs-rise">
            <div className="absolute inset-0 -m-6 rounded-[3rem] bg-gradient-to-br from-[#F5F0E8] to-[#FDFBF7] blur-2xl"></div>

            {SPRINKLES.map((s, i) => (
              <span
                key={i}
                className={`cs-float absolute z-20 hidden sm:block h-2 w-6 rounded-full ${s.color}`}
                style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, "--r": s.rot, animationDelay: s.delay }}
              ></span>
            ))}

            {/* polaroid-style frame - IMAGE FIT FIX */}
            <div className="relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 rounded-[2rem] bg-[#FFFDF9] p-3 pb-5 shadow-2xl shadow-[#E8E0D5]/50">
              <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#F5F0E8] p-6 flex items-center justify-center">
                {cake.image && !imageError ? (
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="h-full w-full object-contain hover:scale-105 transition-transform duration-700"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <div className="text-8xl cs-float">🎂</div>
                    <p className="cs-script mt-4 text-[#8B6914] text-xl">Photo coming soon</p>
                  </div>
                )}
              </div>
              <p className="cs-script text-center text-[#8B6914] mt-3 truncate px-2">{cake.name}</p>
            </div>

            {/* category ribbon */}
            <span
              className={`absolute z-20 top-8 -left-3 sm:-left-5 inline-flex items-center px-5 py-2 rounded-full text-sm font-bold border-2 shadow-md bg-[#FFFDF9] capitalize ${getCategoryColor(
                cake.category
              )}`}
            >
              {cake.category || "Regular"}
            </span>

            {unavailable && (
              <div className="absolute inset-3 bottom-14 z-20 rounded-[1.5rem] bg-[#2E1B0F]/60 flex items-center justify-center">
                <span className="rounded-full bg-[#FFFDF9] px-5 py-2 text-sm font-bold text-[#5C3A21]">
                  Currently unavailable
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-7 cs-rise">
            <div>
              <p className="cs-script text-2xl text-[#8B6914]">Our sweet creation</p>
              {/* Playfair Display for Big Letters */}
              <h1 className="cs-display mt-1 text-4xl sm:text-5xl font-extrabold leading-tight text-[#3E2C1C]">
                {cake.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {cake.flavor && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-3.5 py-1.5 text-sm font-bold text-[#5C3A21]">
                    <span>{FLAVOR_EMOJI[flavorKey] || "🍰"}</span> {formatLabel(cake.flavor)}
                  </span>
                )}
                {cake.weight && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-3.5 py-1.5 text-sm font-bold text-[#5C3A21]">
                    ⚖️ {cake.weight}
                  </span>
                )}
                {servingsText && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-3.5 py-1.5 text-sm font-bold text-[#5C3A21]">
                    👥 Serves {servingsText}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold border-2 ${unavailable
                    ? "bg-[#F5F0E8] border-[#E8E0D5] text-[#8B7355]"
                    : "bg-[#FDF8E8] border-[#E8D58A] text-[#8B6914]"
                    }`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    {!unavailable && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#C9A227] opacity-75 animate-ping"></span>
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${unavailable ? "bg-[#8B7355]" : "bg-[#C9A227]"
                        }`}
                    ></span>
                  </span>
                  {unavailable ? "Unavailable" : "In Stock"}
                </span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-[#8B7355]">
              {cake.description || "A delicious cake made with premium ingredients and crafted to perfection."}
            </p>

            {/* Price card */}
            <div className="relative rounded-[1.75rem] bg-[#FFFDF9] p-6 shadow-lg shadow-[#E8E0D5]/60 border-2 border-dashed border-[#E8D58A]">
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow">
                Menu Price
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
                <div>
                  <div className="cs-display text-5xl font-extrabold text-[#3E2C1C]">
                    <span className="text-[#8B6914]">₹</span>
                    {formatPrice(cake.price)}
                  </div>
                  <div className="text-sm text-[#8B7355] mt-1">per cake</div>
                </div>
                <div className="text-sm font-bold text-[#8B6914]">✓ Free Delivery</div>
              </div>

              <div className="my-5 border-t border-dashed border-[#E8E0D5]"></div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <QuantityStepper quantity={quantity} setQuantity={setQuantity} />
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#8B7355]">
                    Total for {quantity} cake{quantity > 1 ? "s" : ""}
                  </div>
                  <div className="cs-display text-3xl font-bold text-[#8B6914]">₹{formatPrice(total)}</div>
                </div>
              </div>
            </div>


            <div className="hidden lg:grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={unavailable || isOrdering}
                className="group w-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] py-4 text-base font-bold text-[#2E1B0F] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="text-xl">🎂</span>
                Order Now
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={unavailable || isAddingToCart}
                className="w-full rounded-full border-2 border-[#6B4423] bg-[#FFFDF9] py-4 text-base font-bold text-[#6B4423] transition-all duration-300 hover:bg-[#F5F0E8] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>


            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: "🧈", label: "Premium Ingredients" },
                { icon: "🚚", label: "Free Delivery" },
                { icon: "💌", label: "Custom Message" },
              ].map((b) => (
                <div key={b.label} className="rounded-2xl bg-[#FFFDF9]/80 border border-[#E8E0D5] px-2 py-3 shadow-sm">
                  <div className="text-2xl">{b.icon}</div>
                  <div className="mt-1 text-xs font-bold text-[#5C3A21]">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= Cake details ================= */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <p className="cs-script text-2xl text-[#8B6914]">What's inside</p>
            {/* Playfair Display for Big Letters */}
            <h2 className="cs-display text-3xl md:text-4xl font-extrabold text-[#3E2C1C]">Cake Details</h2>
          </div>

          <div className="bg-[#FFFDF9] rounded-[2.25rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-6 md:p-10">
            <div className={`grid grid-cols-2 ${detailTiles.length > 3 ? "md:grid-cols-4" : "md:grid-cols-" + detailTiles.length} gap-4`}>
              {detailTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-3xl bg-gradient-to-br from-[#F5F0E8] to-[#FDFBF7] border border-[#E8E0D5] p-5 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#FFFDF9] shadow flex items-center justify-center text-2xl">
                    {tile.icon}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">{tile.label}</div>
                  <div className="cs-display mt-1 text-lg font-bold text-[#3E2C1C] break-words">{tile.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid md:grid-cols-5 gap-8">
              <div className="md:col-span-3">
                <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-3">About this cake</h3>
                <p className="text-[#8B7355] leading-relaxed">
                  {cake.description || "A delicious cake made with premium ingredients and crafted to perfection."}
                </p>
              </div>

              <div className="md:col-span-2">
                <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-3">Ingredients</h3>
                {ingredientList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ingredientList.map((item, i) => (
                      <span
                        key={`${item}-${i}`}
                        className="rounded-full bg-[#FDF8E8] border border-[#E8D58A] px-3.5 py-1.5 text-sm font-semibold text-[#8B6914]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8B7355]">
                    Made with premium ingredients. Ask us about the full ingredient list when you order.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= More like this ================= */}
        {related.items.length > 0 && (
          <section className="mt-16 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="cs-script text-2xl text-[#8B6914]">
                  {related.sameType ? "You may also love" : "More to explore"}
                </p>
                <h2 className="cs-display text-3xl md:text-4xl font-extrabold text-[#3E2C1C]">
                  {related.sameType ? `More ${formatLabel(cake.category)} Cakes` : "You May Also Like"}
                </h2>
              </div>
              <Link
                to="/cakes"
                className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-6 py-2.5 font-bold text-[#8B6914] hover:bg-[#FDF8E8] transition"
              >
                Browse all cakes <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.items.map((item) => (
                <RelatedCard key={item._id} cake={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ================= Mobile sticky order bar ================= */}
      {!showModal && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 border-t-2 border-[#E8E0D5] shadow-[0_-8px_30px_rgba(74,46,27,0.15)] px-4 py-3">

          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center justify-between sm:block">
              <div className="text-xs font-semibold text-[#8B7355]">
                Total • {quantity} cake{quantity > 1 ? "s" : ""}
              </div>

              <div className="cs-display text-2xl font-extrabold text-[#8B6914]">
                ₹{formatPrice(total)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={unavailable || isOrdering}
                className="rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] py-3 font-bold text-xs sm:text-sm text-[#2E1B0F] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {unavailable ? "Unavailable" : "Order Now"}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={unavailable || isAddingToCart}
                className="rounded-full border-2 border-[#6B4423] bg-[#FFFDF9] py-3 font-bold text-xs sm:text-sm text-[#6B4423] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        
        </div>
      )}

      {/* ================= Order sheet ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2E1B0F]/50 backdrop-blur-sm" onClick={closeModal}></div>

          <div className="cs-pop relative flex w-full max-w-lg max-h-[92vh] flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-[#FDFBF7] shadow-2xl">
            {/* Header */}
            <div className="relative shrink-0 bg-gradient-to-r from-[#4A2E1B] to-[#2E1B0F] px-6 pt-6 pb-4 text-[#FDFBF7]">
              <button
                onClick={closeModal}
                disabled={isOrdering}
                aria-label="Close"
                className="absolute right-4 top-4 h-9 w-9 rounded-full bg-[#FDFBF7]/20 flex items-center justify-center hover:bg-[#FDFBF7]/30 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="cs-script text-xl text-[#E8C84A]">Almost there!</p>
              <h3 className="cs-display text-2xl font-bold">Complete Your Order</h3>
            </div>
            <div className="shrink-0 -mt-px">
              <div className="cs-frosting"></div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {/* Summary - IMAGE FIT FIX */}
              <div className="flex items-center gap-4 rounded-2xl bg-[#FFFDF9] p-4 border border-[#E8E0D5] shadow-sm">
                {cake.image && !imageError ? (
                  <div className="h-20 w-20 rounded-xl bg-[#F5F0E8] p-2 flex items-center justify-center">
                    <img
                      src={cake.image}
                      alt={cake.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-4xl">🎂</div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="cs-display font-bold text-[#3E2C1C] truncate">{cake.name}</h4>
                  <div className="text-sm text-[#8B7355]">₹{formatPrice(cake.price)} each</div>
                  <div className="mt-2">
                    <QuantityStepper quantity={quantity} setQuantity={setQuantity} small />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-4">
                <h4 className="cs-display text-lg font-bold text-[#3E2C1C] flex items-center gap-2">
                  <span>📍</span> Delivery Details
                </h4>

                <div>
                  <label className="block text-sm font-bold text-[#5C3A21] mb-2">Delivery Address *</label>
                  <textarea
                    placeholder="Enter complete delivery address with landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-24 px-4 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 resize-none transition"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#5C3A21] mb-2">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#8B7355] font-semibold pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-14 pr-4 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 transition"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="cs-display block text-lg font-bold text-[#3E2C1C] mb-2">
                  <span className="mr-2">💌</span>Message on Cake
                  <span className="ml-2 text-sm font-medium text-[#8B7355]" style={{ fontFamily: "Quicksand" }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  placeholder="Write your message here... E.g., Happy Birthday! 🎉"
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setMessage(e.target.value);
                    }
                  }}
                  className="w-full h-28 px-4 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 resize-none transition"
                  rows="3"
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-1.5 text-xs text-[#8B7355]">
                  <span>Max 100 characters</span>
                  <span className={message.length >= 100 ? "text-red-500 font-bold" : ""}>{message.length}/100</span>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="cs-display text-lg font-bold text-[#3E2C1C] mb-3 flex items-center gap-2">
                  <span>💳</span> Payment Method *
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "online", title: "Online Payment", sub: "UPI / Credit / Debit Card", icon: "📱" },
                    { value: "cod", title: "Cash on Delivery", sub: "Pay when you receive", icon: "💵" },
                  ].map((opt) => {
                    const active = paymentMethod === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`relative flex flex-col gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all ${active
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
                        <span className="font-bold text-[#3E2C1C] text-sm">{opt.title}</span>
                        <span className="text-xs text-[#8B7355]">{opt.sub}</span>
                        {active && (
                          <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] flex items-center justify-center shadow">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-[#8B7355]">
                <span>🔒</span>
                Your payment is secure and encrypted. We never store your credit card details.
              </p>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-[#E8E0D5] bg-[#FFFDF9] px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#8B7355]">Total Amount</div>
                  <div className="cs-display text-2xl font-bold text-[#8B6914]">₹{formatPrice(total)}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-[#8B7355]">Inclusive of all taxes</div>
                  <div className="font-bold text-[#8B6914]">✓ Free Delivery</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={isOrdering}
                  className="flex-1 h-12 rounded-full border-2 border-[#E8E0D5] text-[#8B7355] font-bold hover:bg-[#F5F0E8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={finalOrderHandler}
                  disabled={isOrdering}
                  className="flex-[1.6] h-12 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] hover:from-[#B8911E] hover:to-[#C9A227] text-[#2E1B0F] font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isOrdering ? (
                    <>
                      <span className="h-5 w-5 rounded-full border-2 border-[#2E1B0F]/30 border-t-[#2E1B0F] animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    <>🎂 Confirm Order</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- small building blocks ---------- */

const QuantityStepper = ({ quantity, setQuantity, small }) => (
  <div className="inline-flex items-center rounded-full bg-[#F5F0E8] border border-[#E8E0D5] p-1.5">
    <button
      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
      disabled={quantity === 1}
      aria-label="Decrease quantity"
      className={`${small ? "h-8 w-8" : "h-10 w-10"} rounded-full flex items-center justify-center text-xl font-bold transition ${quantity > 1 ? "bg-[#FFFDF9] text-[#8B6914] shadow hover:bg-[#FDF8E8]" : "text-[#8B7355] cursor-not-allowed"
        }`}
    >
      −
    </button>
    <span className={`${small ? "w-9" : "w-12"} text-center text-lg font-bold text-[#3E2C1C]`}>{quantity}</span>
    <button
      onClick={() => setQuantity(quantity + 1)}
      aria-label="Increase quantity"
      className={`${small ? "h-8 w-8" : "h-10 w-10"} rounded-full flex items-center justify-center text-xl font-bold bg-[#FFFDF9] text-[#8B6914] shadow hover:bg-[#FDF8E8] transition`}
    >
      +
    </button>
  </div>
);

const RelatedCard = ({ cake }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      to={`/cakes/${cake._id}`}
      className="group block bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#C9A227]/50 transition-all duration-300 overflow-hidden"
    >
      {/* IMAGE FIT FIX */}
      <div className="relative h-48 overflow-hidden bg-[#F5F0E8] p-4 flex items-center justify-center">
        {cake.image && !imageFailed ? (
          <img
            src={cake.image}
            alt={cake.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍰</div>
        )}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border shadow bg-[#FFFDF9]/95 capitalize ${getCategoryColor(
            cake.category
          )}`}
        >
          {cake.category || "Regular"}
        </span>
      </div>
      <div className="p-5">
        <h3 className="cs-display text-lg font-bold text-[#3E2C1C] line-clamp-1 group-hover:text-[#8B6914] transition-colors">
          {cake.name}
        </h3>
        <p className="text-sm text-[#8B7355] mt-1 mb-4 line-clamp-2 min-h-[40px]">{cake.description}</p>
        <div className="flex items-center justify-between">
          <span className="cs-display text-xl font-extrabold text-[#3E2C1C]">
            <span className="text-[#8B6914]">₹</span>
            {formatPrice(cake.price)}
          </span>
          <span className="text-sm font-bold text-[#8B6914] group-hover:translate-x-1 transition-transform">View →</span>
        </div>
      </div>
    </Link>
  );
};

export default CakeDetail;