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

// Async thunk for fetching the next record number
export const fetchNextRecordNumber = createAsyncThunk(
  'records/fetchNextRecordNumber',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/records/next-number');
      // Make sure the backend returns { number: ... }
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
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post('/records/search', params);
      return response.data.records || [];
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
    nextRecordNumber: null,
    searchResults: [],
    searchLoading: false,
  },
  reducers: {},
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
      .addCase(fetchNextRecordNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNextRecordNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.nextRecordNumber = action.payload.number;
      })
      .addCase(fetchNextRecordNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.nextRecordNumber = null;
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
        const idx = state.records.findIndex(r => r.id === action.payload.id);
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
      })
      .addCase(searchRecords.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export default recordsSlice.reducer;