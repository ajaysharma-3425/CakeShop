import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Eye,
  ShieldPlus,
  ShieldMinus,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Mail,
  CalendarDays,
  Fingerprint,
  Crown,
  SearchX,
} from "lucide-react";
import {
  fetchAllUsersAdmin,
  getUserDetailsAdmin,
  updateUserBlockStatus,
  updateUserRoleAdmin,
  deleteUserAdmin,
} from "../../api/adminApi";

/* ============================================================
   Motion presets
   ============================================================ */
const SPRING = { type: "spring", bounce: 0.18, visualDuration: 0.4 };

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING },
};

const SPRINKLES = [
  { left: "8%", top: "22%", size: 9, color: "#FFD58A", delay: 0, dur: 5 },
  { left: "24%", top: "74%", size: 7, color: "#F5E6D3", delay: 1.1, dur: 6 },
  { left: "46%", top: "30%", size: 8, color: "#D97706", delay: 0.5, dur: 5.5 },
  { left: "63%", top: "72%", size: 10, color: "#FFF8E7", delay: 1.8, dur: 6.4 },
  { left: "80%", top: "26%", size: 7, color: "#FFD58A", delay: 0.8, dur: 5.2 },
  { left: "92%", top: "68%", size: 8, color: "#F5E6D3", delay: 1.4, dur: 5.8 },
];

/* ============================================================
   Small reusable pieces
   ============================================================ */
function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display}</>;
}

function Avatar({ name, size = "md" }) {
  const sizes = {
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-xl",
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B4423] to-[#A0714A] font-bold text-[#FFF8E7] shadow-md ring-2 ring-[#FFF8E7] ${sizes[size]}`}
    >
      {name?.trim()?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        isAdmin
          ? "bg-[#6B4423] text-[#FFF8E7]"
          : "bg-[#F5E6D3] text-[#6B4423]"
      }`}
    >
      {isAdmin && <Crown className="h-3 w-3" />}
      {role || "user"}
    </span>
  );
}

function StatusBadge({ blocked }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        blocked ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {!blocked && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            blocked ? "bg-red-600" : "bg-emerald-600"
          }`}
        />
      </span>
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

function ActionButton({ icon: Icon, children, tone = "brown", ...props }) {
  const tones = {
    brown: "bg-[#6B4423] hover:bg-[#5D3A1A] text-[#FFF8E7]",
    gold: "bg-[#B45309] hover:bg-[#92400E] text-white",
    soft: "bg-[#F5E6D3] hover:bg-[#E8D4B8] text-[#6B4423]",
    danger: "bg-red-700 hover:bg-red-800 text-white",
  };
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={SPRING}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </motion.button>
  );
}

function Modal({ children, onClose, z = 50, maxWidth = "max-w-md", role = "dialog", labelledBy }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-[#2B1A0E]/60 p-4 backdrop-blur-sm"
      style={{ zIndex: z }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-[#E8DCC8] bg-[#FFFDF7] p-6 shadow-2xl sm:p-8 ${maxWidth}`}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={SPRING}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalIcon({ tone, children }) {
  const tones = {
    red: "bg-red-100 text-red-700",
    green: "bg-emerald-100 text-emerald-700",
    gold: "bg-[#F5E6D3] text-[#6B4423]",
  };
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ ...SPRING, delay: 0.1 }}
      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${tones[tone]}`}
    >
      {children}
    </motion.div>
  );
}

function Toast({ type, message, onClose }) {
  const isSuccess = type === "success";
  return (
    <motion.div
      layout
      role={isSuccess ? "status" : "alert"}
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={SPRING}
      className={`mb-4 flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span className="flex items-center gap-2">
        {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {message}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label={isSuccess ? "Dismiss success message" : "Dismiss error message"}
        className="rounded-md p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-4 rounded-2xl bg-[#FFF8E7] p-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
        >
          <div className="h-10 w-10 rounded-full bg-[#E8DCC8]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded-full bg-[#E8DCC8]" />
            <div className="h-3 w-1/2 rounded-full bg-[#F0E4CF]" />
          </div>
          <div className="hidden h-6 w-20 rounded-full bg-[#E8DCC8] sm:block" />
        </motion.div>
      ))}
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "blocked", label: "Blocked" },
  { key: "admin", label: "Admins" },
];

