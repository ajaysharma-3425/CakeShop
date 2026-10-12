import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCakes, deleteCake } from "../../features/cakes/cakeSlice";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  Tag,
  Grid,
  List,
  AlertTriangle,
  Download,
  CheckCircle,
  XCircle,
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
.cs-float { animation: cs-float 4s ease-in-out infinite; }
`;

const AdminCakes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cakes, loading, error } = useSelector((state) => state.cakes);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [failedImages, setFailedImages] = useState({});
  
  // 🆕 Unique Admin Features State
  const [cakeStatus, setCakeStatus] = useState({}); // For Availability toggle
  const [selectedCakes, setSelectedCakes] = useState([]); // For Bulk Actions

  useEffect(() => {
    dispatch(fetchAllCakes());
  }, [dispatch]);

  // Get unique categories
  const categories = ["all", ...new Set(cakes.map((cake) => cake.category?.toLowerCase()))].filter(Boolean);

  // Filter cakes
  const filteredCakes = cakes.filter((cake) => {
    const matchesSearch =
      searchQuery === "" ||
      cake.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cake.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || cake.category?.toLowerCase() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: cakes.length,
    categories: new Set(cakes.map((cake) => cake.category)).size,
    avgPrice:
      cakes.length > 0
        ? Math.round(cakes.reduce((sum, cake) => sum + cake.price, 0) / cakes.length)
        : 0,
    totalValue: cakes.reduce((sum, cake) => sum + cake.price, 0),
    lowStock: cakes.filter(c => c.stock !== undefined && c.stock < 5).length,
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this cake? This action cannot be undone.")) {
      await dispatch(deleteCake(id));
      dispatch(fetchAllCakes());
    }
  };

  const markImageFailed = (id) => setFailedImages((prev) => ({ ...prev, [id]: true }));
  const hasImage = (cake) => cake.image && !failedImages[cake._id];

  // 🆕 Toggle Availability (Simulated local state for UI demonstration)
  const toggleAvailability = (id) => {
    setCakeStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 🆕 Handle Select All for Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCakes(filteredCakes.map(c => c._id));
    } else {
      setSelectedCakes([]);
    }
  };

  const handleSelectCake = (id) => {
    setSelectedCakes(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#FFFDF9] rounded-[1.75rem] p-4 shadow-sm border border-[#E8E0D5]">
                  <div className="h-48 bg-[#F5F0E8] rounded-2xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-5 bg-[#E8E0D5] rounded-full w-3/4"></div>
                    <div className="h-4 bg-[#F5F0E8] rounded-full w-full"></div>
                    <div className="h-4 bg-[#F5F0E8] rounded-full w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="cs-script text-center text-xl text-[#8B6914] mt-8">Fetching your cakes...</p>
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
          <div className="text-6xl mb-3">🍰</div>
          <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">Couldn't load your cakes</h3>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchAllCakes())}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
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
                🎂
              </div>
              <div>
                <p className="cs-script text-xl text-[#E8C84A]">Our sweet shelf</p>
                <h1 className="cs-display text-3xl md:text-4xl font-extrabold">Cake Inventory</h1>
                <p className="text-[#E8E0D5] text-sm mt-0.5 font-semibold">
                  Manage your cake collection, update details, and track inventory
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toast.success("Inventory exported successfully!")}
                className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full bg-[#FDFBF7]/10 px-5 py-3 font-bold text-[#E8C84A] border border-[#C9A227]/30 hover:bg-[#FDFBF7]/20 transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
              <button
                onClick={() => navigate("/admin/products/new")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-6 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5" />
                Add New Cake
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="cs-frosting"></div>

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
        
        {/* 🆕 Low Stock Alert Banner */}
        {stats.lowStock > 0 && (
          <div className="mb-6 bg-[#FDF8E8] border border-[#E8D58A] rounded-2xl p-4 flex items-start sm:items-center gap-3 shadow-sm cs-rise">
            <AlertTriangle className="w-5 h-5 text-[#8B6914] shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="font-bold text-[#8B6914] text-sm">Inventory Alert</p>
              <p className="text-xs font-semibold text-[#8B7355]">
                {stats.lowStock} cake(s) are running low on stock. Please restock soon to avoid missing orders.
              </p>
            </div>
            <button className="text-xs font-bold text-[#8B6914] hover:text-[#5C3A21] underline transition-colors">
              View Low Stock
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox
            label="Total Cakes"
            value={stats.total}
            icon={<Package className="w-5 h-5" />}
            gradient="from-pink-500 to-rose-500"
          />
          <StatBox
            label="Categories"
            value={stats.categories}
            icon={<Tag className="w-5 h-5" />}
            gradient="from-orange-500 to-amber-500"
          />
          <StatBox
            label="Avg. Price"
            value={`₹${stats.avgPrice.toLocaleString("en-IN")}`}
            icon={<TrendingUp className="w-5 h-5" />}
            gradient="from-rose-500 to-pink-600"
          />
          <StatBox
            label="Total Value"
            value={`₹${stats.totalValue.toLocaleString("en-IN")}`}
            icon={<DollarSign className="w-5 h-5" />}
            gradient="from-amber-500 to-orange-500"
          />
        </div>

        {/* Filters and controls */}
        <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] p-4 md:p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cakes by name or description..."
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-[#F5F0E8]/50 border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 transition text-[#3E2C1C] font-semibold placeholder-[#8B7355]/60"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Category filter */}
              <div className="flex-1 lg:flex-none">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-[#F5F0E8]/50 border-2 border-[#E8E0D5] focus:border-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 font-bold text-[#3E2C1C] transition"
                >
                  <option value="all">All Categories</option>
                  {categories
                    .filter((cat) => cat !== "all")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center rounded-full bg-[#F5F0E8] border-2 border-[#E8E0D5] p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className={`h-9 w-10 rounded-full flex items-center justify-center transition ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow"
                      : "text-[#8B6914] hover:bg-[#FFFDF9]"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="List view"
                  className={`h-9 w-10 rounded-full flex items-center justify-center transition ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] shadow"
                      : "text-[#8B6914] hover:bg-[#FFFDF9]"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={() => dispatch(fetchAllCakes())}
                className="h-12 w-12 shrink-0 rounded-full border-2 border-[#E8E0D5] bg-[#FFFDF9] flex items-center justify-center hover:bg-[#F5F0E8] transition"
                title="Refresh list"
              >
                <RefreshCw className="w-5 h-5 text-[#8B6914]" />
              </button>
            </div>
          </div>
        </div>

        {/* Results info & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="text-sm font-semibold text-[#8B7355]">
            Showing <span className="text-[#8B6914]">{filteredCakes.length}</span> of {cakes.length} cakes
            {searchQuery && ` for "${searchQuery}"`}
            {categoryFilter !== "all" && ` in ${categoryFilter}`}
          </div>
          
          {/* 🆕 Bulk Actions Dropdown */}
          {viewMode === "list" && selectedCakes.length > 0 && (
            <div className="flex items-center gap-2 bg-[#FDF8E8] border border-[#E8D58A] px-3 py-1.5 rounded-full text-xs font-bold text-[#8B6914]">
              <span>{selectedCakes.length} selected</span>
              <span className="w-px h-3 bg-[#E8D58A]"></span>
              <button className="hover:text-[#5C3A21] transition-colors">Mark Available</button>
              <span className="w-px h-3 bg-[#E8D58A]"></span>
              <button className="text-red-600 hover:text-red-700 transition-colors">Delete Selected</button>
            </div>
          )}
        </div>

        {/* Cakes grid / list */}
        {filteredCakes.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-[2rem] shadow-lg shadow-[#E8E0D5]/60 border-2 border-dashed border-[#E8E0D5] p-12 text-center">
            <div className="text-6xl mb-3 cs-float">🧁</div>
            <h3 className="cs-display text-2xl font-bold text-[#3E2C1C] mb-2">No Cakes Found</h3>
            <p className="text-[#8B7355] max-w-md mx-auto mb-6">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "No cakes in inventory. Add your first cake to get started!"}
            </p>
            <button
              onClick={() => navigate("/admin/products/new")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4AF37] px-7 py-3 font-bold text-[#2E1B0F] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5" />
              Add First Cake
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCakes.map((cake) => {
              const isAvailable = cakeStatus[cake._id] !== false; // Default true
              return (
                <div
                  key={cake._id}
                  className="group bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] hover:shadow-2xl hover:-translate-y-1 hover:border-[#C9A227]/50 transition-all duration-300 overflow-hidden flex flex-col cs-rise"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-[#F5F0E8] p-4 flex items-center justify-center">
                    {hasImage(cake) ? (
                      <img
                        src={cake.image}
                        alt={cake.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={() => markImageFailed(cake._id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🎂</div>
                    )}
                    
                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 bg-[#FFFDF9]/95 backdrop-blur-sm text-xs font-bold text-[#8B6914] rounded-full shadow capitalize border border-[#E8D58A]">
                      {cake.category || "Regular"}
                    </span>

                    {/* 🆕 Availability Toggle Switch */}
                    <button
                      onClick={() => toggleAvailability(cake._id)}
                      className={`absolute top-3 right-3 h-7 w-12 rounded-full transition-colors duration-300 border-2 shadow-sm flex items-center px-0.5 ${
                        isAvailable ? "bg-[#C9A227] border-[#E8D58A]" : "bg-[#E8E0D5] border-[#E8E0D5]"
                      }`}
                      title={isAvailable ? "Mark Out of Stock" : "Mark Available"}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                          isAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      >
                        {isAvailable ? (
                          <CheckCircle className="w-3 h-3 text-[#C9A227]" />
                        ) : (
                          <XCircle className="w-3 h-3 text-[#8B7355]" />
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-1 line-clamp-1 group-hover:text-[#8B6914] transition-colors">
                      {cake.name}
                    </h3>
                    <p className="text-sm text-[#8B7355] mb-4 line-clamp-2">
                      {cake.description || "Delicious cake description"}
                    </p>

                    <div className="flex items-end justify-between mb-4 mt-auto">
                      <div className="cs-display text-2xl font-extrabold text-[#3E2C1C]">
                        <span className="text-[#8B6914]">₹</span>
                        {cake.price.toLocaleString("en-IN")}
                      </div>
                      <div className="rounded-full bg-[#F5F0E8] border border-[#E8E0D5] px-3 py-1 text-xs font-bold text-[#8B7355]">
                        {cake.weight || "Standard"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t-2 border-dashed border-[#E8E0D5]">
                      <button
                        onClick={() => navigate(`/cakes/${cake._id}`)}
                        className="flex-1 px-3 py-2 text-sm font-bold text-[#8B6914] bg-[#FDF8E8] rounded-full hover:bg-[#E8D58A] transition-colors flex items-center justify-center gap-1.5"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/products/${cake._id}`)}
                        className="flex-1 px-3 py-2 text-sm font-bold text-[#2E1B0F] bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-full shadow hover:shadow-md hover:from-[#B8911E] hover:to-[#C9A227] transition-all flex items-center justify-center gap-1.5"
                        title="Edit Cake"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => deleteHandler(cake._id)}
                        className="flex-1 px-3 py-2 text-sm font-bold text-red-600 bg-[#FFFDF9] border-2 border-red-200 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-1.5"
                        title="Delete Cake"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-[#FFFDF9] rounded-[1.75rem] shadow-lg shadow-[#E8E0D5]/60 border border-[#E8E0D5] overflow-hidden">
            {/* Table header (desktop) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b-2 border-dashed border-[#E8E0D5] bg-[#F5F0E8]/60 text-xs font-bold uppercase tracking-wider text-[#8B7355]">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedCakes.length === filteredCakes.length && filteredCakes.length > 0}
                  className="w-4 h-4 text-[#C9A227] border-[#E8E0D5] rounded focus:ring-[#C9A227] cursor-pointer"
                />
              </div>
              <div className="col-span-2">Image</div>
              <div className="col-span-3">Cake Details</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Actions</div>
            </div>

            <div className="divide-y divide-[#E8E0D5]">
              {filteredCakes.map((cake) => {
                const isAvailable = cakeStatus[cake._id] !== false;
                return (
                  <div key={cake._id} className="p-5 md:px-6 hover:bg-[#F5F0E8]/50 transition-colors duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-4 items-center">
                      {/* Checkbox */}
                      <div className="md:col-span-1 flex items-center">
                        <input 
                          type="checkbox" 
                          checked={selectedCakes.includes(cake._id)}
                          onChange={() => handleSelectCake(cake._id)}
                          className="w-4 h-4 text-[#C9A227] border-[#E8E0D5] rounded focus:ring-[#C9A227] cursor-pointer"
                        />
                      </div>

                      {/* Image */}
                      <div className="md:col-span-2">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-[#FDFBF7] shadow-md bg-[#F5F0E8] p-2 flex items-center justify-center">
                          {hasImage(cake) ? (
                            <img
                              src={cake.image}
                              alt={cake.name}
                              className="w-full h-full object-contain"
                              onError={() => markImageFailed(cake._id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🎂</div>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="md:col-span-3">
                        <h3 className="cs-display font-bold text-[#3E2C1C] mb-1">{cake.name}</h3>
                        <p className="text-sm text-[#8B7355] line-clamp-2">
                          {cake.description || "Delicious cake description"}
                        </p>
                        <div className="text-xs font-semibold text-[#8B7355] mt-1">{cake.flavor || "Standard Flavor"}</div>
                      </div>

                      {/* Category */}
                      <div className="md:col-span-2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#FDF8E8] text-[#8B6914] border border-[#E8D58A] capitalize">
                          {cake.category || "Regular"}
                        </span>
                        {cake.weight && <div className="text-xs font-semibold text-[#8B7355] mt-1">{cake.weight}</div>}
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2">
                        <div className="cs-display text-2xl font-extrabold text-[#3E2C1C]">
                          <span className="text-[#8B6914]">₹</span>
                          {cake.price.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleAvailability(cake._id)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-colors flex items-center gap-1 ${
                              isAvailable 
                                ? "bg-[#FDF8E8] text-[#8B6914] border-[#E8D58A]" 
                                : "bg-[#F5F0E8] text-[#8B7355] border-[#E8E0D5]"
                            }`}
                          >
                            {isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isAvailable ? "Available" : "Out of Stock"}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${cake._id}`)}
                            className="px-3 py-1.5 text-xs font-bold text-[#2E1B0F] bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-full shadow hover:shadow-md hover:from-[#B8911E] hover:to-[#C9A227] transition-all flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteHandler(cake._id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-[#FFFDF9] border border-red-200 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredCakes.length > 0 && (
          <div className="mt-8 pt-4 border-t-2 border-dashed border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm font-semibold text-[#8B7355]">
              Page 1 of 1 • Showing {filteredCakes.length} items
            </div>
            <div className="flex items-center gap-2">
              <button className="px-5 py-2 text-sm font-bold text-[#8B6914] bg-[#FFFDF9] border-2 border-[#E8E0D5] rounded-full hover:bg-[#F5F0E8] transition">
                Previous
              </button>
              <button className="h-10 w-10 text-sm font-bold text-[#2E1B0F] bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-full shadow">
                1
              </button>
              <button className="px-5 py-2 text-sm font-bold text-[#8B6914] bg-[#FFFDF9] border-2 border-[#E8E0D5] rounded-full hover:bg-[#F5F0E8] transition">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- small building block ---------- */

const StatBox = ({ label, value, icon, gradient }) => (
  <div className="relative overflow-hidden bg-[#FFFDF9] rounded-[1.75rem] border border-[#E8E0D5] shadow-lg shadow-[#E8E0D5]/60 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cs-rise">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`}></div>
    <div className="relative flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">{label}</p>
        <p className="cs-display text-2xl md:text-3xl font-extrabold text-[#3E2C1C] truncate">{value}</p>
      </div>
      <div className={`h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminCakes;