import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";


export const fetchMyOrders = createAsyncThunk(
    "orders/my",
    async (_, thunkAPI) => {
        try {
            const res = await api.get("/orders/my");
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to fetch orders");
        }
    }
);


export const fetchOrderById = createAsyncThunk(
    "orders/detail",
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;

            const res = await api.get(`/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Failed to load order"
            );
        }
    }
);

export const placeFixedCakeOrder = createAsyncThunk(
    "orders/placeFixed",
    async ({ cakeId, quantity, message, address, mobile, paymentMethod }, thunkAPI) => {

        try {
            const token = thunkAPI.getState().auth.user.token;

            const res = await api.post(
                "/orders/fixed",
                {
                    cakeId,
                    quantity,
                    message,
                    address,
                    mobile,
                    paymentMethod,
                },

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Failed to place order"
            );
        }
    }
);



export const placeCustomCakeOrder = createAsyncThunk(
    "orders/custom",
    async (data, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;

            const res = await api.post("/orders/custom", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Custom cake order failed"
            );
        }
    }
);

export const cancelOrder = createAsyncThunk(
    "orders/cancel",
    async (orderId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;

            const res = await api.post(
                `/orders/${orderId}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data; // updated order
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Order cancel failed"
            );
        }
    }
);





const orderSlice = createSlice({
    name: "orders",
    initialState: {
        customCakes: [],
        orders: [],      // my orders list
        order: null,     // SINGLE order detail ✅ (THIS WAS MISSING)
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // MY ORDERS
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ORDER DETAIL
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.order = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload; // 🔥 THIS LINE FIXES EVERYTHING
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(placeCustomCakeOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(placeCustomCakeOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders.unshift(action.payload);
               
            })
            .addCase(placeCustomCakeOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // PLACE FIXED CAKE ORDER
            .addCase(placeFixedCakeOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(placeFixedCakeOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders.unshift(action.payload); // my orders me add

            })
            .addCase(placeFixedCakeOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // CANCEL ORDER
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;

                // 🔥 single order detail update
                if (state.order && state.order._id === action.payload._id) {
                    state.order = action.payload;
                }

                // 🔥 my orders list update
                state.orders = state.orders.map((order) =>
                    order._id === action.payload._id ? action.payload : order
                );
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });




    },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
