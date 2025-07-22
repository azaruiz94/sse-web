import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Fetch dependencies (paginated)
export const fetchDependencies = createAsyncThunk(
  'dependencies/fetchAll',
  async (page = 0, { rejectWithValue }) => {
    try {
      const res = await api.get(`/dependencies/page/${page + 1}`);
      return {
        dependencies: res.data.dependencies,
        total: res.data.totalElements,
        page
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch dependency by ID
export const fetchDependencyById = createAsyncThunk(
  'dependencies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/dependencies/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create dependency
export const createDependency = createAsyncThunk(
  'dependencies/create',
  async (dependencyData, { rejectWithValue }) => {
    try {
      const res = await api.post('/dependencies/new', dependencyData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const dependenciesSlice = createSlice({
  name: 'dependencies',
  initialState: {
    list: [],
    total: 0,
    page: 0,
    loading: false,
    error: null,
    selectedDependency: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchDependencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDependencies.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.dependencies;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchDependencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchDependencyById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDependency = null;
      })
      .addCase(fetchDependencyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDependency = action.payload;
      })
      .addCase(fetchDependencyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedDependency = null;
      })

      // Create
      .addCase(createDependency.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      });
  }
});

export default dependenciesSlice.reducer;