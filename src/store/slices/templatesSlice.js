import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// 1. PUT /resoultion-templates/edit
export const editTemplate = createAsyncThunk(
  'templates/editTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await api.put('/resolution-templates/edit', templateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 2. POST /resoultion-templates/new
export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/resolution-templates/new', templateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 3. GET /resoultion-templates/{id}
export const fetchTemplateById = createAsyncThunk(
  'templates/fetchTemplateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/resolution-templates/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 4. GET /resoultion-templates/page/{page_num}
export const fetchTemplatesByPage = createAsyncThunk(
  'templates/fetchTemplatesByPage',
  async (pageNum, { rejectWithValue }) => {
    try {
      const response = await api.get(`/resolution-templates/page/${pageNum}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    totalElements: 0 // <-- add this line
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit
      .addCase(editTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(editTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchTemplateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by page
      .addCase(fetchTemplatesByPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplatesByPage.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.resolutionTemplates || []; // <-- fix here
        state.totalElements = action.payload.totalElements || 0; // <-- fix here
        state.page = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchTemplatesByPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default templatesSlice.reducer;