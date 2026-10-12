import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import MyOrders from "../pages/MyOrders";
import CustomCake from "../pages/CustomCake";
import AdminDashboard from "../pages/Admin/AdminDashBoard";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import OrderDetail from "../pages/OrderDetail";
import Profile from "../pages/Profile";
import AboutUs from "../components/AboutUs";
import ContactUs from "../components/ContactUs";
import Cakes from "../pages/Cakes";
import CakeDetail from "../pages/CakeDetail";
import AdminCakes from "../pages/Admin/AdminCakes";
import CakeForm from "../pages/Admin/CakeForm";
import AdminOrders from "../pages/Admin/AdminOrders";
import AdminOrderDetails from "../pages/Admin/AdminOrderDetail";
import PaymentPage from "../pages/PaymentPage";
import { Toaster } from "react-hot-toast";
import Footer from "../components/Footer";
import AdminUsers from "../pages/Admin/AdminUsers";
import Cart from "../pages/Cart";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cakes" element={<Cakes />} />
        <Route path="/cakes/:id" element={<CakeDetail />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />


        {/* USER PROTECTED */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute role="user">
              <MyOrders />
            </ProtectedRoute>
          }
        />


        <Route
          path="/cart"
          element={
            <ProtectedRoute role="user">
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route path="/orders/:id" element={<OrderDetail />} />


        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        <Route
          path="/custom-cake"
          element={
            <ProtectedRoute role="user">
              <CustomCake />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PROTECTED */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute role="admin">
              <AdminCakes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute role="admin">
              <CakeForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products/:id"
          element={
            <ProtectedRoute role="admin">
              <CakeForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />


        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />


      </Routes>
      <Footer />
    </BrowserRouter>


  );
};

export default AppRoutes;