/* ============================================================
   Page
   ============================================================ */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [roleUpdatingUserId, setRoleUpdatingUserId] = useState(null);
  const [roleConfirmUser, setRoleConfirmUser] = useState(null);

  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [confirmUser, setConfirmUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchAllUsersAdmin();
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Users load nahi ho paaye. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.isBlocked !== true).length,
      blocked: users.filter((user) => user.isBlocked === true).length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isBlocked !== true) ||
        (statusFilter === "blocked" && user.isBlocked === true) ||
        (statusFilter === "admin" && user.role === "admin");

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewDetails = async (userId) => {
    try {
      setSelectedUser(null);
      setDetailsError("");
      setDetailsLoading(true);

      const response = await getUserDetailsAdmin(userId);
      setSelectedUser(response.data.user);
    } catch (err) {
      setDetailsError(
        err.response?.data?.message || "User details load nahi ho paayi."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedUser(null);
    setDetailsError("");
  };

  const handleBlockStatusChange = async () => {
    if (!confirmUser || updatingUserId) return;

    const { user, isBlocked } = confirmUser;
    const userId = user._id;

    try {
      setUpdatingUserId(userId);
      setActionMessage("");
      setActionError("");
      setConfirmUser(null);

      const response = await updateUserBlockStatus(userId, isBlocked);

      const updatedUser = response.data.user;

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === userId
            ? { ...item, isBlocked: updatedUser.isBlocked }
            : item
        )
      );

      setSelectedUser((previousUser) =>
        previousUser?._id === userId
          ? { ...previousUser, isBlocked: updatedUser.isBlocked }
          : previousUser
      );

      setActionMessage(
        response.data.message ||
          (isBlocked
            ? "User blocked successfully."
            : "User unblocked successfully.")
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message || "User status update nahi ho paaya."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async () => {
    if (!roleConfirmUser || roleUpdatingUserId) return;

    const { user, role } = roleConfirmUser;

    try {
      setRoleUpdatingUserId(user._id);
      setActionMessage("");
      setActionError("");
      setRoleConfirmUser(null);

      const response = await updateUserRoleAdmin(user._id, role);
      const updatedUser = response.data.user;

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id ? { ...item, role: updatedUser.role } : item
        )
      );

      setSelectedUser((previousUser) =>
        previousUser?._id === user._id
          ? { ...previousUser, role: updatedUser.role }
          : previousUser
      );

      setActionMessage(
        response.data.message || "User role updated successfully."
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update user role."
      );
    } finally {
      setRoleUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser || deletingUserId) return;

    const user = deleteConfirmUser;

    try {
      setDeletingUserId(user._id);
      setActionMessage("");
      setActionError("");
      setDeleteConfirmUser(null);

      const response = await deleteUserAdmin(user._id);

      setUsers((previousUsers) =>
        previousUsers.filter((item) => item._id !== user._id)
      );

      setSelectedUser((previousUser) =>
        previousUser?._id === user._id ? null : previousUser
      );

      setActionMessage(response.data.message || "User deleted successfully.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  /* Row / card action buttons (shared by table and mobile cards) */
  const renderActions = (user) => (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        icon={Eye}
        tone="brown"
        onClick={() => handleViewDetails(user._id)}
      >
        View
      </ActionButton>

      {user.role !== "admin" && (
        <ActionButton
          icon={ShieldPlus}
          tone="gold"
          disabled={roleUpdatingUserId === user._id}
          onClick={() => {
            setActionMessage("");
            setActionError("");
            setRoleConfirmUser({ user, role: "admin" });
          }}
        >
          {roleUpdatingUserId === user._id ? "Updating..." : "Make Admin"}
        </ActionButton>
      )}

      {user.role === "admin" && (
        <ActionButton
          icon={ShieldMinus}
          tone="soft"
          disabled={roleUpdatingUserId === user._id}
          onClick={() => {
            setActionMessage("");
            setActionError("");
            setRoleConfirmUser({ user, role: "user" });
          }}
        >
          {roleUpdatingUserId === user._id ? "Updating..." : "Make User"}
        </ActionButton>
      )}

      {user.role !== "admin" && (
        <ActionButton
          icon={Trash2}
          tone="danger"
          disabled={
            deletingUserId === user._id ||
            updatingUserId === user._id ||
            roleUpdatingUserId === user._id
          }
          onClick={() => {
            setActionMessage("");
            setActionError("");
            setDeleteConfirmUser(user);
          }}
        >
          {deletingUserId === user._id ? "Deleting..." : "Delete"}
        </ActionButton>
      )}
    </div>
  );

  const statCards = [
    {
      label: "Total Users",
      value: stats.total,
      icon: Users,
      iconBox: "bg-[#F5E6D3] text-[#6B4423]",
      valueColor: "text-[#4E342E]",
    },
    {
      label: "Active Users",
      value: stats.active,
      icon: UserCheck,
      iconBox: "bg-emerald-100 text-emerald-700",
      valueColor: "text-emerald-700",
    },
    {
      label: "Blocked Users",
      value: stats.blocked,
      icon: UserX,
      iconBox: "bg-red-100 text-red-700",
      valueColor: "text-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF6EC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#5D3A1A] via-[#6B4423] to-[#8B5E3C] p-6 text-[#FFF8E7] shadow-xl sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {SPRINKLES.map((s, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full opacity-40"
                style={{ left: s.left, top: s.top, width: s.size, height: s.size, backgroundColor: s.color }}
                animate={{ y: [0, -12, 0], x: [0, 5, 0], rotate: [0, 180, 360] }}
                transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FFD58A]/15 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFD58A]"
              >
                <Crown className="h-3.5 w-3.5" />
                Admin Panel
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.18 }}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                All Users
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-sm text-[#F5E6D3]"
              >
                View users and manage their account status.
              </motion.p>
            </div>

            <motion.button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#FFF8E7] px-4 py-2 text-sm font-semibold text-[#6B4423] shadow-md disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="flex items-center gap-4 rounded-2xl border border-[#E8DCC8] bg-[#FFFDF7] p-5 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBox}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#8B5E3C]">{card.label}</p>
                <p className={`text-3xl font-bold ${card.valueColor}`}>
                  {loading ? "..." : <CountUp value={card.value} />}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {actionMessage && (
            <Toast key="success" type="success" message={actionMessage} onClose={() => setActionMessage("")} />
          )}
          {actionError && (
            <Toast key="error" type="error" message={actionError} onClose={() => setActionError("")} />
          )}
        </AnimatePresence>

        {/* Users list */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="rounded-3xl border border-[#E8DCC8] bg-[#FFFDF7] p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#4E342E]">Registered Users</h2>
              <p className="mt-1 text-sm text-[#8B5E3C]">
                Search by name or email and manage account status.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1887F]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search users by name or email"
                className="w-full rounded-xl border border-[#E8DCC8] bg-[#FFF8E7] py-3 pl-11 pr-4 text-sm text-[#4E342E] outline-none transition placeholder:text-[#A1887F] focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#F5E6D3]"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const isOn = statusFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isOn ? "text-[#FFF8E7]" : "text-[#6B4423] hover:bg-[#F5E6D3]"
                  }`}
                >
                  {isOn && (
                    <motion.span
                      layoutId="users-filter-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-[#6B4423] shadow-md"
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-700"
            >
              <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
              <p>{error}</p>
              <button
                type="button"
                onClick={loadUsers}
                className="mt-3 rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800"
              >
                Retry
              </button>
            </motion.div>
          ) : filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5E6D3] text-[#6B4423]"
              >
                <SearchX className="h-8 w-8" />
              </motion.div>
              <p className="text-lg font-semibold text-[#4E342E]">No users found</p>
              <p className="mt-2 text-sm text-[#8B5E3C]">
                {search || statusFilter !== "all"
                  ? "Try a different search or filter."
                  : "Registered users will appear here."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#E8DCC8] bg-[#FFF8E7] text-xs uppercase tracking-wider text-[#8B5E3C]">
                      <th className="rounded-tl-xl px-4 py-4 font-semibold">User</th>
                      <th className="px-4 py-4 font-semibold">Email</th>
                      <th className="px-4 py-4 font-semibold">Role</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="px-4 py-4 font-semibold">Registered On</th>
                      <th className="rounded-tr-xl px-4 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F0E4CF]">
                    <AnimatePresence initial>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ ...SPRING, delay: Math.min(index, 10) * 0.035 }}
                          className="transition-colors hover:bg-[#FFF8E7]"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={user.name} />
                              <span className="font-medium text-[#4E342E]">
                                {user.name || "Unnamed User"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-[#5D4037]">
                            {user.email || "—"}
                          </td>

                          <td className="px-4 py-4">
                            <RoleBadge role={user.role} />
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge blocked={user.isBlocked === true} />
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-[#5D4037]">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="px-4 py-4">{renderActions(user)}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="space-y-3 lg:hidden">
                <AnimatePresence initial>
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ ...SPRING, delay: Math.min(index, 8) * 0.04 }}
                      className="rounded-2xl border border-[#E8DCC8] bg-[#FFF8E7]/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={user.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#4E342E]">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="truncate text-sm text-[#8B5E3C]">
                            {user.email || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <RoleBadge role={user.role} />
                        <StatusBadge blocked={user.isBlocked === true} />
                        <span className="ml-auto flex items-center gap-1 text-xs text-[#8B5E3C]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(user.createdAt)}
                        </span>
                      </div>

                      <div className="mt-4 border-t border-[#E8DCC8] pt-3">
                        {renderActions(user)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <p className="mt-4 text-sm text-[#8B5E3C]">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}
        </motion.div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {(detailsLoading || detailsError || selectedUser) && (
          <Modal
            key="details"
            onClose={closeDetailsModal}
            z={50}
            maxWidth="max-w-lg"
            labelledBy="user-details-title"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="user-details-title" className="text-2xl font-bold text-[#4E342E]">
                User Details
              </h2>

              <button
                type="button"
                onClick={closeDetailsModal}
                aria-label="Close user details"
                className="rounded-lg p-2 text-[#8B5E3C] hover:bg-[#F5E6D3] hover:text-[#4E342E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 text-center text-[#8B5E3C]">
                <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin" />
                Loading user details...
              </div>
            ) : detailsError ? (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {detailsError}
              </div>
            ) : selectedUser ? (
              <motion.div
                variants={listContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <motion.div
                  variants={fadeUp}
                  className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#F5E6D3] to-[#FFF8E7] p-4"
                >
                  <Avatar name={selectedUser.name} size="lg" />

                  <div className="min-w-0">
                    <p className="break-words text-lg font-bold text-[#4E342E]">
                      {selectedUser.name || "Unnamed User"}
                    </p>
                    <p className="flex items-center gap-1.5 break-all text-sm text-[#8B5E3C]">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {selectedUser.email || "No email available"}
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  <div className="flex flex-col gap-1 border-b border-[#F0E4CF] pb-3 sm:flex-row sm:justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-[#8B5E3C]">
                      <Fingerprint className="h-4 w-4" /> User ID
                    </span>
                    <span className="break-all text-sm font-medium text-[#4E342E] sm:max-w-[65%] sm:text-right">
                      {selectedUser._id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#F0E4CF] pb-3">
                    <span className="text-sm text-[#8B5E3C]">Role</span>
                    <RoleBadge role={selectedUser.role} />
                  </div>

                  <div className="flex items-center justify-between border-b border-[#F0E4CF] pb-3">
                    <span className="text-sm text-[#8B5E3C]">Status</span>
                    <StatusBadge blocked={selectedUser.isBlocked === true} />
                  </div>

                  <div className="flex items-center justify-between border-b border-[#F0E4CF] pb-3">
                    <span className="text-sm text-[#8B5E3C]">Registered On</span>
                    <span className="text-sm font-medium text-[#4E342E]">
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>

                  {selectedUser.updatedAt && (
                    <div className="flex items-center justify-between border-b border-[#F0E4CF] pb-3">
                      <span className="text-sm text-[#8B5E3C]">Last Updated</span>
                      <span className="text-sm font-medium text-[#4E342E]">
                        {formatDate(selectedUser.updatedAt)}
                      </span>
                    </div>
                  )}
                </motion.div>

                {selectedUser.role !== "admin" && (
                  <motion.button
                    variants={fadeUp}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    disabled={updatingUserId === selectedUser._id}
                    onClick={() => {
                      setActionMessage("");
                      setActionError("");
                      setConfirmUser({
                        user: selectedUser,
                        isBlocked: selectedUser.isBlocked !== true,
                      });
                    }}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition disabled:opacity-50 ${
                      selectedUser.isBlocked === true
                        ? "bg-emerald-700 hover:bg-emerald-800"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {selectedUser.isBlocked === true ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                    {updatingUserId === selectedUser._id
                      ? "Updating..."
                      : selectedUser.isBlocked === true
                        ? "Unblock User"
                        : "Block User"}
                  </motion.button>
                )}

                <motion.button
                  variants={fadeUp}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={closeDetailsModal}
                  className="w-full rounded-xl bg-[#6B4423] px-4 py-3 font-semibold text-[#FFF8E7] transition hover:bg-[#5D3A1A]"
                >
                  Close
                </motion.button>
              </motion.div>
            ) : null}
          </Modal>
        )}
      </AnimatePresence>

      {/* Block / Unblock Confirmation */}
      <AnimatePresence>
        {confirmUser && (
          <Modal
            key="block-confirm"
            onClose={() => setConfirmUser(null)}
            z={60}
            role="alertdialog"
            labelledBy="confirm-title"
          >
            <ModalIcon tone={confirmUser.isBlocked ? "red" : "green"}>
              {confirmUser.isBlocked ? (
                <Ban className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </ModalIcon>

            <h2 id="confirm-title" className="text-xl font-bold text-[#4E342E]">
              {confirmUser.isBlocked ? "Block this user?" : "Unblock this user?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#5D4037]">
              Are you sure you want to {confirmUser.isBlocked ? "block" : "unblock"}{" "}
              <strong className="text-[#4E342E]">
                {confirmUser.user.name || confirmUser.user.email}
              </strong>
              ?
              {confirmUser.isBlocked
                ? " They will no longer be able to log in or use protected APIs."
                : " They will be able to log in and use protected APIs again."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={updatingUserId !== null}
                onClick={() => setConfirmUser(null)}
                className="flex-1 rounded-xl border border-[#E8DCC8] px-4 py-3 font-semibold text-[#5D4037] hover:bg-[#FFF8E7] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updatingUserId !== null}
                onClick={handleBlockStatusChange}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  confirmUser.isBlocked
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {updatingUserId !== null
                  ? "Please wait..."
                  : confirmUser.isBlocked
                    ? "Yes, Block"
                    : "Yes, Unblock"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Role Change Confirmation */}
      <AnimatePresence>
        {roleConfirmUser && (
          <Modal
            key="role-confirm"
            onClose={() => setRoleConfirmUser(null)}
            z={70}
            role="alertdialog"
          >
            <ModalIcon tone="gold">
              <Crown className="h-6 w-6" />
            </ModalIcon>

            <h2 className="text-xl font-bold text-[#4E342E]">Confirm Role Change</h2>

            <p className="mt-3 text-sm leading-6 text-[#5D4037]">
              Are you sure you want to change{" "}
              <strong>{roleConfirmUser.user.name || roleConfirmUser.user.email}</strong>{" "}
              to the <strong>{roleConfirmUser.role}</strong> role?
            </p>

            {roleConfirmUser.role === "admin" && (
              <p className="mt-2 text-sm text-[#B45309]">
                This user will receive administrator permissions.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={roleUpdatingUserId !== null}
                onClick={() => setRoleConfirmUser(null)}
                className="flex-1 rounded-xl border border-[#E8DCC8] px-4 py-3 font-semibold text-[#5D4037] hover:bg-[#FFF8E7]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={roleUpdatingUserId !== null}
                onClick={handleRoleChange}
                className="flex-1 rounded-xl bg-[#6B4423] px-4 py-3 font-semibold text-[#FFF8E7] hover:bg-[#5D3A1A] disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <Modal
            key="delete-confirm"
            onClose={() => setDeleteConfirmUser(null)}
            z={80}
            role="alertdialog"
            labelledBy="delete-user-title"
          >
            <ModalIcon tone="red">
              <Trash2 className="h-6 w-6" />
            </ModalIcon>

            <h2 id="delete-user-title" className="text-xl font-bold text-[#4E342E]">
              Delete User?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#5D4037]">
              Are you sure you want to delete{" "}
              <strong>{deleteConfirmUser.name || deleteConfirmUser.email}</strong>?
              This action cannot be undone.
            </p>

            <p className="mt-2 text-sm text-red-700">
              The user account will be permanently removed. Existing orders are
              not automatically deleted by this endpoint.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={deletingUserId !== null}
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 rounded-xl border border-[#E8DCC8] px-4 py-3 font-semibold text-[#5D4037] hover:bg-[#FFF8E7] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingUserId !== null}
                onClick={handleDeleteUser}
                className="flex-1 rounded-xl bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deletingUserId !== null ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;