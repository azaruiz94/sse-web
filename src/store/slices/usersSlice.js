import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Fetch users (paginated)
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (page = 0, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/page/${page + 1}`);
      return {
        users: res.data.users,
        total: res.data.totalElements,
        page
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/new', userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/update',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.put('/users/edit', userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  'users/search',
  async ({ term, page = 0 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/search/${term}/page/${page + 1}`);
      return { users: res.data.users, total: res.data.totalElements, page };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    total: 0,
    page: 0,
    loading: false,
    error: null,
    selectedUser: null,
    selectedUserLoading: false // <-- Add separate loading for single user
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID (use separate loading state)
      .addCase(fetchUserById.pending, (state) => {
        state.selectedUserLoading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.selectedUserLoading = false;
        state.error = action.payload;
        state.selectedUser = null;
      })

      // Create
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u.id !== action.payload);
        state.total -= 1;
      })

      // Search
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
      });
  }
});

export default usersSlice.reducer;