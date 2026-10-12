import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCakes } from "../features/cakes/cakeSlice";
// import DominoLettering from "./DominoLettering"; // Adjust path as needed
import DominoLettering from "./DominoLettering";
/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; }
.cs-script  { font-family: 'Pacifico', cursive; }

/* scalloped frosting edges */
.cs-frosting-top {
  height: 28px;
  background-image: radial-gradient(circle at 50% 0, #C9A227 0 18px, transparent 19px);
  background-size: 44px 28px;
  background-repeat: repeat-x;
}
.cs-frosting-bottom {
  height: 28px;
  background-image: radial-gradient(circle at 50% 100%, #FDFBF7 0 18px, transparent 19px);
  background-size: 44px 28px;
  background-repeat: repeat-x;
}
.cs-drip {
  height: 14px;
  background-image: radial-gradient(circle at 50% 0, #FDFBF7 0 9px, transparent 10px);
  background-size: 20px 14px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes cs-flicker { 0%,100% { transform: scale(1) rotate(-3deg); } 50% { transform: scale(1.15) rotate(3deg); } }
@keyframes cs-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.cs-float   { animation: cs-float 5s ease-in-out infinite; }
.cs-flicker { animation: cs-flicker 1.2s ease-in-out infinite; transform-origin: bottom center; }
.cs-rise    { animation: cs-rise .6s ease-out both; }
`;

const CATEGORIES = [
  { id: "all", name: "All Cakes", icon: "🎂" },
  { id: "birthday", name: "Birthday", icon: "🎉" },
  { id: "wedding", name: "Wedding", icon: "💒" },
  { id: "anniversary", name: "Anniversary", icon: "💝" },
  { id: "custom", name: "Custom", icon: "🎨" },
  { id: "vegan", name: "Vegan", icon: "🌱" },
  { id: "premium", name: "Premium", icon: "👑" },
];

const MAX_PRICE = 10000;

const SPRINKLES = [
  { top: "12%", left: "6%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "22%", left: "46%", color: "bg-[#FDFBF7]", rot: "-35deg", delay: ".6s" },
  { top: "68%", left: "4%", color: "bg-[#E8C84A]", rot: "60deg", delay: "1.2s" },
  { top: "78%", left: "48%", color: "bg-[#D4AF37]", rot: "-15deg", delay: ".3s" },
  { top: "8%", right: "6%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
  { top: "55%", right: "3%", color: "bg-[#FDFBF7]", rot: "75deg", delay: "1.5s" },
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cakes, loading } = useSelector((state) => state.cakes);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    dispatch(fetchAllCakes());
  }, [dispatch]);

  const availableCakes = useMemo(
    () => (cakes || []).filter((cake) => cake.isAvailable !== false),
    [cakes]
  );

  const featuredCakes = useMemo(() => availableCakes.slice(0, 4), [availableCakes]);

  const stats = useMemo(
    () => ({
      totalCakes: availableCakes.length,
      categories: new Set(availableCakes.map((cake) => cake.category)).size,
    }),
    [availableCakes]
  );

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return availableCakes
      .filter(
        (cake) =>
          cake.name?.toLowerCase().includes(query) || cake.category?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [availableCakes, searchQuery]);

  const filteredCakes = availableCakes.filter((cake) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      cake.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cake.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || cake.category?.toLowerCase() === selectedCategory;
    const matchesPrice = cake.price >= priceRange[0] && cake.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && suggestions.length > 0) {
      navigate(`/cakes/${suggestions[0]._id}`);
      setSearchQuery("");
      setShowSuggestions(false);
    } else if (searchQuery.trim()) {
      navigate(`/cakes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (cakeId) => {
    navigate(`/cakes/${cakeId}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, MAX_PRICE]);
    setShowSuggestions(false);
  };

  const scrollToCollection = () => {
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pickCategory = (id) => {
    setSelectedCategory(id);
    scrollToCollection();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const getCategoryColor = (category) => {
    const colors = {
      birthday: "bg-[#FDFBF7] text-[#5C3A21] border-[#E8E0D5]",
      wedding: "bg-[#F5F0E8] text-[#4A2E1B] border-[#E8E0D5]",
      anniversary: "bg-[#FDFBF7] text-[#8B6914] border-[#E8E0D5]",
      custom: "bg-[#F5F0E8] text-[#5C3A21] border-[#E8E0D5]",
      vegan: "bg-[#F0EBE3] text-[#4A2E1B] border-[#E8E0D5]",
      premium: "bg-[#FDF8E8] text-[#8B6914] border-[#E8D58A]",
    };
    return colors[category?.toLowerCase()] || "bg-[#F5F0E8] text-[#5C3A21] border-[#E8E0D5]";
  };

  const filtersActive =
    searchQuery.trim() !== "" || selectedCategory !== "all" || priceRange[1] !== MAX_PRICE;

  const avgFilteredPrice =
    filteredCakes.length > 0
      ? Math.round(filteredCakes.reduce((acc, cake) => acc + cake.price, 0) / filteredCakes.length)
      : 0;

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <style>{shopStyles}</style>

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] text-[#FDFBF7]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#C9A227]/10"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-[#C9A227]/10"></div>
          {SPRINKLES.map((s, i) => (
            <span
              key={i}
              className={`cs-float absolute hidden sm:block h-2 w-6 rounded-full opacity-80 ${s.color}`}
              style={{
                top: s.top,
                left: s.left,
                right: s.right,
                "--r": s.rot,
                animationDelay: s.delay,
              }}
            ></span>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-20 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text + search */}
            <div className="text-center lg:text-left">
              <p className="cs-script text-2xl md:text-3xl text-[#E8C84A] cs-rise">Sweet delights</p>

              {/* ===== DOMINO LETTERING HEADLINE ===== */}
              <DominoLettering
                text="Freshly baked, made with love"
                as="h1"
                className="cs-display mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight cs-rise"
                color="#FDFBF7"
                fall="side"
                direction="right"
                stagger={0.04}
                gravity={1.2}
                lean={55}
                stiffness={1.1}
                damping={0.6}
                hold={1.5}
                shade={0.5}
                loop={false}
                clickTopple={true}
                area="parent"
              />

              <p className="mt-5 text-lg md:text-xl text-[#E8E0D5] max-w-xl mx-auto lg:mx-0 cs-rise">
                Discover our collection of artisan cakes, crafted with premium ingredients and a whole lot of passion.
              </p>

              {/* Search with suggestions */}
              <div className="relative mt-8 max-w-xl mx-auto lg:mx-0 z-50">
                {showSuggestions && (
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                )}

                <form onSubmit={handleSearchSubmit} className="relative z-50">
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C9A227]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search cakes by name or occasion..."
                      className="w-full pl-14 pr-36 py-4 text-base md:text-lg text-[#3E2C1C] bg-[#FDFBF7] rounded-full shadow-2xl shadow-[#2E1B0F]/30 focus:outline-none focus:ring-4 focus:ring-[#C9A227]/30 transition"
                      autoComplete="off"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        className="absolute right-28 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-[#8B7355] hover:text-[#5C3A21] hover:bg-[#F5F0E8]"
                      >
                        <svg className="h-4 w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-2.5 font-bold text-[#2E1B0F] shadow-md hover:shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] transition"
                    >
                      Search
                    </button>
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-3 bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden text-left">
                      <div className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                        Quick jump to a cake
                      </div>
                      {suggestions.map((cake) => (
                        <button
                          key={cake._id}
                          type="button"
                          onClick={() => handleSuggestionClick(cake._id)}
                          className="group w-full text-left px-5 py-3 hover:bg-[#F5F0E8] transition-colors flex items-center gap-3 border-t border-[#F0EBE3]"
                        >
                          <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5]">
                            {cake.image ? (
                              <img src={cake.image} alt={cake.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🍰</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-[#3E2C1C] truncate group-hover:text-[#C9A227]">
                              {cake.name}
                            </p>
                            <p className="text-xs text-[#8B7355] capitalize truncate">{cake.category || "Regular"}</p>
                          </div>
                          <span className="text-xs font-extrabold text-[#8B6914] bg-[#FDF8E8] px-3 py-1 rounded-full">
                            ₹{formatPrice(cake.price)}
                          </span>
                        </button>
                      ))}
                      <div className="px-5 py-3 bg-[#F5F0E8]/60 text-xs text-[#8B7355] border-t border-[#E8E0D5]">
                        Press <kbd className="px-2 py-0.5 bg-[#FFFDF9] border border-[#E8E0D5] rounded font-mono">Enter</kbd> to open the first result
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* CSS cake illustration */}
            <div className="hidden lg:flex justify-center">
              <div className="cs-float relative flex flex-col items-center">
                <div className="flex items-end gap-5 mb-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span
                        className="cs-flicker block h-5 w-3 rounded-full bg-gradient-to-t from-[#C9A227] to-[#E8C84A]"
                        style={{ animationDelay: `${i * 0.25}s` }}
                      ></span>
                      <span className="block h-9 w-2.5 rounded-sm bg-[#FDFBF7]"></span>
                    </div>
                  ))}
                </div>

                <div className="relative h-16 w-32 overflow-hidden rounded-2xl bg-[#D4AF37] shadow-lg">
                  <div className="cs-drip absolute inset-x-0 top-0"></div>
                  <span className="absolute bottom-3 left-5 h-2 w-5 rounded-full bg-[#E8C84A] rotate-12"></span>
                  <span className="absolute bottom-5 right-6 h-2 w-5 rounded-full bg-[#8B6914] -rotate-12"></span>
                </div>
                <div className="relative -mt-1 h-20 w-48 overflow-hidden rounded-2xl bg-[#C9A227] shadow-lg">
                  <div className="cs-drip absolute inset-x-0 top-0"></div>
                  <span className="absolute bottom-4 left-8 h-2 w-5 rounded-full bg-[#FDFBF7] rotate-45"></span>
                  <span className="absolute bottom-8 left-1/2 h-2 w-5 rounded-full bg-[#E8C84A] -rotate-12"></span>
                  <span className="absolute bottom-5 right-8 h-2 w-5 rounded-full bg-[#8B6914] rotate-12"></span>
                </div>
                <div className="relative -mt-1 h-24 w-64 overflow-hidden rounded-2xl bg-[#B8911E] shadow-lg">
                  <div className="cs-drip absolute inset-x-0 top-0"></div>
                  <span className="absolute bottom-5 left-10 h-2 w-5 rounded-full bg-[#FDFBF7] rotate-12"></span>
                  <span className="absolute bottom-10 left-24 h-2 w-5 rounded-full bg-[#E8C84A] -rotate-45"></span>
                  <span className="absolute bottom-6 right-12 h-2 w-5 rounded-full bg-[#D4AF37] rotate-45"></span>
                  <span className="absolute bottom-12 right-8 h-2 w-5 rounded-full bg-[#FDFBF7] -rotate-12"></span>
                </div>
                <div className="mt-1 h-3 w-80 rounded-full bg-[#FDFBF7]/90 shadow-xl"></div>
                <div className="h-2 w-24 rounded-b-xl bg-[#FDFBF7]/80"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </section>

      {/* ================= QUICK STATS ================= */}
      <section className="relative z-10 -mt-2 pt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-[2rem] bg-[#FFFDF9] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-5 md:p-6">
            {[
              { value: `${stats.totalCakes}+`, label: "Premium Cakes", icon: "🎂" },
              { value: stats.categories, label: "Categories", icon: "🗂️" },
              { value: "24/7", label: "Order Support", icon: "💬" },
              { value: "Free", label: "Delivery", icon: "🚚" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="cs-display text-2xl md:text-3xl font-extrabold text-[#8B6914]">{s.value}</div>
                <div className="text-sm font-semibold text-[#8B7355]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SHOP BY OCCASION ================= */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="cs-script text-2xl text-[#8B6914]">For every celebration</p>
            <h2 className="cs-display text-3xl md:text-4xl font-extrabold text-[#3E2C1C]">Shop by Occasion</h2>
            <p className="mt-3 text-[#8B7355] max-w-xl mx-auto">
              Find the perfect cake for every special moment in your life
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-y-8 gap-x-3">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => pickCategory(category.id)}
                  className="group flex flex-col items-center gap-3"
                >
                  <span
                    className={`h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center text-3xl md:text-4xl border-4 transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-[#C9A227] to-[#D4AF37] border-white shadow-xl shadow-[#C9A227]/40 scale-110"
                        : "bg-[#FFFDF9] border-[#E8E0D5] shadow group-hover:border-[#C9A227]/50 group-hover:-translate-y-1"
                    }`}
                  >
                    {category.icon}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold ${active ? "text-[#8B6914]" : "text-[#5C3A21]"}`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="py-16 bg-gradient-to-b from-[#F5F0E8] to-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="cs-script text-2xl text-[#8B6914]">Customer favorites</p>
              <h2 className="cs-display text-3xl md:text-4xl font-extrabold text-[#3E2C1C]">Featured Cakes</h2>
              <p className="text-[#8B7355] mt-1">Our most loved and exquisite creations</p>
            </div>
            <Link
              to="/cakes"
              className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-7 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              View All
              <span aria-hidden>→</span>
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid count={4} cols="md:grid-cols-2 lg:grid-cols-4" tall />
          ) : featuredCakes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🧁</div>
              <p className="text-[#8B7355] font-semibold">Our bakers are busy. New cakes are coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCakes.map((cake) => (
                <Link
                  key={cake._id}
                  to={`/cakes/${cake._id}`}
                  className="group block bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#C9A227]/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5]">
                    {cake.image ? (
                      <img
                        src={cake.image}
                        alt={cake.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🎂</div>
                    )}
                    <span
                      className={`absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow bg-[#FFFDF9]/95 capitalize ${getCategoryColor(
                        cake.category
                      )}`}
                    >
                      {cake.category || "Regular"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-1 line-clamp-1 group-hover:text-[#8B6914] transition-colors">
                      {cake.name}
                    </h3>
                    <p className="text-[#8B7355] text-sm mb-4 line-clamp-2 h-10">
                      {cake.description || "Delicious premium cake"}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[#E8E0D5]">
                      <span className="cs-display text-2xl font-extrabold text-[#3E2C1C]">
                        <span className="text-[#8B6914]">₹</span>
                        {formatPrice(cake.price)}
                      </span>
                      <span className="rounded-full bg-[#FDF8E8] px-4 py-2 text-sm font-bold text-[#8B6914] group-hover:bg-gradient-to-r group-hover:from-[#C9A227] group-hover:to-[#D4AF37] group-hover:text-[#2E1B0F] transition-all">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BROWSE COLLECTION ================= */}
      <section id="collection" className="py-16 scroll-mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFDF9] rounded-[2.25rem] shadow-xl shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-5 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
              <div>
                <p className="cs-script text-xl text-[#8B6914]">Find your favorite</p>
                <h3 className="cs-display text-2xl md:text-3xl font-extrabold text-[#3E2C1C]">
                  Browse Our Collection
                </h3>
                <p className="text-[#8B7355] mt-1">
                  <span className="font-bold text-[#8B6914]">{filteredCakes.length}</span> cakes found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold border-2 transition ${
                    showFilters
                      ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow"
                      : "bg-[#FFFDF9] text-[#8B6914] border-[#E8D58A] hover:bg-[#FDF8E8]"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>

                {filtersActive && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 font-bold text-[#8B7355] hover:text-[#8B6914] transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border-2 transition ${
                      active
                        ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow"
                        : "bg-[#FFFDF9] text-[#8B6914] border-[#E8E0D5] hover:bg-[#FDF8E8] hover:border-[#E8D58A]"
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                );
              })}
            </div>

            {showFilters && (
              <div className="mt-6 rounded-3xl bg-[#F5F0E8]/60 border-2 border-dashed border-[#E8E0D5] p-5 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-bold text-[#3E2C1C] mb-1">Price range</label>
                    <p className="text-sm text-[#8B7355] mb-4">
                      Up to <span className="font-extrabold text-[#8B6914]">₹{formatPrice(priceRange[1])}</span>
                    </p>
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 rounded-lg cursor-pointer accent-[#C9A227]"
                    />
                    <div className="flex justify-between text-xs font-semibold text-[#8B7355] mt-2">
                      <span>₹0</span>
                      <span>₹{formatPrice(MAX_PRICE)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8E0D5] p-4 text-center">
                      <div className="cs-display text-3xl font-extrabold text-[#8B6914]">{filteredCakes.length}</div>
                      <div className="text-sm font-semibold text-[#8B7355]">Cakes available</div>
                    </div>
                    <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8E0D5] p-4 text-center">
                      <div className="cs-display text-3xl font-extrabold text-[#C9A227]">
                        ₹{formatPrice(avgFilteredPrice)}
                      </div>
                      <div className="text-sm font-semibold text-[#8B7355]">Average price</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              {loading ? (
                <SkeletonGrid count={3} cols="md:grid-cols-2 lg:grid-cols-3" />
              ) : filteredCakes.length === 0 ? (
                <div className="text-center py-14">
                  <div className="text-6xl mb-4 cs-float inline-block">🍰</div>
                  <h4 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">
                    {searchQuery ? `No cakes found for "${searchQuery}"` : "No cakes found"}
                  </h4>
                  <p className="text-[#8B7355] mb-6">Try changing your search or filters</p>
                  <button
                    onClick={clearFilters}
                    className="rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-7 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCakes.slice(0, 6).map((cake) => (
                    <Link
                      key={cake._id}
                      to={`/cakes/${cake._id}`}
                      className="group block bg-[#FFFDF9] border border-[#E8E0D5] rounded-[1.75rem] overflow-hidden shadow-md shadow-[#E8E0D5]/50 hover:shadow-xl hover:-translate-y-1 hover:border-[#C9A227]/50 transition-all duration-300"
                    >
                      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5]">
                        {cake.image ? (
                          <img
                            src={cake.image}
                            alt={cake.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🎂</div>
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
                        <h4 className="cs-display text-lg font-bold text-[#3E2C1C] line-clamp-1 group-hover:text-[#8B6914] transition-colors">
                          {cake.name}
                        </h4>
                        <p className="text-[#8B7355] text-sm mt-1 mb-4 line-clamp-2">{cake.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="cs-display text-xl font-extrabold text-[#3E2C1C]">
                            <span className="text-[#8B6914]">₹</span>
                            {formatPrice(cake.price)}
                          </span>
                          <span className="text-sm font-bold text-[#8B6914] group-hover:translate-x-1 transition-transform">
                            View →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {filteredCakes.length > 6 && (
                <div className="text-center mt-10">
                  <Link
                    to="/cakes"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-8 py-3.5 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    View All Cakes ({filteredCakes.length})
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-16 bg-gradient-to-b from-[#F5F0E8] to-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="cs-script text-2xl text-[#8B6914]">The sweet difference</p>
            <h2 className="cs-display text-3xl md:text-4xl font-extrabold text-[#3E2C1C]">
              Why Choose Our Cake Shop?
            </h2>
            <p className="mt-3 text-[#8B7355] max-w-xl mx-auto">We're committed to delivering excellence in every bite</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎯", title: "Premium Quality", description: "Made with finest ingredients and expert craftsmanship" },
              { icon: "🚚", title: "Fast Delivery", description: "Free delivery within 2-4 hours across the city" },
              { icon: "🎨", title: "Custom Designs", description: "Personalize your cake with custom messages and designs" },
              { icon: "💝", title: "Fresh Daily", description: "Baked fresh every day, never frozen or stale" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#FFFDF9] p-7 rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/50 border border-[#E8E0D5] text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#FDF8E8] to-[#E8E0D5] flex items-center justify-center text-3xl shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-2">{feature.title}</h3>
                <p className="text-[#8B7355] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F] p-8 md:p-14 text-center text-[#FDFBF7] shadow-2xl shadow-[#C9A227]/20">
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#C9A227]/10"></div>
            <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-[#C9A227]/10"></div>

            <div className="relative">
              <div className="text-5xl mb-3 cs-float inline-block">🎂</div>
              <h2 className="cs-display text-3xl md:text-4xl font-extrabold mb-3">
                Ready to order your perfect cake?
              </h2>
              <p className="text-[#E8E0D5] mb-8 max-w-xl mx-auto">
                Join thousands of happy customers who've celebrated their special moments with our cakes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/cakes"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FDFBF7] px-8 py-4 font-bold text-[#5C3A21] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Browse All Cakes
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#C9A227] px-8 py-4 font-bold text-[#E8C84A] hover:bg-[#C9A227]/15 transition-colors duration-200"
                >
                  Custom Order Inquiry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ---------- small building block ---------- */

const SkeletonGrid = ({ count, cols, tall }) => (
  <div className={`grid grid-cols-1 ${cols} gap-8`}>
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] overflow-hidden animate-pulse"
      >
        <div className={`${tall ? "h-64" : "h-52"} bg-[#F5F0E8]`}></div>
        <div className="p-6">
          <div className="h-6 bg-[#E8E0D5] rounded-full mb-3 w-3/4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-[#F5F0E8] rounded-full"></div>
            <div className="h-3 bg-[#F5F0E8] rounded-full w-5/6"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-7 bg-[#E8E0D5] rounded-full w-20"></div>
            <div className="h-8 bg-[#E8E0D5] rounded-full w-24"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Home;