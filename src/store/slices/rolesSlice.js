import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Fetch roles (paginated)
export const fetchRoles = createAsyncThunk(
  'roles/fetchAll',
  async (page = 0, { rejectWithValue }) => {
    try {
      const res = await api.get(`/roles/page/${page + 1}`);
      return {
        roles: res.data.roles,
        total: res.data.totalElements,
        page
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create role
export const createRole = createAsyncThunk(
  'roles/create',
  async (roleData, { rejectWithValue }) => {
    try {
      const res = await api.post('/roles/new', roleData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// Update role
export const updateRole = createAsyncThunk(
  'roles/update',
  async (roleData, { rejectWithValue }) => {
    try {
      const res = await api.put('/roles/edit', roleData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    list: [],
    total: 0,
    page: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.roles;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createRole.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      })
      // Update
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.list.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  }
});

export default rolesSlice.reducer;