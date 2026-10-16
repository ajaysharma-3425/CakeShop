import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCakes } from "../features/cakes/cakeSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "../features/cart/cartSlice";

/* ---------- Cake-shop typography + small custom effects ---------- */
const shopStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

.cs-body    { font-family: 'Quicksand', system-ui, sans-serif; }
.cs-display { font-family: 'Playfair Display', Georgia, serif; }
.cs-script  { font-family: 'Pacifico', cursive; }

.cs-frosting-bottom {
  height: 28px;
  background-image: radial-gradient(circle at 50% 100%, #FDFBF7 0 18px, transparent 19px);
  background-size: 44px 28px;
  background-repeat: repeat-x;
}

@keyframes cs-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes cs-rise  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.cs-float { animation: cs-float 5s ease-in-out infinite; }
.cs-rise  { animation: cs-rise .5s ease-out both; }

.cs-hide-scrollbar { scrollbar-width: none; }
.cs-hide-scrollbar::-webkit-scrollbar { display: none; }
`;

const PAGE_SIZE = 6;

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

const CATEGORY_EMOJI = {
  birthday: "🎉",
  wedding: "💒",
  anniversary: "💝",
  custom: "🎨",
  vegan: "🌱",
  premium: "👑",
};

const SPRINKLES = [
  { top: "14%", left: "6%", color: "bg-[#C9A227]", rot: "25deg", delay: "0s" },
  { top: "62%", left: "14%", color: "bg-[#FDFBF7]", rot: "-35deg", delay: ".6s" },
  { top: "20%", left: "30%", color: "bg-[#E8C84A]", rot: "60deg", delay: "1.2s" },
  { top: "70%", left: "46%", color: "bg-[#D4AF37]", rot: "-15deg", delay: ".3s" },
  { top: "16%", right: "28%", color: "bg-[#E8C84A]", rot: "40deg", delay: ".9s" },
  { top: "58%", right: "12%", color: "bg-[#FDFBF7]", rot: "75deg", delay: "1.5s" },
  { top: "22%", right: "6%", color: "bg-[#C9A227]", rot: "-50deg", delay: "1.8s" },
];

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

const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);

const Cakes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);

  const { cakes, loading, error } = useSelector((state) => state.cakes);

  useEffect(() => {
    dispatch(fetchAllCakes());
  }, [dispatch]);

  const availableCakes = useMemo(
    () => (cakes || []).filter((cake) => cake.isAvailable !== false),
    [cakes]
  );

  const categoryChips = useMemo(() => {
    const counts = {};
    availableCakes.forEach((cake) => {
      const key = cake.category?.toLowerCase();
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return [
      { id: "all", name: "All Cakes", icon: "🎂", count: availableCakes.length },
      ...Object.keys(counts).map((key) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        icon: CATEGORY_EMOJI[key] || "🍰",
        count: counts[key],
      })),
    ];
  }, [availableCakes]);

  const filteredCakes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = availableCakes.filter((cake) => {
      const matchesSearch =
        !query ||
        cake.name?.toLowerCase().includes(query) ||
        cake.category?.toLowerCase().includes(query) ||
        cake.description?.toLowerCase().includes(query);
      const matchesCategory = category === "all" || cake.category?.toLowerCase() === category;
      return matchesSearch && matchesCategory;
    });

    const sorted = [...list];
    if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return sorted;
  }, [availableCakes, searchQuery, category, sortBy]);

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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, category, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCakes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedCakes = filteredCakes.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (p) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageNumbers = () => {
    const nums = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) nums.push(p);
      else if (nums[nums.length - 1] !== "…") nums.push("…");
    }
    return nums;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && suggestions.length > 0) {
      navigate(`/cakes/${suggestions[0]._id}`);
      setSearchQuery("");
      setShowSuggestions(false);
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

  const clearAll = () => {
    setSearchQuery("");
    setCategory("all");
    setShowSuggestions(false);
  };

  const filtersActive = searchQuery.trim() !== "" || category !== "all";

  /* ---------------- Loading skeleton ---------------- */
  if (loading) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7]">
        <style>{shopStyles}</style>
        <div className="h-56 bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#2E1B0F]"></div>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="max-w-2xl mx-auto -mt-20 mb-10">
              <div className="h-14 bg-[#FFFDF9] rounded-full shadow-lg"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-8">
              {[...Array(PAGE_SIZE)].map((_, index) => (
                <div key={index} className="bg-[#FFFDF9] rounded-2xl sm:rounded-[2rem] border border-[#E8E0D5] overflow-hidden">
                  <div className="h-36 sm:h-48 lg:h-64 bg-[#F5F0E8]"></div>
                  <div className="p-3 sm:p-4 lg:p-6 space-y-3">
                    <div className="h-5 bg-[#E8E0D5] rounded-full w-1/3"></div>
                    <div className="h-6 bg-[#F5F0E8] rounded-full w-3/4"></div>
                    <div className="h-4 bg-[#F5F0E8] rounded-full w-full"></div>
                    <div className="h-4 bg-[#F5F0E8] rounded-full w-2/3"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 bg-[#E8E0D5] rounded-full w-24"></div>
                      <div className="h-9 bg-[#E8E0D5] rounded-full w-28"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="cs-script text-center text-xl text-[#8B6914] mt-8">Fetching our freshest cakes...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <style>{shopStyles}</style>
        <div className="max-w-md w-full text-center bg-[#FFFDF9] rounded-[2rem] shadow-xl border border-[#E8E0D5] p-10">
          <div className="text-6xl mb-3">🍰</div>
          <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Oops, the cakes slipped away</h3>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchAllCakes())}
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-16 md:pb-28 text-center">
          <p className="cs-script text-2xl md:text-3xl text-[#E8C84A] cs-rise">Our sweet shelf</p>
          <h1 className="cs-display mt-1 text-4xl md:text-6xl font-extrabold cs-rise">Our Exquisite Cakes</h1>
          <p className="mt-4 text-lg md:text-xl text-[#E8E0D5] max-w-2xl mx-auto cs-rise">
            Handcrafted with love, baked to perfection. Each cake tells a sweet story.
          </p>
        </div>

        <div className="cs-frosting-bottom absolute bottom-0 left-0 right-0"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ================= Search ================= */}
        <div className="relative z-30 max-w-2xl mx-auto -mt-6 mb-8">
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
                placeholder="Search cakes by name, category, or flavor..."
                className="w-full pl-14 pr-14 py-4 text-base md:text-lg text-[#3E2C1C] bg-[#FFFDF9] rounded-full shadow-2xl shadow-[#2E1B0F]/20 border-2 border-[#E8E0D5] focus:outline-none focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/20 transition"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center text-[#8B7355] hover:text-[#5C3A21] hover:bg-[#F5F0E8] transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-3 bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden">
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
                      <p className="font-bold text-sm text-[#3E2C1C] truncate group-hover:text-[#C9A227]">{cake.name}</p>
                      <p className="text-xs text-[#8B7355] capitalize truncate">{cake.category}</p>
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

        {/* ================= Category chips ================= */}
        {categoryChips.length > 1 && (
          <div className="flex gap-2 overflow-x-auto cs-hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {categoryChips.map((chip) => {
              const active = category === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setCategory(chip.id)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border-2 transition ${active
                    ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] border-transparent shadow-lg shadow-[#C9A227]/30"
                    : "bg-[#FFFDF9] text-[#8B6914] border-[#E8E0D5] hover:bg-[#FDF8E8] hover:border-[#E8D58A]"
                    }`}
                >
                  <span>{chip.icon}</span>
                  {chip.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-black/10 text-[#2E1B0F]" : "bg-[#FDF8E8] text-[#8B6914]"
                      }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= Toolbar ================= */}
        <div
          ref={gridRef}
          className="scroll-mt-28 mt-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="text-sm font-semibold text-[#8B7355]">
            {filteredCakes.length === 0 ? (
              "No cakes to show"
            ) : (
              <>
                Showing{" "}
                <span className="text-[#8B6914]">
                  {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredCakes.length)}
                </span>{" "}
                of {filteredCakes.length} {filteredCakes.length === 1 ? "cake" : "cakes"}
                {searchQuery.trim() && ` for "${searchQuery}"`}
              </>
            )}
            {filtersActive && (
              <button onClick={clearAll} className="ml-3 text-[#8B6914] hover:text-[#5C3A21] font-bold">
                Clear filters
              </button>
            )}
          </div>

          <label className="inline-flex items-center gap-2 self-start sm:self-auto text-sm font-bold text-[#8B7355]">
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

        {/* ================= Cakes grid ================= */}
        {pagedCakes.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/50 border-2 border-dashed border-[#E8E0D5] py-16 px-6 text-center">
            <div className="text-6xl mb-3 cs-float inline-block">🧁</div>
            {filtersActive ? (
              <>
                <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">
                  {searchQuery.trim() ? `No cakes found for "${searchQuery}"` : "No cakes in this category yet"}
                </h3>
                <p className="text-[#8B7355] mb-6">Try different keywords or another category</p>
                <button
                  onClick={clearAll}
                  className="rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-8 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">No cakes available right now</h3>
                <p className="text-[#8B7355]">Our bakers are busy. Check back soon for new cakes!</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-8">
            {pagedCakes.map((cake) => (
              <CakeCard key={cake._id} cake={cake} />
            ))}
          </div>
        )}

        {/* ================= Pagination ================= */}
        {filteredCakes.length > PAGE_SIZE && (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-center gap-2 sm:gap-3"
          >
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-4 sm:px-5 py-2.5 font-bold text-[#8B6914] hover:bg-[#FDF8E8] hover:border-[#E8D58A] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span aria-hidden>←</span>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="sm:hidden rounded-full bg-[#FFFDF9] border-2 border-[#E8E0D5] px-4 py-2.5 text-sm font-bold text-[#3E2C1C]">
              Page <span className="text-[#8B6914]">{currentPage}</span> of {totalPages}
            </span>

            <div className="hidden sm:flex items-center gap-2">
              {pageNumbers().map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-1 font-bold text-[#8B7355]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`h-11 w-11 rounded-full text-sm font-bold transition ${p === currentPage
                      ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow-lg shadow-[#C9A227]/30"
                      : "bg-[#FFFDF9] border-2 border-[#E8E0D5] text-[#8B6914] hover:bg-[#FDF8E8]"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-4 sm:px-5 py-2.5 font-bold text-[#2E1B0F] shadow-md hover:shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <span className="hidden sm:inline">Next</span>
              <span aria-hidden>→</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

/* ---------- Cake card ---------- */

/* ---------- Cake card with Cart functionality ---------- */
const CakeCard = ({ cake }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [adding, setAdding] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add cakes to your cart");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      return;
    }

    try {
      setAdding(true);

      await dispatch(
        addToCart({
          cakeId: cake._id,
          quantity: 1,
        })
      ).unwrap();

      toast.success(`${cake.name} added to cart!`);
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Unable to add cake to cart. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group relative bg-[#FFFDF9] rounded-2xl sm:rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-1.5 hover:border-[#C9A227]/50 transition-all duration-300 overflow-hidden min-w-0">
      {/* Cake Image */}
      <Link
        to={`/cakes/${cake._id}`}
        className="relative block h-36 sm:h-48 lg:h-64 overflow-hidden bg-[#F5F0E8] p-2 sm:p-4 lg:p-6"
      >
        <div className="w-full h-full flex items-center justify-center">
          {cake.image && !imageFailed ? (
            <img
              src={cake.image}
              alt={cake.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍰
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Category */}
        <span
          className={`absolute top-2 left-2 sm:top-4 sm:left-4 inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border shadow bg-[#FFFDF9]/95 capitalize ${getCategoryColor(cake.category)
            }`}
        >
          {cake.category || "Regular"}
        </span>

        {/* View Details */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <span className="rounded-full bg-[#FFFDF9] px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#8B6914] shadow-lg">
            View Details
          </span>
        </div>
      </Link>

      {/* Cake Information */}
      <div className="p-3 sm:p-4 lg:p-6">
        <Link to={`/cakes/${cake._id}`} className="block min-w-0">
          <h2 className="cs-display text-sm sm:text-lg lg:text-xl font-bold text-[#3E2C1C] mb-1 sm:mb-2 line-clamp-1 hover:text-[#8B6914] transition-colors">
            {cake.name}
          </h2>

          <p className="text-[#8B7355] text-xs sm:text-sm mt-1 mb-3 sm:mb-5 line-clamp-2 min-h-[2rem] sm:min-h-[40px]">
            {cake.description}
          </p>
        </Link>

        {/* Price and Action */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pt-3 sm:pt-4 border-t-2 border-dashed border-[#E8E0D5]">
          <Link to={`/cakes/${cake._id}`} className="min-w-0">
            <p className="text-xs font-semibold text-[#8B7355] mb-0.5">
              Starting from
            </p>

            <div className="cs-display text-lg sm:text-xl lg:text-2xl font-extrabold text-[#3E2C1C]">
              <span className="text-[#8B6914]">₹</span>
              {formatPrice(cake.price)}
            </div>
          </Link>

          {/* Cart button: customers only */}
          {user?.role === "user" ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || cake.isAvailable === false}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#2E1B0F] shadow-md hover:shadow-lg hover:from-[#B8911E] hover:to-[#C9A227] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          ) : !user ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#2E1B0F] shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default Cakes;

