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

const recordsSlice = createSlice({
  name: 'records',
  initialState: {
    records: [],
    totalElements: 0,
    loading: false,
    error: null,
    selectedRecord: null,
    nextRecordNumber: null,
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
      });
  },
});

export default recordsSlice.reducer;