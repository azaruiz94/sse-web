import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Async thunk for creating a record
export const createRecord = createAsyncThunk(
  'records/createRecord',
  async (recordData, { rejectWithValue }) => {
    try {
      const response = await api.post('/records/new', recordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching records by page
export const fetchRecordsByPage = createAsyncThunk(
  'records/fetchRecordsByPage',
  async (pageNum, { rejectWithValue }) => {
    try {
      const response = await api.get(`/records/page/${pageNum}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching a single record by id
export const fetchRecordById = createAsyncThunk(
  'records/fetchRecordById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/records/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for forwarding a record
export const forwardRecord = createAsyncThunk(
  'records/forwardRecord',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put('/records/forward', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for searching records
export const searchRecords = createAsyncThunk(
  'records/searchRecords',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/records/search', payload);
      return response.data.records || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching a record's file URL
export const fetchRecordFileUrl = createAsyncThunk(
  'records/fetchRecordFileUrl',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/records/${id}/file-url`);
      return response.data.url;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for uploading a record PDF
export const uploadRecordPdf = createAsyncThunk(
  'records/uploadRecordPdf',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/records/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const recordsSlice = createSlice({
  name: 'records',
  initialState: {
    records: [],
    totalElements: 0,
    loading: false,
    error: null,
    selectedRecord: null,
    // server assigns number and created date
    searchResults: [],
    searchLoading: false,
    fileUrl: null,
  },
  reducers: {
    clearFileUrl: (state) => {
      state.fileUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.push(action.payload);
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecordsByPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecordsByPage.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchRecordsByPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedRecord = null;
      })
      .addCase(fetchRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRecord = action.payload;
      })
      .addCase(fetchRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedRecord = null;
      })
      
      .addCase(forwardRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forwardRecord.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update selectedRecord if the backend returns the updated record
        state.selectedRecord = action.payload;
        // Optionally update the record in the records list
        const idx = state.records.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.records[idx] = action.payload;
        }
      })
      .addCase(forwardRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchRecords.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
        state.searchResults = [];
      })
      .addCase(searchRecords.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
        state.totalElements = action.payload.length;
      })
      .addCase(searchRecords.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      })
      .addCase(fetchRecordFileUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fileUrl = null;
      })
      .addCase(fetchRecordFileUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.fileUrl = action.payload.url || action.payload;
      })
      .addCase(fetchRecordFileUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fileUrl = null;
      })
      .addCase(uploadRecordPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadRecordPdf.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update filePath or other state here
      })
      .addCase(uploadRecordPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFileUrl } = recordsSlice.actions;
export default recordsSlice.reducer;