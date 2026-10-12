import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllOrdersAdmin,
  fetchOrderByIdAdmin,
  updateOrderStatusAdmin,
  cancelOrderAdmin,
} from "../../api/adminOrderApi";

export const getAllOrdersAdmin = createAsyncThunk(
  "admin/orders",
  async (_, thunkAPI) => {
    try {
      const res = await fetchAllOrdersAdmin();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch orders");
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  "admin/orders/status",
  async ({ id, status }, thunkAPI) => {
    try {
      const res = await updateOrderStatusAdmin(id, status);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to update status");
    }
  }
);


export const getOrderByIdAdmin = createAsyncThunk(
  "admin/orderById",
  async (id, thunkAPI) => {
    try {
      const res = await fetchOrderByIdAdmin(id);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch order");
    }
  }
);

export const cancelOrderByAdmin = createAsyncThunk(
  "admin/orders/cancel",
  async ({ id, reason }, thunkAPI) => {
    try {
      const res = await cancelOrderAdmin(id, reason);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Cancel failed"
      );
    }
  }
);




const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    order: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrdersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrderByIdAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderByIdAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrderByAdmin.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });


  },
});

export default adminOrderSlice.reducer;
