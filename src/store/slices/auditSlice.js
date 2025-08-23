import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export const fetchAuditLogsByPage = createAsyncThunk(
  'audit/fetchAuditLogsByPage',
  async (pageNum, { rejectWithValue }) => {
    try {
      const response = await api.get(`/audit-logs/page/${pageNum}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAuditLogById = createAsyncThunk(
  'audit/fetchAuditLogById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/audit-logs/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const auditSlice = createSlice({
  name: 'audit',
  initialState: {
    logs: [],
    current: null,
    loading: false,
    error: null,
    totalElements: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogsByPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogsByPage.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.auditLogs || [];
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchAuditLogsByPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuditLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchAuditLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default auditSlice.reducer;