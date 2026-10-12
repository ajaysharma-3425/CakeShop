const Order = require("../models/orderModel");
const createNotification = require("../utils/createNotification");



// @desc   Get All Orders (Admin)
// @route  GET /api/orders
// @access Admin
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("cake")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc   Update Order Status
// @route  PUT /api/orders/:id/status
// @access Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled order is locked",
      });
    }

    if (status === "cancelled") {
      return res.status(400).json({
        message: "Use cancel order action with reason",
      });
    }

    order.status = status;
    await order.save();
    await createNotification({
      user: order.user,
      role: "user",
      title: "Order Status Updated",
      message: `Your order is now ${status}`,
      type: "order",
      redirectTo: `/orders/${order._id}`, // ✅ ADD
    });



    res.json(order);
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};



// @desc   Get Single Order (Admin)
// @route  GET /api/admin/orders/:id
// @access Admin
exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("cake");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc   Cancel Order (Admin)
// @route  PUT /api/admin/orders/:id/cancel
// @access Admin
exports.cancelOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // 1️⃣ validation
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Cancellation reason is required",
      });
    }

    // 2️⃣ find order
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 3️⃣ prevent double cancel
    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Order already cancelled",
      });
    }

    // 4️⃣ update (🔥 IMPORTANT FIX)
    order.status = "cancelled";
    order.cancelReason = reason;
    order.cancelledBy = "admin"; // ✅ FIXED

    await order.save();

    // 5️⃣ success
    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });

    await createNotification({
      user: order.user,
      role: "user",
      title: "Order Cancelled",
      message: `Your order was cancelled. Reason: ${reason}`,
      type: "order",
      redirectTo: `/orders/${order._id}`,
    });

  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


