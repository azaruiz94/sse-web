import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Fetch applicants (paginated)
export const fetchApplicants = createAsyncThunk(
  'applicants/fetchAll',
  async (page = 0, { rejectWithValue }) => {
    try {
      const res = await api.get(`/applicants/page/${page + 1}`);
      return {
        applicants: res.data.applicants,
        total: res.data.totalElements,
        page
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create applicant
export const createApplicant = createAsyncThunk(
  'applicants/create',
  async (applicantData, { rejectWithValue }) => {
    try {
      const res = await api.post('/applicants/new', applicantData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update applicant
export const updateApplicant = createAsyncThunk(
  'applicants/update',
  async (applicantData, { rejectWithValue }) => {
    try {
      const res = await api.put('/applicants/edit', applicantData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete applicant
export const deleteApplicant = createAsyncThunk(
  'applicants/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/applicants/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Search applicant
export const searchApplicants = createAsyncThunk(
  'applicants/search',
  async ({ term, page = 0 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/applicants/search/${term}/page/${page + 1}`);
      return { applicants: res.data.applicants, total: res.data.totalElements, page };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch applicant by ID
export const fetchApplicantById = createAsyncThunk(
  'applicants/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/applicants/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const applicantsSlice = createSlice({
  name: 'applicants',
  initialState: {
    list: [],
    total: 0,
    page: 0,
    loading: false,
    error: null,
    selectedApplicant: null,
    selectedApplicantLoading: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.applicants;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchApplicantById.pending, (state) => {
        state.selectedApplicantLoading = true;
      })
      .addCase(fetchApplicantById.fulfilled, (state, action) => {
        state.selectedApplicantLoading = false;
        state.selectedApplicant = action.payload;
      })
      .addCase(fetchApplicantById.rejected, (state, action) => {
        state.selectedApplicantLoading = false;
        state.selectedApplicant = null;
      })

      // Create
      .addCase(createApplicant.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateApplicant.fulfilled, (state, action) => {
        const index = state.list.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteApplicant.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a.id !== action.payload);
        state.total -= 1;
      })

      // Search
      .addCase(searchApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.applicants;
        state.total = action.payload.total;
        state.page = action.payload.page;
      });
  }
});

export default applicantsSlice.reducer;
