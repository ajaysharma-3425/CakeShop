const Order = require("../models/orderModel");
const Cake = require("../models/cakeModel");
const createNotification = require("../utils/createNotification");
const Cart = require("../models/cartModel");

// @desc   Place Order for Ready-made Cake
// @route  POST /api/orders/fixed
// @access User
exports.placeFixedCakeOrder = async (req, res) => {
  try {
    const { cakeId, quantity, message, address, mobile, paymentMethod, paymentStatus, redirectTo } = req.body;

    const cake = await Cake.findById(cakeId);

    if (!cake || !cake.isAvailable) {
      return res.status(404).json({ message: "Cake not available" });
    }
    if (!address || !mobile) {
      return res.status(400).json({ message: "Address & Mobile required" });
    }

    const qty = quantity || 1;
    const totalPrice = cake.price * qty;

    const order = await Order.create({
      user: req.user._id,
      orderType: "fixed",
      cake: cake._id,

      quantity: qty,
      messageOnCake: message || "",

      address,
      mobile,

      totalPrice,
      paymentStatus: "pending",
      paymentMethod,
      orderStatus: "placed",   // ✅ ADD THIS
    });

    // ADMIN
    await createNotification({
      role: "admin",
      title: "New Cake Order 🧁",
      message: `New order: ${cake.name} (Qty: ${qty}) | Payment: ${paymentMethod.toUpperCase()} | Total ₹${totalPrice}`,
      type: "order",
      redirectTo: `/admin/orders/${order._id}`, // 🔥
    });

    // USER
    await createNotification({
      user: req.user._id,
      role: "user",
      title: "Order Placed Successfully 🎂",
      message: `Your order for "${cake.name}" (Qty: ${qty}) has been placed successfully.`,
      type: "order",
      redirectTo: `/orders/${order._id}`,
    });



    res.status(201).json(order);


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc   Get My Orders
// @route  GET /api/orders/my
// @access User
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("cake")
      .populate("items.cake")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cake")
      .populate("items.cake")
      .populate("user", "name email")// only fixed cake

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // user can only see his own order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc   Place Custom Cake Order (DIRECT)
// @route  POST /api/orders/custom
// @access User
exports.placeCustomCakeOrder = async (req, res) => {
  try {
    const { flavor, weight, message, deliveryDate, address, mobile, paymentMethod, redirectTo } = req.body;

    if (!address || !mobile) {
      return res.status(400).json({
        message: "Address and mobile number are required",
      });
    }
    if (!flavor || !weight || !message || !deliveryDate) {
      return res.status(400).json({
        message: "Address and mobile number are required",
      });
    }

    const pricePerKg = 700;
    const kg = weight === "0.5kg" ? 0.5 : weight === "1kg" ? 1 : 2;
    const totalPrice = pricePerKg * kg;

    const order = await Order.create({
      user: req.user._id,
      orderType: "custom",

      customDetails: {
        flavor,
        weight,
        message,
        deliveryDate,
        pricePerKg,
      },

      address,
      mobile,
      totalPrice,
      paymentStatus: "pending",
      paymentMethod,
      orderStatus: "placed",   // ✅ ADD THIS
    });

    // ADMIN
    await createNotification({
      role: "admin",
      title: "New Custom Cake Order 🎨",
      message: `Custom cake: ${flavor} | ${weight} | Delivery: ${deliveryDate} | Payment: ${paymentMethod.toUpperCase()}`,
      type: "order",
      redirectTo: `/admin/orders/${order._id}`,
    });

    // USER
    await createNotification({
      user: req.user._id,     // ❗ fixed
      role: "user",
      title: "Custom Cake Order Placed 🎂",
      message: `Your custom cake (${flavor}, ${weight}) has been placed successfully.`,
      type: "order",
      redirectTo: `/orders/${order._id}`,
    });



    res.status(201).json(order);


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================================
   CANCEL ORDER (USER)
   👉 only if status = placed
================================ */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status !== "placed") {
      return res.status(400).json({
        message: "Order cannot be cancelled now",
      });
    }

    order.status = "cancelled";
    await order.save();

    /* 🔔 USER ko notification */
    await createNotification({
      user: order.user,
      role: "user",
      title: "Order Cancelled",
      message: `You cancelled your order successfully`,
      type: "order",
      redirectTo: `/orders/${order._id}`,
    });

    /* 🔥 ADMIN ko notification (IMPORTANT) */
    await createNotification({
      role: "admin",
      title: "Order Cancelled ❌",
      message: `Order ${order.cake?.name || "Cake"} (#${String(order._id).slice(-6)}) was cancelled by user`,
      type: "order",
      redirectTo: `/admin/orders/${order._id}`,
    });


    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc Archive a delivered order for the logged-in user
// @route DELETE /api/orders/:id
// @access User
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only delivered orders can be archived
    if (order.status !== "delivered") {
      return res.status(400).json({
        message: "Only delivered orders can be archived",
      });
    }

    // Soft delete: preserve the order in the database
    order.status = "deleted";
    await order.save();

    return res.json({
      message: "Order archived successfully",
      order,
    });
  } catch (error) {
    console.error("ARCHIVE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to archive order",
    });
  }
};


