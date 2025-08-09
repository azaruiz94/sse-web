import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const API_BASE = '/resolutions';

// Thunks
export const createResolution = createAsyncThunk(
  'resolutions/createResolution',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE}/new`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchResolutionById = createAsyncThunk(
  'resolutions/fetchResolutionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchResolutionsByPage = createAsyncThunk(
  'resolutions/fetchResolutionsByPage',
  async (pageId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE}/page/${pageId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateResolution = createAsyncThunk(
  'resolutions/updateResolution',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_BASE}`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const resolutionsSlice = createSlice({
  name: 'resolutions',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    totalElements: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createResolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResolution.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createResolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchResolutionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResolutionById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchResolutionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by Page
      .addCase(fetchResolutionsByPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResolutionsByPage.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.resolutions || [];
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchResolutionsByPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateResolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResolution.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current resolution if it's the one being edited
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
        // Optionally update the list as well
        const idx = state.list.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(updateResolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default resolutionsSlice.reducer;