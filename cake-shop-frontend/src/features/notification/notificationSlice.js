import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";

// fetch notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Failed to fetch notifications");
    }
  }
);

// mark as read
export const markNotificationRead = createAsyncThunk(
  "notifications/read",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    await api.put(
      `/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return id;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    // 🔥 REAL TIME NOTIFICATION ADD
    pushNotification: (state, action) => {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;

      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const oldIds = state.list.map(n => n._id);
        const newNotifications = action.payload.filter(
          n => !oldIds.includes(n._id)
        );

        // 🔔 USER TOAST (only unread + new)
        newNotifications.forEach(n => {
          if (!n.isRead) {
            toast.success(n.message);
          }
        });

        state.list = action.payload;
        state.loading = false;
      })

      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.list.find(n => n._id === action.payload);
        if (notif) notif.isRead = true;
      });
  },
});

export const { pushNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