/* ==========================================
   PLACE CART ORDER (MULTIPLE FIXED CAKES)
   POST /api/orders/cart
========================================== */
exports.placeCartOrder = async (req, res) => {
  try {
    const {
      address,
      mobile,
      paymentMethod,
      messagesByCake = {},
    } = req.body;

    if (!address?.trim() || !mobile?.trim()) {
      return res.status(400).json({
        message: "Address and mobile number are required",
      });
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      return res.status(400).json({
        message: "Enter a valid 10-digit mobile number",
      });
    }

    const allowedPaymentMethods = ["cod", "online", "dummy"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Select a valid payment method",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.cake");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const cartItem of cart.items) {
      const cake = cartItem.cake;
      const quantity = Number(cartItem.quantity);

      if (!cake || !cake.isAvailable) {
        return res.status(400).json({
          message: "A cake in your cart is no longer available. Please update your cart.",
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: `Invalid quantity for ${cake.name}`,
        });
      }

      const price = Number(cake.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: `Invalid price for ${cake.name}`,
        });
      }

      const messageOnCake = String(
        messagesByCake?.[String(cake._id)] || ""
      )
        .trim()
        .slice(0, 100);

      orderItems.push({
        cake: cake._id,
        name: cake.name,
        image: cake.image || "",
        price,
        quantity,
        messageOnCake,
      });
      totalPrice += price * quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      orderType: "cart",
      items: orderItems,
      address: address.trim(),
      mobile: mobile.trim(),
      totalPrice,
      status: "placed",
      paymentMethod,
      paymentStatus: "pending",
    });

    // Clear the cart only after the order has been created.
    cart.items = [];
    await cart.save();

    const itemSummary = orderItems
      .map((item) => `${item.name} (Qty: ${item.quantity})`)
      .join(", ");

    // Notify admin
    await createNotification({
      role: "admin",
      title: "New Cart Order 🧁",
      message: `New order: ${itemSummary} | Payment: ${paymentMethod.toUpperCase()} | Total ₹${totalPrice}`,
      type: "order",
      redirectTo: `/admin/orders/${order._id}`,
    });

    // Notify customer
    await createNotification({
      user: req.user._id,
      role: "user",
      title: "Cart Order Placed Successfully 🎂",
      message: `Your order containing ${orderItems.length} cake type(s) has been placed. Total: ₹${totalPrice}.`,
      type: "order",
      redirectTo: `/orders/${order._id}`,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("PLACE CART ORDER ERROR:", error);
    return res.status(500).json({
      message: "Unable to place cart order",
    });
  }
};








