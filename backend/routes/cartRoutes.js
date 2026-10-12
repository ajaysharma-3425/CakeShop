
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

router.get("/", protect, getCart);
router.post("/items", protect, addToCart);
router.patch("/items/:cakeId", protect, updateCartItem);
router.delete("/items/:cakeId", protect, removeCartItem);
router.delete("/", protect, clearCart);

module.exports = router;
