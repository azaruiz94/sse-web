import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Fetch states (paginated)
export const fetchStates = createAsyncThunk(
  'states/fetchAll',
  async (page = 0, { rejectWithValue }) => {
    try {
      const res = await api.get(`/states/page/${page + 1}`);
      return {
        states: res.data.states,
        total: res.data.totalElements,
        page
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create state
export const createState = createAsyncThunk(
  'states/create',
  async (stateData, { rejectWithValue }) => {
    try {
      const res = await api.post('/states/new', stateData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const statesSlice = createSlice({
  name: 'states',
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
    .addCase(fetchStates.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchStates.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload.states;
      state.total = action.payload.total;
      state.page = action.payload.page;
    })
    .addCase(fetchStates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Create
    .addCase(createState.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
      state.total += 1;
    });
  }
});

export default statesSlice.reducer;
