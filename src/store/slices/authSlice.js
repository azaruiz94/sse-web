import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const token = localStorage.getItem('authToken');

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('authToken');
      const res = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      // This ensures the error message is passed to the rejected action
      return rejectWithValue(err.message || err.response?.data?.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: token || null,
    loading: false,
    error: null,
    rehydrated: !!token,
    serverDown: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      state.rehydrated = true;
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        state.token = token;
      }
      const user = localStorage.getItem('authUser');
      if (user) {
        state.user = JSON.parse(user);
      }
      state.rehydrated = true;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true; state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // <-- Store the full user object
        state.token = action.payload.token; // <-- Store the token from response
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('authUser', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('authUser', JSON.stringify(action.payload));
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        const errorMsg = action.error?.message || action.payload || '';
        // Check for JWT expired error from backend
        if (
          (typeof action.payload === 'string' && action.payload.includes('expired')) ||
          (typeof action.payload === 'object' && (
            action.payload?.description?.includes('expired') ||
            action.payload?.detail?.includes('expired') ||
            action.payload?.title === 'Forbidden'
          )) ||
          errorMsg.includes('expired')
        ) {
          state.error = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
          state.serverDown = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
          // Optionally: set a flag to trigger redirect in your component
          state.sessionExpired = true;
        } else if (
          errorMsg.includes('ERR_CONNECTION_REFUSED') ||
          errorMsg.includes('Network Error') ||
          errorMsg.includes('Failed to fetch')
        ) {
          state.error = 'No se pudo conectar con el servidor. Por favor, intente más tarde.';
          state.serverDown = true;
        } else {
          state.error = action.payload;
          state.serverDown = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
        }
      });
  },
});

export const { logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
