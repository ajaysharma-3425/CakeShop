const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserBlockStatus,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");

router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserDetails);

router.patch(
  "/users/:id/block",
  protect,
  adminOnly,
  updateUserBlockStatus
);

router.patch(
  "/users/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;