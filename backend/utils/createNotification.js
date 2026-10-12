const Notification = require("../models/Notification");

const createNotification = async ({
  user = null,
  role,
  title,
  message,
  type = "system",
  redirectTo,
  broadcast= false,
}) => {
  try {
    await Notification.create({
      user,
      role,
      title,
      message,
      type,
      redirectTo,
      broadcast,
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = createNotification;
