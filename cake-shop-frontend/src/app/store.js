import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import orderReducer from "../features/orders/orderSlice"
import userReducer from "../features/user/userSlice"
import cakeReducer from "../features/cakes/cakeSlice"
import adminReducer from "../features/admin/adminSlice"
import adminOrderReducer from "../features/admin/adminOrderSlice"
import notificationReducer from "../features/notification/notificationSlice"
import cartReducer from "../features/cart/cartSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    user: userReducer,
    cakes: cakeReducer,
    admin: adminReducer,
    adminOrders: adminOrderReducer,
    notifications: notificationReducer,
    notifications: notificationReducer,
    cart: cartReducer,
  },
});
