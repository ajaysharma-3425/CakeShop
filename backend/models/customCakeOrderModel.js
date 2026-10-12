const mongoose = require("mongoose");

const customCakeOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weight: {
      type: Number,
      enum: [500, 1000, 2000], // 0.5kg, 1kg, 2kg in grams
      required: true,
    },

    flavor: {
      type: String,
      required: true,
    },

    messageOnCake: {
      type: String,
    },

    occasion: {
      type: String,
    },

    deliveryDate: {
      type: Date,
    },

    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "confirmed", "preparing", "ready", "delivered", "cancelled"],
      default: "draft",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomCakeOrder", customCakeOrderSchema);