const express = require("express");
const router = express.Router();

const { makePayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.put("/:orderId", protect, makePayment);

module.exports = router;
