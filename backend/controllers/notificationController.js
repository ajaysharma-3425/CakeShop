const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const role = req.user.role;

        let filter = {};

        if (role === "admin") {
            filter = { role: "admin" };
        } else {
            filter = {
                role: "user",
                $or: [
                    { user: req.user._id },
                    { broadcast: true },
                ],
            };
        }

        const notifications = await Notification.find(filter).sort({
            createdAt: -1,
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};



// mark as read
exports.markAsRead = async (req, res) => {
    try {
        const role = req.user.role;

        let filter;

        if (role === "admin") {
            filter = { _id: req.params.id, role: "admin" };
        } else {
            filter = {
                _id: req.params.id,
                role: "user",
                $or: [
                    { user: req.user.id },
                    { broadcast: true },
                ],
            };
        }

        const notification = await Notification.findOneAndUpdate(
            filter,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification" });
    }
};
