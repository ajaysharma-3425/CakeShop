const express = require("express");
const router = express.Router();

const {
  getAllOrdersAdmin,
  updateOrderStatus,
  getOrderByIdAdmin,
  cancelOrderAdmin,
} = require("../controllers/adminOrderController");

const { protect} = require("../middleware/authMiddleware");
const {adminOnly} = require("../middleware/adminMiddleware")


// admin
router.get("/", protect, adminOnly, getAllOrdersAdmin);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/:id", protect, adminOnly, getOrderByIdAdmin);
router.put("/:id/cancel", protect, adminOnly, cancelOrderAdmin);


// router.put("/orders/:id", protect, adminOnly, updateOrderStatus);

module.exports = router;
