const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // null = admin notification
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["order", "payment", "product","cake", "system"],
            default: "system",
        },
        redirectTo:{
            type:String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        broadcast: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
