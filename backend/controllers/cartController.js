
const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Cake = require("../models/cakeModel");

// Format cart response using current cake prices
const buildCartResponse = (cart) => {
  const items = (cart?.items || [])
    .filter((item) => item.cake)
    .map((item) => ({
      cake: item.cake,
      quantity: item.quantity,
      subtotal: item.cake.price * item.quantity,
    }));

  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

const getPopulatedCart = async (cartId) => {
  return Cart.findById(cartId).populate("items.cake");
};

// @desc Get logged-in user's cart
// @route GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.cake");

    return res.status(200).json(buildCartResponse(cart));
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// @desc Add cake to cart
// @route POST /api/cart/items
exports.addToCart = async (req, res) => {
  try {
    const { cakeId } = req.body;
    const quantity = Number(req.body.quantity ?? 1);

    if (!mongoose.isValidObjectId(cakeId)) {
      return res.status(400).json({ message: "Invalid cake ID" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number",
      });
    }

    const cake = await Cake.findById(cakeId);

    if (!cake || !cake.isAvailable) {
      return res.status(404).json({
        message: "This cake is currently unavailable",
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.cake.toString() === cakeId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ cake: cakeId, quantity });
    }

    await cart.save();

    const populatedCart = await getPopulatedCart(cart._id);

    return res.status(200).json({
      message: "Cake added to cart successfully",
      cart: buildCartResponse(populatedCart),
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return res.status(500).json({ message: "Failed to add cake to cart" });
  }
};

// @desc Update a cart item's quantity
// @route PATCH /api/cart/items/:cakeId
exports.updateCartItem = async (req, res) => {
  try {
    const { cakeId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!mongoose.isValidObjectId(cakeId)) {
      return res.status(400).json({ message: "Invalid cake ID" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (entry) => entry.cake.toString() === cakeId
    );

    if (!item) {
      return res.status(404).json({ message: "Cake not found in cart" });
    }

    const cake = await Cake.findById(cakeId);

    if (!cake || !cake.isAvailable) {
      return res.status(404).json({
        message: "This cake is currently unavailable",
      });
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await getPopulatedCart(cart._id);

    return res.status(200).json({
      message: "Cart quantity updated",
      cart: buildCartResponse(populatedCart),
    });
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    return res.status(500).json({
      message: "Failed to update cart quantity",
    });
  }
};

// @desc Remove a cake from cart
// @route DELETE /api/cart/items/:cakeId
exports.removeCartItem = async (req, res) => {
  try {
    const { cakeId } = req.params;

    if (!mongoose.isValidObjectId(cakeId)) {
      return res.status(400).json({ message: "Invalid cake ID" });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.cake.toString() !== cakeId
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({ message: "Cake not found in cart" });
    }

    await cart.save();

    const populatedCart = await getPopulatedCart(cart._id);

    return res.status(200).json({
      message: "Cake removed from cart",
      cart: buildCartResponse(populatedCart),
    });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);
    return res.status(500).json({
      message: "Failed to remove cake from cart",
    });
  }
};

// @desc Clear logged-in user's cart
// @route DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
        cart: { items: [], totalItems: 0, totalPrice: 0 },
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart: { items: [], totalItems: 0, totalPrice: 0 },
    });
  } catch (error) {
    console.error("CLEAR CART ERROR:", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
