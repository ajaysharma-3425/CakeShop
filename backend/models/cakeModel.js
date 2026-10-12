const mongoose = require("mongoose");

const cakeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number, // fixed price cakes
      required: true,
    },

    image: {
      type: String, // image URL (cloudinary later)
      required: true,
    },

    category: {
      type: String,
      enum: ["birthday", "wedding", "anniversary", "custom","vegan","premium"],
      default: "birthday",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cake", cakeSchema);
