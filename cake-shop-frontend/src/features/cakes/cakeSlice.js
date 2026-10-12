import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// 🔥 GET ALL CAKES
export const fetchAllCakes = createAsyncThunk(
  "cakes/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/cakes");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load cakes"
      );
    }
  }
);

export const fetchCakeById = createAsyncThunk(
  "cakes/detail",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/cakes/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load cake"
      );
    }
  }
);

// ✅ Admin: Create cake
export const createCake = createAsyncThunk(
  "cakes/create",
  async (data, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const res = await api.post("/cakes", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ Admin: Update cake
export const updateCake = createAsyncThunk(
  "cakes/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const res = await api.put(`/cakes/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ Admin: Delete cake
export const deleteCake = createAsyncThunk(
  "cakes/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      await api.delete(`/cakes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);


const cakeSlice = createSlice({
  name: "cakes",
  initialState: {
    cakes: [],
    cake: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCakes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCakes.fulfilled, (state, action) => {
        state.loading = false;
        state.cakes = action.payload;
      })
      .addCase(fetchAllCakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCakeById.pending, (state) => {
        state.loading = true;
        state.cake = null;
      })
      .addCase(fetchCakeById.fulfilled, (state, action) => {
        state.loading = false;
        state.cake = action.payload;
      })
      .addCase(fetchCakeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE
      .addCase(createCake.fulfilled, (state, action) => {
        state.cakes.unshift(action.payload);
      })
       // UPDATE
      .addCase(updateCake.fulfilled, (state, action) => {
        state.cakes = state.cakes.map((cake) =>
          cake._id === action.payload._id ? action.payload : cake
        );
      })

      // DELETE
      .addCase(deleteCake.fulfilled, (state, action) => {
        state.cakes = state.cakes.filter(
          (cake) => cake._id !== action.payload
        );
      });

  },
});

export default cakeSlice.reducer;
