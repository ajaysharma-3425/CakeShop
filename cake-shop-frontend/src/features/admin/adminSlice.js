import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAdminStats } from "../../api/adminApi";

export const getAdminStats = createAsyncThunk(
  "admin/stats",
  async (_, thunkAPI) => {
    try {
      const res = await fetchAdminStats();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to load admin stats");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
