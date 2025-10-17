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

export const uploadResolutionPdf = createAsyncThunk(
  'resolutions/uploadResolutionPdf',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`${API_BASE}/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchResolutionFileUrl = createAsyncThunk(
  'resolutions/fetchResolutionFileUrl',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE}/${id}/file-url`);
      return response.data.url || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Generate resolution (backend will set number, issuedDate and generated flag)
export const generateResolution = createAsyncThunk(
  'resolutions/generateResolution',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE}/${id}/generate`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for searching resolutions
export const searchResolutions = createAsyncThunk(
  'resolutions/searchResolutions',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE}/search`, payload);
      // Assuming response.data.resolutions is the array of found resolutions
      return response.data.resolutions || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
    fileUrl: null,
    searchResults: []
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
      })
      // Upload PDF
      .addCase(uploadResolutionPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResolutionPdf.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update filePath or other state here
      })
      .addCase(uploadResolutionPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch file URL
      .addCase(fetchResolutionFileUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fileUrl = null;
      })
      .addCase(fetchResolutionFileUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.fileUrl = action.payload;
      })
      .addCase(fetchResolutionFileUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fileUrl = null;
      })
      // Generate resolution
      .addCase(generateResolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateResolution.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns updated ResolutionDTO; update current and list
        const updated = action.payload;
        if (updated) {
          state.current = updated;
          const idx = state.list.findIndex(r => r.id === updated.id);
          if (idx !== -1) state.list[idx] = updated;
        }
      })
      .addCase(generateResolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search resolutions
      .addCase(searchResolutions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.searchResults = [];
      })
      .addCase(searchResolutions.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchResolutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export default resolutionsSlice.reducer;