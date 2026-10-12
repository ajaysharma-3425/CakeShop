const Order = require("../models/orderModel");
const createNotification = require("../utils/createNotification");

// @desc   Dummy Payment Success
// @route  PUT /api/payment/:orderId
// @access User
exports.makePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("cake", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 security
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔁 prevent double payment
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // ✅ dummy payment success
    order.paymentStatus = "paid";
    order.status = "placed";
    order.paymentMethod = "dummy";

    order.paymentResult = {
      paymentId: `DUMMY_${Date.now()}`,
      status: "success",
      paidAt: new Date(),
    };

    await order.save();


    const orderDescription =
      order.orderType === "fixed"
        ? `"${order.cake?.name || "Cake"}"`
        : order.orderType === "custom"
          ? `custom cake (${order.customDetails?.flavor || "Custom"})`
          : `cart order (${(order.items || [])
            .map((item) => `${item.name} x${item.quantity}`)
            .join(", ")})`;


    /* ==========================
       🔔 USER NOTIFICATION
    ========================== */
    await createNotification({
      user: order.user,
      role: "user",
      title: "Payment Successful 💳",
      message: `Your payment for ${orderDescription} has been received successfully.`,
      type: "payment",
      redirectTo: `/orders/${order._id}`,
    });

    /* ==========================
       🔔 ADMIN NOTIFICATION
    ========================== */
    await createNotification({
      role: "admin",
      title: "Payment Received 💰",
      message: `Payment received for ${orderDescription}. Ready for processing.`,
      type: "payment",
      redirectTo: `/admin/orders/${order._id}`,
    });

    res.status(200).json({
      message: "Payment successful",
      order,
    });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
