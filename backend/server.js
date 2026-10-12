const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// 🔴 VERY IMPORTANT (body parser)

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend exact URL
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

// routes
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

// Cart routes
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

// test
app.get("/", (req, res) => {
  res.send("Cake API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
