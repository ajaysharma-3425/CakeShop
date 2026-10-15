
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow local frontend and the deployed Vercel frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://cakeshopnew.vercel.app",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const cakeRoutes = require("./routes/cakeRoutes");
app.use("/api/cakes", cakeRoutes);

const adminOrderRoutes = require("./routes/adminOrderRoutes");
app.use("/api/admin/orders", adminOrderRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Cake API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
