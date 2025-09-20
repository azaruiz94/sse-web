import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// token is no longer stored client-side; server sets SESSION cookie

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Server sets SESSION cookie (HttpOnly). Do not expect token in JSON response.
      const res = await api.post('/auth/login', { email, password });
      // Some backends return a `user` object even when token is null; prefer that to avoid an extra request
      if (res.data && res.data.user) {
        return res.data.user;
      }
      // Otherwise fetch authenticated user using cookie
      const me = await api.get('/users/me');
      return me.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      // Rely on SESSION cookie (withCredentials=true) to authenticate
      const res = await api.get('/users/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || err.response?.data?.message);
    }
  }
);

// Async thunk for resetting password using token
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/password/reset', { token, password });
      return res.data;
    } catch (err) {
      // Prefer the backend 'detail' message (e.g. "Reset token expired or used")
      const resp = err.response?.data || {};
      const backendMsg = resp.detail || resp.message || resp.properties?.description;
      return rejectWithValue(backendMsg || err.message || 'Error al restablecer contraseña');
    }
  }
);

// Async thunk to logout and clear server-side SESSION cookie
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Server should clear the SESSION cookie on this endpoint
      const res = await api.post('/auth/logout');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    rehydrated: false,
    serverDown: false,
    sessionExpired: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      // Server should clear the SESSION cookie via logout endpoint; frontend just clears user
      localStorage.removeItem('authUser');
      state.rehydrated = true;
    },
    // Set sessionExpired flag; PrivateRoute reacts to this and performs logout/navigation
    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload === undefined ? true : !!action.payload;
    },
    loadUserFromStorage: (state) => {
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
        // loginUser returns the user object (fetched from /users/me)
        state.user = action.payload;
        localStorage.setItem('authUser', JSON.stringify(action.payload));
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
          localStorage.removeItem('authUser');
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
        }
        })
        // logoutUser lifecycle
        .addCase(logoutUser.fulfilled, (state) => {
          // On successful logout, clear local user and persisted data
          state.user = null;
          state.loading = false;
          state.error = null;
          localStorage.removeItem('authUser');
        })
        .addCase(logoutUser.rejected, (state, action) => {
          // If logout failed, surface error but still clear local user for safety
          state.loading = false;
          state.error = action.payload || action.error?.message;
          state.user = null;
          localStorage.removeItem('authUser');
        })
        // resetPassword lifecycle
        .addCase(resetPassword.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
          // Backend no longer returns token on reset; do not auto-login here.
        })
        .addCase(resetPassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message;
        });
  },
});

export const { logout, loadUserFromStorage, setSessionExpired } = authSlice.actions;
export default authSlice.reducer;
