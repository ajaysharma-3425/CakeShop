const express = require("express");
const router = express.Router();

const {
  placeCustomCakeOrder,
  placeFixedCakeOrder,
  placeCartOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,          // 🔥 NEW
  deleteOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

/* =========================
   USER ORDER ROUTES
========================= */

// 🔹 My Orders
router.get("/my", protect, getMyOrders);

// 🔹 Fixed Cake Order
router.post("/fixed", protect, placeFixedCakeOrder);

router.post("/cart", protect, placeCartOrder);

// 🔹 Custom Cake Order
router.post("/custom", protect, placeCustomCakeOrder);

// 🔹 Cancel Order (USER)
router.post("/:id/cancel", protect, cancelOrder);

// Archive a delivered order
router.delete("/:id", protect, deleteOrder);

// 🔹 Order Detail
router.get("/:id", protect, getOrderById);

module.exports = router;
