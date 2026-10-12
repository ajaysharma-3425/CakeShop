const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// ✅ GET notifications
router.get("/", protect, getNotifications);

// ✅ mark as read
router.put("/:id/read", protect, markAsRead);

module.exports = router;
