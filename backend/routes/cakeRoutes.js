const express = require("express");
const router = express.Router();

const {
  createCake,
  getAllCakes,
  getCakeById,
  updateCake,
  deleteCake,
} = require("../controllers/cakeController");

const { protect } = require("../middleware/authMiddleware");
const {adminOnly} = require("../middleware/adminMiddleware")

// Public routes
router.get("/", getAllCakes);
router.get("/:id", getCakeById);

// Admin routes
router.post("/", protect, adminOnly, createCake);
router.put("/:id", protect, adminOnly, updateCake);
router.delete("/:id", protect, adminOnly, deleteCake);

module.exports = router;
