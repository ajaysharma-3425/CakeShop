const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderType: {
      type: String,
      enum: ["fixed", "custom", "cart"],
      required: true,
    },

    // fixed cake
    cake: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cake",
    },


    items: [
      {
        cake: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cake",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        messageOnCake: {
          type: String,
          trim: true,
          maxlength: 100,
          default: "",
        },
      },
    ],


    quantity: Number,
    messageOnCake: String,


    // 🔥 NEW FIELDS
    address: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },

    // 🔥 CUSTOM CAKE FIELDS (DIRECT ORDER)
    customDetails: {
      flavor: String,
      weight: String,
      message: String,
      deliveryDate: Date,
      pricePerKg: Number,
      address: String,
      mobile: String,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "ready", "delivered", "cancelled"],
      default: "placed",
    },

    // 🔥 ADD THESE FIELDS
    cancelledBy: {
      type: String,
      enum: ["user", "admin"],
    },

    cancelReason: {
      type: String,
    },

    cancelMessageToUser: {
      type: String,
    },

    paymentMethod: {
      type: String,
      enum: ["dummy", "cod", "online"],
      default: "dummy",
    },

    paymentResult: {
      paymentId: String,
      status: String,
      paidAt: Date,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
