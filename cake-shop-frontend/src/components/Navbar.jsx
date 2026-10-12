import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { fetchNotifications, markNotificationRead } from "../features/notification/notificationSlice";
import {
  Home,
  Cake,
  Package,
  User,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  ShoppingCart,
  Settings,
  Users,
  Info,
  Phone,
  Bell,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  fetchCart,
  resetCartState,
} from "../features/cart/cartSlice";

/* ============================================================
   Motion User Menu (Clerk-style morph)
   ============================================================ */
const SPRING = { type: "spring", bounce: 0.15, visualDuration: 0.25 };

const contentAnimations = {
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: { delay: 0.15 } },
  exit: { opacity: 0, filter: "blur(8px)" }
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

function UserAvatar({ initials, large = false }) {
  return (
    <motion.div
      layoutId="nav-user-avatar"
      transition={SPRING}
      className={large ? "nav-user__avatar nav-user__avatar--large" : "nav-user__avatar"}
    >
      {initials}
    </motion.div>
  );
}

function MenuItem({ children, onClick, danger = false }) {
  return (
    <div
      className={`nav-user__menu-item ${danger ? "nav-user__menu-item--danger" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function UserMenuContent({ user, onNavigate, onLogout, onClose }) {
  const initials = getInitials(user.name);
  return (
    <motion.div
      layoutId="nav-user-menu"
      className="nav-user__open"
      style={{ borderRadius: 16 }}
      transition={SPRING}
    >
      <div className="nav-user__menu-header">
        <div style={{ alignSelf: "center" }}>
          <UserAvatar initials={initials} large />
        </div>
        <motion.div
          className="nav-user__menu-header-content"
          initial={contentAnimations.initial}
          animate={contentAnimations.animate}
          exit={contentAnimations.exit}
        >
          <p className="nav-user__name">{user.name}</p>
          <p className="nav-user__email">{user.email}</p>
          <span className={`nav-user__badge ${user.role === "admin" ? "nav-user__badge--admin" : ""}`}>
            {user.role === "admin" ? "Administrator" : "Premium Member"}
          </span>
        </motion.div>
      </div>

      <motion.div
        className="nav-user__menu-content"
        initial={contentAnimations.initial}
        animate={contentAnimations.animate}
        exit={contentAnimations.exit}
      >
        <MenuItem
          onClick={() => {
            onNavigate("/profile");
            onClose();
          }}
        >
          <User className="w-4 h-4" />
          My Profile
        </MenuItem>

        {user.role === "user" && (
          <>
            <MenuItem
              onClick={() => {
                onNavigate("/my-orders");
                onClose();
              }}
            >
              <Package className="w-4 h-4" />
              My Orders
            </MenuItem>
            <MenuItem
              onClick={() => {
                onNavigate("/wishlist");
                onClose();
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Wishlist
            </MenuItem>
          </>
        )}

        <MenuItem
          danger
          onClick={() => {
            onClose();
            onLogout();
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </MenuItem>
      </motion.div>
    </motion.div>
  );
}

function UserMenu({ user, onLogout, pathname }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();

  // Escape closes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Outside click closes
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Route change closes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const initials = getInitials(user.name);

  return (
    <div className="nav-user__root" ref={rootRef}>
      <AnimatePresence initial={false}>
        {!open ? (
          <motion.button
            key="closed"
            layoutId="nav-user-menu"
            className="nav-user__closed"
            style={{ borderRadius: 99 }}
            transition={SPRING}
            onClick={() => setOpen(true)}
            aria-label="Open account menu"
          >
            <UserAvatar initials={initials} />
          </motion.button>
        ) : (
          <UserMenuContent
            key="open"
            user={user}
            onNavigate={(path) => navigate(path)}
            onLogout={onLogout}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Navbar
   ============================================================ */
const Navbar = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const cartCount = new Set(
    cartItems
      .map((item) => item.cake?._id)
      .filter(Boolean)
  ).size;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const notificationRef = useRef(null);

  const { list: notifications = [] } = useSelector(
    (state) => state.notifications || {}
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasNotifications = notifications.length > 0;

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close notification on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setNotificationOpen(false);
  }, [location]);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 15000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === "user") {
      dispatch(fetchCart());
    } else {
      dispatch(resetCartState());
    }
  }, [dispatch, user?.role, user?._id, user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleNotificationClick = (notification) => {
    dispatch(markNotificationRead(notification._id));
    setNotificationOpen(false);
    if (notification.redirectTo) navigate(notification.redirectTo);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getNotificationIconColor = () => {
    if (scrolled) return unreadCount > 0 ? "text-[#B45309]" : "text-[#5D4037]";
    return unreadCount > 0 ? "text-[#FFD58A]" : "text-[#FFF8E7]";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-[#6B4423]" />;
      case "product":
        return <Cake className="w-4 h-4 text-[#B45309]" />;
      case "custom_cake":
        return <Settings className="w-4 h-4 text-[#8B5E3C]" />;
      case "alert":
        return <AlertCircle className="w-4 h-4 text-[#D97706]" />;
      default:
        return <Bell className="w-4 h-4 text-[#8B5E3C]" />;
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-[#5D3A1A] to-[#7B4B2A] text-[#FFF8E7] text-sm py-2 px-4 ">
        <div className="max-w-7xl mx-auto">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="text-xs font-medium">+91 98765 43210</span>
              </div>
              {user && (
                <span className="text-xs text-[#F5E6D3] font-medium truncate max-w-[120px]">
                  Welcome, {user.name.split(" ")[0]}!
                </span>
              )}
            </div>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px] sm:text-xs text-center">
                  Free Delivery on orders above ₹999
                </span>
              </div>
            </div>
          </div>

          {/* Desktop (center-aligned free delivery) */}
          <div className="hidden md:grid grid-cols-3 items-center">
            <div className="flex items-center gap-2 justify-start">
              <Phone className="w-4 h-4" />
              <span className="font-medium whitespace-nowrap">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">Free Delivery on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-4 justify-end">
              {user ? (
                <span className="text-[#F5E6D3] font-medium whitespace-nowrap">
                  Welcome back, {user.name}!
                </span>
              ) : (
                <>
                  <Link to="/login" className="hover:text-white transition-colors whitespace-nowrap">Login</Link>
                  <span className="text-[#BCAAA4]">|</span>
                  <Link to="/register" className="hover:text-white transition-colors whitespace-nowrap">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`sticky top-0 z-[100] py-3 transition-all duration-300 ${scrolled ? "bg-[#FFFDF7] shadow-lg" : "bg-gradient-to-r from-[#6B4423] to-[#8B5E3C]"
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${scrolled ? "bg-[#6B4423]" : "bg-[#FFF8E7]"
                  } group-hover:scale-105`}
              >
                <Cake
                  className={`w-4 h-4 md:w-6 md:h-6 transition-colors duration-300 ${scrolled ? "text-[#FFF8E7]" : "text-[#6B4423]"
                    }`}
                />
              </div>
              <div className="transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="flex flex-col">
                  <h1
                    className={`text-lg md:text-xl lg:text-2xl font-bold tracking-tight ${scrolled ? "text-[#4E342E]" : "text-[#FFF8E7]"
                      }`}
                  >
                    CakeZone
                  </h1>
                  <p className={`text-xs mt-0.5 ${scrolled ? "text-[#8B5E3C]" : "text-[#F5E6D3]"}`}>
                    Sweet Delights, Fresh Every Day
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-4 lg:gap-6">
              {user?.role === "user" && (
                <>
                  <NavLink to="/" icon={Home} scrolled={scrolled} active={isActive("/")}>Home</NavLink>
                  <NavLink to="/cakes" icon={Cake} scrolled={scrolled} active={isActive("/cakes")}>Cakes</NavLink>
                  <NavLink to="/custom-cake" icon={Settings} scrolled={scrolled} active={isActive("/custom-cake")}>Custom</NavLink>
                  <NavLink to="/my-orders" icon={Package} scrolled={scrolled} active={isActive("/my-orders")}>My Orders</NavLink>
                  <NavLink to="/about" icon={Info} scrolled={scrolled} active={isActive("/about")}>About</NavLink>
                  <NavLink to="/contact" icon={Phone} scrolled={scrolled} active={isActive("/contact")}>Contact</NavLink>
                </>
              )}

              {user?.role === "admin" && (
                <div
                  className={`flex items-center gap-1 p-1 rounded-xl transition-colors duration-300 ${scrolled ? "bg-[#F5E6D3]" : "bg-black/15"
                    }`}
                >
                  <AdminNavLink to="/admin/dashboard" icon={Home} scrolled={scrolled} active={isActive("/admin/dashboard")}>Dashboard</AdminNavLink>
                  <AdminNavLink to="/admin/products" icon={Cake} scrolled={scrolled} active={isActive("/admin/products")}>Products</AdminNavLink>
                  <AdminNavLink to="/admin/orders" icon={Package} scrolled={scrolled} active={isActive("/admin/orders")}>Orders</AdminNavLink>
                  <AdminNavLink to="/admin/users" icon={Users} scrolled={scrolled} active={isActive("/admin/users")}>Users</AdminNavLink>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">


              {/* Shopping Cart - Customer Only */}
              {user?.role === "user" && (
                <Link
                  to="/cart"
                  aria-label={`Shopping cart, ${cartCount} items`}
                  className={`relative p-1.5 md:p-2 rounded-lg transition-all duration-200 ${scrolled
                    ? "text-[#5D4037] hover:bg-[#F5E6D3]"
                    : "text-[#FFF8E7] hover:bg-white/20"
                    }`}
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />

                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#B45309] text-white text-[10px] md:text-xs font-bold min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] px-1 rounded-full flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              {user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setNotificationOpen(!notificationOpen);
                      dispatch(fetchNotifications());
                    }}
                    className={`relative p-1.5 md:p-2 rounded-lg transition-all duration-200 ${scrolled ? "hover:bg-[#F5E6D3]" : "hover:bg-white/20"
                      }`}
                    aria-label="Notifications"
                  >
                    <Bell className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-200 ${getNotificationIconColor()}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#B45309] text-white text-[10px] md:text-xs font-bold min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div
                      className="fixed md:absolute right-0 md:right-auto mt-2 w-screen max-w-[95vw] md:w-80 lg:w-96 md:max-w-none bg-[#FFFDF7] rounded-xl shadow-2xl border border-[#E8DCC8] z-50 animate-fadeIn"
                      style={{ left: "50%", transform: "translateX(-50%)", maxWidth: "calc(100vw - 2rem)" }}
                    >
                      <div className="px-4 py-3 border-b border-[#E8DCC8] flex justify-between items-center">
                        <div className="font-semibold text-[#4E342E] flex items-center gap-2">
                          <Bell className="w-5 h-5 text-[#6B4423]" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="bg-[#F5E6D3] text-[#6B4423] text-xs px-2 py-0.5 rounded-full">
                              {unreadCount > 9 ? "9+ new" : `${unreadCount} new`}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-[#8B5E3C] hover:text-[#6B4423] font-medium flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
                        {!hasNotifications ? (
                          <div className="p-6 md:p-8 text-center">
                            <Bell className="w-10 h-10 md:w-12 md:h-12 text-[#D7CCC8] mx-auto mb-3" />
                            <p className="text-[#6B4423] font-medium">No notifications yet</p>
                            <p className="text-sm text-[#8B5E3C] mt-1">We'll notify you when something arrives</p>
                          </div>
                        ) : (
                          <>
                            {notifications.map((n) => (
                              <div
                                key={n._id}
                                onClick={() => handleNotificationClick(n)}
                                className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-[#F5EFE3] last:border-b-0 group ${n.isRead ? "bg-[#FFFDF7] hover:bg-[#FFF8E7]" : "bg-[#FFF4E0] hover:bg-[#F5E6D3]"
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 flex-shrink-0">{getNotificationIcon(n.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${n.isRead ? "text-[#5D4037]" : "text-[#4E342E] font-semibold"}`}>
                                      {n.message}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                      <p className="text-xs text-[#8B5E3C]">
                                        {new Date(n.createdAt).toLocaleString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          day: "numeric",
                                          month: "short"
                                        })}
                                      </p>
                                      <ExternalLink className="w-3 h-3 text-[#BCAAA4] group-hover:text-[#8B5E3C] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                  {!n.isRead && (
                                    <div className="flex-shrink-0 mt-1">
                                      <div className="w-2 h-2 bg-[#D97706] rounded-full animate-pulse" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="p-3 border-t border-[#E8DCC8]">
                              <Link
                                to="/notifications"
                                onClick={() => setNotificationOpen(false)}
                                className="block text-center text-sm text-[#8B5E3C] hover:text-[#6B4423] font-medium py-2 rounded-lg hover:bg-[#FFF8E7] transition-colors"
                              >
                                View All Notifications
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ✨ NEW: Motion User Menu (replaces old profile dropdown) */}
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} pathname={location.pathname} />
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${scrolled ? "text-[#5D4037] hover:text-[#6B4423]" : "text-[#FFF8E7] hover:text-[#6B4423] hover:bg-[#FFF8E7]"
                      }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap ${scrolled ? "bg-[#6B4423] text-[#FFF8E7] hover:bg-[#5D3A1A]" : "bg-[#FFF8E7] text-[#6B4423] hover:bg-[#F5E6D3]"
                      }`}
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-1.5 md:p-2 rounded-lg transition-colors duration-200 ${scrolled ? "text-[#5D4037] hover:bg-[#F5E6D3]" : "text-[#FFF8E7] hover:bg-white/20"
                  }`}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-2 bg-[#FFFDF7] rounded-2xl shadow-2xl border border-[#E8DCC8] p-4 animate-slideDown mx-2">
              <div className="space-y-1">
                {user ? (
                  <>
                    {user.role === "user" && (
                      <>
                        <MobileNavLink to="/" icon={Home} active={isActive("/")} onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                        <MobileNavLink to="/cakes" icon={Cake} active={isActive("/cakes")} onClick={() => setIsMenuOpen(false)}>Cakes</MobileNavLink>
                        <MobileNavLink to="/custom-cake" icon={Settings} active={isActive("/custom-cake")} onClick={() => setIsMenuOpen(false)}>Custom Cake</MobileNavLink>
                        <MobileNavLink to="/my-orders" icon={Package} active={isActive("/my-orders")} onClick={() => setIsMenuOpen(false)}>My Orders</MobileNavLink>
                        <MobileNavLink to="/about" icon={Info} active={isActive("/about")} onClick={() => setIsMenuOpen(false)}>About Us</MobileNavLink>
                        <MobileNavLink to="/contact" icon={Phone} active={isActive("/contact")} onClick={() => setIsMenuOpen(false)}>Contact Us</MobileNavLink>
                      </>
                    )}

                    {user.role === "admin" && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                          Admin Panel
                        </div>
                        <MobileNavLink to="/admin/dashboard" icon={Home} active={isActive("/admin/dashboard")} onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
                        <MobileNavLink to="/admin/products" icon={Cake} active={isActive("/admin/products")} onClick={() => setIsMenuOpen(false)}>Products</MobileNavLink>
                        <MobileNavLink to="/admin/orders" icon={Package} active={isActive("/admin/orders")} onClick={() => setIsMenuOpen(false)}>Orders</MobileNavLink>
                        <MobileNavLink to="/admin/users" icon={Users} active={isActive("/admin/users")} onClick={() => setIsMenuOpen(false)}>Users</MobileNavLink>
                      </>
                    )}

                    <div className="border-t border-[#E8DCC8] pt-3 mt-3">
                      <div className="px-4 py-2 text-xs text-[#8B5E3C] mb-2">
                        Signed in as <span className="font-semibold">{user.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-[#FEF2F2] text-[#B91C1C] transition-colors font-medium"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <MobileNavLink to="/" icon={Home} active={isActive("/")} onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                    <MobileNavLink to="/cakes" icon={Cake} active={isActive("/cakes")} onClick={() => setIsMenuOpen(false)}>Cakes</MobileNavLink>
                    <MobileNavLink to="/about" icon={Info} active={isActive("/about")} onClick={() => setIsMenuOpen(false)}>About Us</MobileNavLink>
                    <MobileNavLink to="/contact" icon={Phone} active={isActive("/contact")} onClick={() => setIsMenuOpen(false)}>Contact Us</MobileNavLink>

                    <div className="border-t border-[#E8DCC8] pt-4 mt-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-3 bg-[#6B4423] text-[#FFF8E7] rounded-lg font-medium hover:bg-[#5D3A1A] transition-colors mb-2"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-3 border-2 border-[#6B4423] text-[#6B4423] rounded-lg font-medium hover:bg-[#FFF8E7] transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Animations + UserMenu Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }

        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #F5E6D3; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #A1887F; border-radius: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #6B4423; }

        /* ============ Motion User Menu ============ */
        .nav-user__root {
          position: relative;
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
        }

        .nav-user__closed {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          padding: 0;
          border: 0;
          overflow: hidden;
          cursor: pointer;
          background-color: transparent;
          box-shadow:
            0 4px 8px -3px rgb(0 0 0 / 0.15),
            0 2px 3px -2px rgb(0 0 0 / 0.1),
            0 0 0 1px rgb(255 255 255 / 0.25);
        }

        .nav-user__avatar,
        .nav-user__avatar--large {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 99px;
          background: linear-gradient(140deg, #6B4423, #A0714A);
          color: #FFF8E7;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          user-select: none;
        }
        .nav-user__avatar--large { font-size: 0.875rem; }

        .nav-user__open {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 40;
          width: 240px;
          padding: 0.125rem;
          overflow: hidden;
          background-color: #FFFDF7;
          background-image: linear-gradient(to bottom, rgb(0 0 0 / 0), rgb(107 68 35 / 0.04));
          box-shadow:
            0 0px 32px -8px rgb(107 68 35 / 0.18),
            0 16px 20px -6px rgb(107 68 35 / 0.12),
            0 6px 7px -6px rgb(0 0 0 / 0.15),
            0 0 0 0.5px rgb(107 68 35 / 0.15);
        }

        .nav-user__menu-header {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
        }
        .nav-user__menu-header-content {
          display: flex;
          flex-direction: column;
          text-align: center;
          align-self: center;
          gap: 0.125rem;
        }
        .nav-user__name {
          font-size: 0.875rem;
          line-height: 1.125rem;
          font-weight: 600;
          color: #4E342E;
          margin: 0;
        }
        .nav-user__email {
          font-size: 0.75rem;
          line-height: 1rem;
          color: #8B5E3C;
          margin: 0;
          word-break: break-all;
        }
        .nav-user__badge {
          display: inline-block;
          margin-top: 0.375rem;
          padding: 0.125rem 0.625rem;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 999px;
          background: #F5E6D3;
          color: #6B4423;
          align-self: center;
        }
        .nav-user__badge--admin {
          background: #6B4423;
          color: #FFF8E7;
        }

        .nav-user__menu-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          padding: 0.25rem;
          border-radius: 1rem;
          background-color: #fff;
          box-shadow:
            inset 0 -1px 2px rgb(0 0 0 / 0.03),
            0 0 0 0.5px rgb(107 68 35 / 0.08);
        }

        .nav-user__menu-item {
          height: 2.25rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0 0.75rem;
          user-select: none;
          font-size: 0.8125rem;
          line-height: 1rem;
          font-weight: 500;
          position: relative;
          overflow: hidden;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #5D4037;
          transition: color 0.15s ease;
        }
        .nav-user__menu-item--danger { color: #B91C1C; }
        .nav-user__menu-item:hover { color: #6B4423; }
        .nav-user__menu-item--danger:hover { color: #991B1B; }
        .nav-user__menu-item::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-color: currentColor;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .nav-user__menu-item:hover::after { opacity: 0.06; }
        .nav-user__menu-item:active::after { opacity: 0.1; }
        .nav-user__menu-item svg { flex-shrink: 0; }
      `}</style>
    </>
  );
};

/* ============================================================
   Reusable Nav Links
   ============================================================ */

// User nav link — cream sliding underline on the active page
// (brown underline once the navbar turns cream on scroll so it stays visible)
// User nav link — sliding dot under the active page
const NavLink = ({ to, icon: Icon, children, scrolled, active }) => (
  <Link
    to={to}
    className={`group relative flex items-center gap-2 font-medium py-1.5 pb-2.5 transition-all duration-200 whitespace-nowrap ${scrolled
      ? active
        ? "text-[#6B4423]"
        : "text-[#5D4037] hover:text-[#6B4423]"
      : active
        ? "text-[#FFF8E7]"
        : "text-[#F5E6D3] hover:text-[#FFF8E7]"
      }`}
  >
    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
    <span className="hidden xl:inline">{children}</span>
    <span className="xl:hidden">{children.split(" ")[0]}</span>

    {/* Hover hint (only for non-active links) */}
    {!active && (
      <span
        className={`pointer-events-none absolute bottom-0.5 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full scale-0 opacity-60 transition-transform duration-200 group-hover:scale-100 ${scrolled ? "bg-[#8B5E3C]" : "bg-[#F5E6D3]"
          }`}
      />
    )}

    {/* Active dot (slides between links) */}
    {active && (
      <motion.span
        layoutId="nav-active-dot"
        transition={SPRING}
        className={`pointer-events-none absolute bottom-0.5 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full ${scrolled
          ? "bg-[#6B4423]"
          : "bg-[#FFD58A] shadow-[0_0_8px_#FFD58A]"
          }`}
      />
    )}
  </Link>
);
// Admin nav link — segmented pill style, active pill slides between items
const AdminNavLink = ({ to, icon: Icon, children, scrolled, active }) => (
  <Link
    to={to}
    className={`relative flex items-center gap-2 font-medium px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${active
      ? scrolled
        ? "text-[#FFF8E7]"
        : "text-[#6B4423]"
      : scrolled
        ? "text-[#5D4037] hover:text-[#6B4423] hover:bg-white/60"
        : "text-[#F5E6D3] hover:text-[#FFF8E7] hover:bg-white/10"
      }`}
  >
    {active && (
      <motion.span
        layoutId="admin-active-pill"
        transition={SPRING}
        className={`absolute inset-0 rounded-lg shadow-md ${scrolled ? "bg-[#6B4423]" : "bg-[#FFF8E7]"
          }`}
      />
    )}
    <Icon className="relative z-10 w-4 h-4 lg:w-5 lg:h-5" />
    <span className="relative z-10 hidden xl:inline">{children}</span>
    <span className="relative z-10 xl:hidden">{children.split(" ")[0]}</span>
  </Link>
);

// Mobile link — active gets cream background + brown left bar
const MobileNavLink = ({ to, icon: Icon, children, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-colors ${active
      ? "bg-[#FFF8E7] text-[#6B4423] font-medium border-[#6B4423]"
      : "border-transparent hover:bg-[#FFF8E7] text-[#5D4037] hover:text-[#6B4423]"
      }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </Link>
);

export default Navbar;