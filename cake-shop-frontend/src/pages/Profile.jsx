import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateProfile } from "../features/user/userSlice";
import {
  User,
  Mail,
  Edit2,
  Save,
  X,
  Loader2,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Package,
  CreditCard,
  Bell,
  Lock,
  Cake,
  Award,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Star
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
`;

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, updateLoading } = useSelector((state) => state.user);


  const isAdmin =
    profile?.role === "admin" ||
    (typeof window !== "undefined" &&
      localStorage.getItem("role") === "admin");


  // Get orders from orders slice
  const { orders: userOrders = [] } = useSelector((state) => state.orders || { orders: [] });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || profile.mobile || "",
        address: profile.address || "",
        city: profile.city || "",
        pincode: profile.pincode || ""
      });
    }
  }, [profile, userOrders]);

  // Calculate total orders (excluding cancelled)
  const getTotalOrders = () => {
    if (userOrders?.length > 0) {
      return userOrders.filter(order =>
        order.status?.toLowerCase() !== 'cancelled'
      ).length;
    }
    return profile?.totalOrders || profile?.orderCount || 0;
  };

  // Calculate total spent (excluding cancelled orders)
  const getTotalSpent = () => {
    if (userOrders?.length > 0) {
      return userOrders
        .filter(order => order.status?.toLowerCase() !== 'cancelled')
        .reduce((total, order) => total + (order.totalPrice || 0), 0);
    }
    return profile?.totalSpent || 0;
  };

  // Calculate average order value
  const getAverageOrderValue = () => {
    const totalOrders = getTotalOrders();
    const totalSpent = getTotalSpent();
    if (totalOrders > 0) {
      return Math.round(totalSpent / totalOrders);
    }
    return 0;
  };

  // Get loyalty points
  const getLoyaltyPoints = () => {
    return profile?.points || profile?.loyaltyPoints ||
      Math.floor(getTotalSpent() / 100);
  };

  // Get membership tier
  const getMembershipTier = () => {
    const totalSpent = getTotalSpent();
    if (totalSpent >= 50000) return "Platinum Member 🏆";
    if (totalSpent >= 20000) return "Gold Member ⭐";
    if (totalSpent >= 5000) return "Silver Member ✨";
    return "Basic Member 👋";
  };

  // Get membership tier color (RESTORED ORIGINAL COLORS)
  const getMembershipColor = () => {
    const totalSpent = getTotalSpent();
    if (totalSpent >= 50000) return "from-purple-600 to-indigo-600";
    if (totalSpent >= 20000) return "from-amber-500 to-yellow-500";
    if (totalSpent >= 5000) return "from-gray-400 to-gray-600";
    return "from-blue-400 to-cyan-400";
  };

  // Calculate membership progress
  const getMembershipProgress = () => {
    const totalSpent = getTotalSpent();
    if (totalSpent >= 50000) return 100;
    if (totalSpent >= 20000) return 75;
    if (totalSpent >= 5000) return 50;
    if (totalSpent >= 1000) return 25;
    return 10;
  };

  // Amount needed for next tier
  const getAmountToNextTier = () => {
    const totalSpent = getTotalSpent();
    if (totalSpent < 5000) return 5000 - totalSpent;
    if (totalSpent < 20000) return 20000 - totalSpent;
    if (totalSpent < 50000) return 50000 - totalSpent;
    return 0;
  };

  // Next tier name
  const getNextTier = () => {
    const totalSpent = getTotalSpent();
    if (totalSpent < 5000) return "Silver";
    if (totalSpent < 20000) return "Gold";
    if (totalSpent < 50000) return "Platinum";
    return "Maximum";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditMode(false);
      setErrors({});
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || profile?.mobile || "",
      address: profile?.address || "",
      city: profile?.city || "",
      pincode: profile?.pincode || ""
    });
    setEditMode(false);
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Available";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Not Available";
    }
  };

  if (loading) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] flex items-center justify-center py-12">
        <style>{shopStyles}</style>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-full animate-ping opacity-20"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[#2E1B0F]" />
            </div>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-[#C9A227] mx-auto mb-3" />
          <p className="text-[#8B7355] font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const totalOrders = getTotalOrders();
  const totalSpent = getTotalSpent();
  const averageOrderValue = getAverageOrderValue();
  const loyaltyPoints = getLoyaltyPoints();
  const membershipTier = getMembershipTier();
  const membershipColor = getMembershipColor();
  const membershipProgress = getMembershipProgress();
  const amountToNextTier = getAmountToNextTier();
  const nextTier = getNextTier();



  if (isAdmin) {
    return (
      <div className="cs-body min-h-screen bg-[#FDFBF7] py-8 px-4 text-[#3E2C1C]">
        <style>{shopStyles}</style>

        <div className="max-w-7xl mx-auto">
          {/* Admin Profile Heading */}
          <div className="text-center mb-10 cs-rise">
            <p className="cs-script text-2xl text-[#8B6914]">
              CakeCraft Management
            </p>

            <h1 className="cs-display text-4xl md:text-5xl font-extrabold mt-2">
              Admin Profile
            </h1>

            <p className="text-[#8B7355] mt-3 max-w-2xl mx-auto">
              Manage your administrator account, access store operations,
              and monitor your CakeCraft management responsibilities.
            </p>
          </div>

          {/* Admin Identity Card */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8E0D5] shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#4A2E1B] to-[#80512F] p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>

                <div className="flex-1">
                  <h2 className="cs-display text-2xl md:text-3xl font-bold text-white">
                    {profile?.name || "Administrator"}
                  </h2>

                  <p className="text-white/90 mt-2 flex items-center gap-2 break-all">
                    <Mail className="w-4 h-4 shrink-0" />
                    {profile?.email || "Email unavailable"}
                  </p>

                  <span className="inline-flex items-center gap-2 mt-3 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-sm font-bold text-white">
                    <Shield className="w-4 h-4" />
                    Administrator
                  </span>
                </div>

                <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/70">
                    Account Created
                  </p>
                  <p className="font-bold text-white mt-1">
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h3 className="cs-display text-xl font-bold mb-6">
                Administrator Account Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#F5F0E8] p-5 rounded-xl border border-[#E8E0D5]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">
                    Full Name
                  </p>
                  <p className="font-bold text-lg">
                    {profile?.name || "Not available"}
                  </p>
                </div>

                <div className="bg-[#F5F0E8] p-5 rounded-xl border border-[#E8E0D5]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">
                    Email Address
                  </p>
                  <p className="font-bold break-all">
                    {profile?.email || "Not available"}
                  </p>
                </div>

                <div className="bg-[#F5F0E8] p-5 rounded-xl border border-[#E8E0D5]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">
                    Account Role
                  </p>
                  <p className="font-bold">Administrator</p>
                </div>

                <div className="bg-[#F5F0E8] p-5 rounded-xl border border-[#E8E0D5]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-2">
                    Account Status
                  </p>
                  <p className="font-bold text-emerald-700">
                    {profile?.isBlocked ? "Blocked" : "Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Quick Access */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8E0D5] shadow-xl p-6 md:p-8">
            <h3 className="cs-display text-2xl font-bold mb-2">
              Administration Center
            </h3>

            <p className="text-[#8B7355] mb-6">
              Quick access to the main areas of your cake store.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/dashboard"
                className="rounded-2xl border border-[#E8E0D5] bg-[#F5F0E8] p-5 hover:border-[#C9A227] hover:shadow-md transition-all"
              >
                <TrendingUp className="w-7 h-7 text-[#8B6914] mb-3" />
                <h4 className="font-bold">Dashboard</h4>
                <p className="text-sm text-[#8B7355] mt-1">
                  View store overview and performance.
                </p>
              </a>

              <a
                href="/admin/cakes"
                className="rounded-2xl border border-[#E8E0D5] bg-[#F5F0E8] p-5 hover:border-[#C9A227] hover:shadow-md transition-all"
              >
                <Cake className="w-7 h-7 text-[#8B6914] mb-3" />
                <h4 className="font-bold">Manage Cakes</h4>
                <p className="text-sm text-[#8B7355] mt-1">
                  Access cake listings and products.
                </p>
              </a>

              <a
                href="/admin/orders"
                className="rounded-2xl border border-[#E8E0D5] bg-[#F5F0E8] p-5 hover:border-[#C9A227] hover:shadow-md transition-all"
              >
                <Package className="w-7 h-7 text-[#8B6914] mb-3" />
                <h4 className="font-bold">Manage Orders</h4>
                <p className="text-sm text-[#8B7355] mt-1">
                  Review customer orders and their status.
                </p>
              </a>

              <a
                href="/admin/users"
                className="rounded-2xl border border-[#E8E0D5] bg-[#F5F0E8] p-5 hover:border-[#C9A227] hover:shadow-md transition-all"
              >
                <User className="w-7 h-7 text-[#8B6914] mb-3" />
                <h4 className="font-bold">Manage Users</h4>
                <p className="text-sm text-[#8B7355] mt-1">
                  Access customer accounts and user management.
                </p>
              </a>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#FDF8E8] border border-[#E8D58A]">
              <p className="font-bold text-[#6B4E16] flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Administrator Access
              </p>
              <p className="text-sm text-[#8B7355] mt-1">
                Use your authorized admin account to manage the store.
                Sensitive operations should remain protected by backend
                authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-body min-h-screen bg-[#FDFBF7] py-8 px-4 text-[#3E2C1C]">
      <style>{shopStyles}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center cs-rise">
          <p className="cs-script text-2xl text-[#8B6914]">Your sweet account</p>
          <h1 className="cs-display text-4xl md:text-5xl font-extrabold text-[#3E2C1C] mb-3 mt-1">
            My Profile
          </h1>
          <p className="text-[#8B7355] text-lg max-w-2xl mx-auto">
            Manage your account information, view order history, and track your membership status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-[#FFFDF9] rounded-3xl shadow-xl shadow-[#E8E0D5]/60 overflow-hidden border border-[#E8E0D5] cs-rise">
              {/* Profile Header with Gradient (RESTORED ORIGINAL TIER COLORS) */}
              <div className={`bg-gradient-to-r ${membershipColor} p-6 md:p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-lg shrink-0">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h2 className="cs-display text-2xl md:text-3xl font-bold text-white mb-1">
                          {profile?.name || "Welcome!"}
                        </h2>
                        <p className="text-white/90 flex items-center gap-2 text-sm font-semibold">
                          <Mail className="w-4 h-4" />
                          {profile?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2 bg-white/20 px-3 py-1 rounded-full w-fit">
                          <Award className="w-4 h-4 text-yellow-300" />
                          <span className="text-xs font-bold text-white">
                            {membershipTier}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shrink-0">
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Member Since</div>
                      <div className="text-base font-bold text-white">
                        {formatDate(profile?.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 md:p-8">
                {!editMode ? (
                  /* VIEW MODE */
                  <div className="space-y-8">
                    {/* Personal Information */}
                    <div>
                      <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FDF8E8] flex items-center justify-center border border-[#E8D58A]">
                          <User className="w-5 h-5 text-[#8B6914]" />
                        </div>
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div className="bg-[#F5F0E8] p-4 rounded-xl border border-[#E8E0D5]">
                            <div className="flex items-center text-[#8B7355] mb-2">
                              <User className="w-4 h-4 mr-2 text-[#C9A227]" />
                              <span className="text-xs font-bold uppercase tracking-wider">Full Name</span>
                            </div>
                            <p className="text-lg font-bold text-[#3E2C1C]">{profile?.name}</p>
                          </div>

                          <div className="bg-[#F5F0E8] p-4 rounded-xl border border-[#E8E0D5]">
                            <div className="flex items-center text-[#8B7355] mb-2">
                              <Mail className="w-4 h-4 mr-2 text-[#C9A227]" />
                              <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
                            </div>
                            <p className="text-lg font-bold text-[#3E2C1C] break-all">{profile?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {profile?.phone && (
                            <div className="bg-[#F5F0E8] p-4 rounded-xl border border-[#E8E0D5]">
                              <div className="flex items-center text-[#8B7355] mb-2">
                                <Phone className="w-4 h-4 mr-2 text-[#C9A227]" />
                                <span className="text-xs font-bold uppercase tracking-wider">Phone Number</span>
                              </div>
                              <p className="text-lg font-bold text-[#3E2C1C]">{profile.phone}</p>
                            </div>
                          )}

                          {profile?.address && (
                            <div className="bg-[#F5F0E8] p-4 rounded-xl border border-[#E8E0D5]">
                              <div className="flex items-center text-[#8B7355] mb-2">
                                <MapPin className="w-4 h-4 mr-2 text-[#C9A227]" />
                                <span className="text-xs font-bold uppercase tracking-wider">Delivery Address</span>
                              </div>
                              <p className="text-lg font-bold text-[#3E2C1C]">{profile.address}</p>
                              {(profile.city || profile.pincode) && (
                                <p className="text-sm font-semibold text-[#8B7355] mt-1">
                                  {[profile.city, profile.pincode].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div>
                      <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FDF8E8] flex items-center justify-center border border-[#E8D58A]">
                          <Shield className="w-5 h-5 text-[#8B6914]" />
                        </div>
                        Account Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#F5F0E8] p-5 rounded-xl border border-[#E8E0D5]">
                          <div className="flex items-center text-[#8B7355] mb-2">
                            <Calendar className="w-4 h-4 mr-2 text-[#C9A227]" />
                            <span className="text-xs font-bold uppercase tracking-wider">Member Since</span>
                          </div>
                          <p className="text-lg font-bold text-[#3E2C1C]">
                            {formatDate(profile?.createdAt)}
                          </p>
                        </div>

                        <div className="bg-[#FDF8E8] p-5 rounded-xl border border-[#E8D58A]">
                          <div className="flex items-center text-[#8B6914] mb-2">
                            <Shield className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">Account Status</span>
                          </div>
                          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-[#FFFDF9] text-[#8B6914] border border-[#E8D58A]">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Verified & Active
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EDIT MODE */
                  <form onSubmit={submitHandler} className="space-y-6">
                    <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-6">
                      Edit Profile Information
                    </h3>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#5C3A21] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#C9A227]" />
                        Full Name *
                      </label>
                      <input
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={`w-full px-4 py-3 bg-[#FFFDF9] border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] ${errors.name ? "border-red-500" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                          }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1 font-semibold">
                          ⚠️ {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#5C3A21] flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#C9A227]" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={`w-full px-4 py-3 bg-[#FFFDF9] border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] ${errors.email ? "border-red-500" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                          }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1 font-semibold">
                          ⚠️ {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#5C3A21] flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#C9A227]" />
                        Phone Number
                      </label>
                      <input
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-4 py-3 bg-[#FFFDF9] border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] ${errors.phone ? "border-red-500" : "border-[#E8E0D5] hover:border-[#C9A227]/50"
                          }`}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center gap-1 font-semibold">
                          ⚠️ {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#5C3A21] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C9A227]" />
                        Delivery Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFFDF9] border-2 border-[#E8E0D5] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] hover:border-[#C9A227]/50 resize-none"
                        placeholder="House no, Street, Area, Landmark"
                        rows="3"
                      />
                    </div>

                    {/* City and Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#5C3A21]">
                          City
                        </label>
                        <input
                          value={formData.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          className="w-full px-4 py-3 bg-[#FFFDF9] border-2 border-[#E8E0D5] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] hover:border-[#C9A227]/50"
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#5C3A21]">
                          Pincode
                        </label>
                        <input
                          value={formData.pincode}
                          onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 bg-[#FFFDF9] border-2 border-[#E8E0D5] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all text-[#3E2C1C] hover:border-[#C9A227]/50"
                          placeholder="6-digit pincode"
                          maxLength="6"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex-1 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold py-3.5 rounded-xl hover:from-[#B8911E] hover:to-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        {updateLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 border-2 border-[#E8E0D5] text-[#8B7355] font-bold py-3.5 rounded-xl hover:bg-[#F5F0E8] focus:outline-none focus:ring-4 focus:ring-[#E8E0D5]/50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Edit Button (View Mode) */}
              {!editMode && (
                <div className="border-t border-[#E8E0D5] p-6 bg-[#FDFBF7]">
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-[#2E1B0F] font-bold rounded-xl hover:from-[#B8911E] hover:to-[#C9A227] focus:outline-none focus:ring-4 focus:ring-[#C9A227]/30 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Profile Information
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats Section */}
            {totalOrders > 0 && (
              <div className="bg-[#FFFDF9] rounded-3xl shadow-xl shadow-[#E8E0D5]/60 p-6 md:p-8 border border-[#E8E0D5] cs-rise">
                <h3 className="cs-display text-xl font-bold text-[#3E2C1C] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8E8] flex items-center justify-center border border-[#E8D58A]">
                    <TrendingUp className="w-5 h-5 text-[#8B6914]" />
                  </div>
                  Order Statistics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-[#F5F0E8] p-6 rounded-2xl border border-[#E8E0D5] relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-pink-100 opacity-50"></div>
                    <div className="relative flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Total Orders</p>
                        <p className="cs-display text-3xl font-extrabold text-[#3E2C1C]">{totalOrders}</p>
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-7 h-7 text-pink-600" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#8B7355] relative">Active and delivered orders</p>
                  </div>

                  <div className="bg-[#F5F0E8] p-6 rounded-2xl border border-[#E8E0D5] relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-100 opacity-50"></div>
                    <div className="relative flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Total Spent</p>
                        <p className="cs-display text-3xl font-extrabold text-[#3E2C1C]">
                          ₹{totalSpent.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Wallet className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#8B7355] relative">Excluding cancelled orders</p>
                  </div>

                  <div className="bg-[#F5F0E8] p-6 rounded-2xl border border-[#E8E0D5] relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-100 opacity-50"></div>
                    <div className="relative flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Avg. Order Value</p>
                        <p className="cs-display text-3xl font-extrabold text-[#3E2C1C]">
                          ₹{averageOrderValue.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <CreditCard className="w-7 h-7 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#8B7355] relative">Per successful order</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-8">
            {/* Loyalty Points Card */}
            <div className="bg-gradient-to-br from-[#4A2E1B] to-[#2E1B0F] rounded-3xl shadow-xl shadow-[#C9A227]/20 p-6 text-[#FDFBF7] overflow-hidden relative cs-rise">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A227]/10 rounded-full transform translate-x-12 -translate-y-12"></div>
              <div className="relative z-10">
                <h3 className="cs-display text-xl font-bold mb-4 flex items-center gap-3">
                  <Star className="w-6 h-6 text-[#E8C84A]" />
                  Loyalty Points
                </h3>
                <div className="text-center mb-4">
                  <div className="cs-display text-5xl font-extrabold mb-2 text-[#E8C84A]">{loyaltyPoints}</div>
                  <p className="text-[#E8E0D5] font-semibold text-sm">Points Earned</p>
                </div>
                <div className="text-xs font-semibold text-[#E8E0D5] bg-[#FDFBF7]/10 p-3 rounded-xl border border-[#FDFBF7]/20">
                  🎁 Redeem points for discounts on future orders
                </div>
              </div>
            </div>

            {/* Membership Progress Card */}
            <div className="bg-[#FFFDF9] rounded-3xl shadow-xl shadow-[#E8E0D5]/60 p-6 border border-[#E8E0D5] cs-rise">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-4">
                Membership Progress
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-[#8B7355]">Current Tier</span>
                    <span className="text-[#8B6914]">{membershipTier}</span>
                  </div>

                  <div className="w-full bg-[#F5F0E8] rounded-full h-3 border border-[#E8E0D5]">
                    <div
                      className="bg-gradient-to-r from-[#C9A227] to-[#D4AF37] h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${membershipProgress}%` }}
                    ></div>
                  </div>
                </div>

                {amountToNextTier > 0 ? (
                  <div className="bg-[#F5F0E8] p-4 rounded-xl border border-[#E8E0D5]">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8B7355] mb-1">Next Tier: {nextTier}</div>
                    <div className="flex items-center justify-between">
                      <div className="cs-display text-lg font-extrabold text-[#3E2C1C]">
                        ₹{amountToNextTier.toLocaleString('en-IN')}
                      </div>
                      <span className="text-xs font-bold text-[#8B7355]">more to go</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FDF8E8] p-4 rounded-xl border border-[#E8D58A]">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#8B6914]" />
                      <span className="font-bold text-[#8B6914]">🏆 Maximum Tier Reached!</span>
                    </div>
                    <p className="text-xs font-semibold text-[#8B7355] mt-1">
                      You're our top valued customer
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#FFFDF9] rounded-3xl shadow-xl shadow-[#E8E0D5]/60 p-6 border border-[#E8E0D5] cs-rise">
              <h3 className="cs-display text-lg font-bold text-[#3E2C1C] mb-6">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button className="w-full text-left p-4 hover:bg-[#F5F0E8] rounded-xl transition-all duration-200 flex items-center group border-2 border-transparent hover:border-[#E8E0D5]">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shrink-0">
                    <Lock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2C1C] text-sm">Change Password</div>
                    <div className="text-xs font-semibold text-[#8B7355]">Update your account security</div>
                  </div>
                </button>

                <button className="w-full text-left p-4 hover:bg-[#F5F0E8] rounded-xl transition-all duration-200 flex items-center group border-2 border-transparent hover:border-[#E8E0D5]">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2C1C] text-sm">Notifications</div>
                    <div className="text-xs font-semibold text-[#8B7355]">Manage your alerts</div>
                  </div>
                </button>

                <button className="w-full text-left p-4 hover:bg-[#F5F0E8] rounded-xl transition-all duration-200 flex items-center group border-2 border-transparent hover:border-[#E8E0D5]">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shrink-0">
                    <Cake className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2C1C] text-sm">My Orders</div>
                    <div className="text-xs font-semibold text-[#8B7355]">View order history</div>
                  </div>
                </button>

                <button className="w-full text-left p-4 hover:bg-[#F5F0E8] rounded-xl transition-all duration-200 flex items-center group border-2 border-transparent hover:border-[#E8E0D5]">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shrink-0">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2C1C] text-sm">Payment Methods</div>
                    <div className="text-xs font-semibold text-[#8B7355]">Manage saved cards</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;