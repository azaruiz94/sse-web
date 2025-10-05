import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// token is no longer stored client-side; server sets SESSION cookie

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Server sets SESSION cookie (HttpOnly). Do not expect token in JSON response.
      // Return the full response so UI can inspect twoFaRequired/challengeId
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Confirm 2FA challenge
export const confirmTwoFa = createAsyncThunk(
  'auth/confirmTwoFa',
  async ({ challengeId, code }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/2fa/confirm', { challengeId, code });
      // Backend will set SESSION cookie and return populated LoginResponseDTO (user + expiresIn)
      return res.data;
    } catch (err) {
      try {
        console.debug('[auth] confirmTwoFa error', { url: err.config?.url, status: err.response?.status, data: err.response?.data });
      } catch (e) {}
      const resp = err.response?.data || {};
      const msg = resp.detail || resp.message || resp.properties?.description || err.message;
      return rejectWithValue(msg);
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
      try {
        console.debug('[auth] fetchMe error', { url: err.config?.url, status: err.response?.status, data: err.response?.data });
      } catch (e) {}
      // Provide structured error info so reducers can decide how to surface it
      const status = err.response?.status;
      const data = err.response?.data;
      const message = data?.message || err.message;
      return rejectWithValue({ status, data, message });
    }
  }
);

// Async thunk for resetting password using token
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      // Backend expects { token, password, confirmPassword }
      const res = await api.post('/auth/password/reset', { token, password, confirmPassword });
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
    // pending challenge when twoFaRequired=true
    pendingChallenge: null,
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
    setPendingChallenge: (state, action) => {
      state.pendingChallenge = action.payload;
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
        // action.payload is the LoginResponseDTO; handle twoFaRequired
        const payload = action.payload || {};
        if (payload.twoFaRequired) {
          state.pendingChallenge = {
            challengeId: payload.challengeId,
            twoFaTtlSeconds: payload.twoFaTtlSeconds,
            emailMasked: payload.emailMasked
          };
        } else if (payload.user) {
          state.user = payload.user;
          localStorage.setItem('authUser', JSON.stringify(payload.user));
          state.rehydrated = true;
        }
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
        state.rehydrated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const status = payload.status;
        const errorMsg = action.error?.message || payload.message || '';
        // Check for JWT expired error from backend
        // If the server explicitly says unauthorized/forbidden, treat as unauthenticated
        if (status === 401 || status === 403) {
          state.error = null; // don't show a raw 403/401 on landing
          state.serverDown = false;
          state.user = null;
          localStorage.removeItem('authUser');
          state.rehydrated = true;
        } else if (
          errorMsg.includes('ERR_CONNECTION_REFUSED') ||
          errorMsg.includes('Network Error') ||
          errorMsg.includes('Failed to fetch')
        ) {
          state.error = 'No se pudo conectar con el servidor. Por favor, intente más tarde.';
          state.serverDown = true;
        } else {
          state.error = action.payload || action.error?.message;
          state.serverDown = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('authUser');
          state.rehydrated = true;
        }
        })
        // logoutUser lifecycle
        .addCase(logoutUser.fulfilled, (state) => {
          // On successful logout, clear local user and persisted data
          state.user = null;
          state.pendingChallenge = null;
          state.loading = false;
          state.error = null;
          localStorage.removeItem('authUser');
        })
        .addCase(logoutUser.rejected, (state, action) => {
          // If logout failed, surface error but still clear local user for safety
          state.loading = false;
          state.error = action.payload || action.error?.message;
          state.user = null;
          state.pendingChallenge = null;
          localStorage.removeItem('authUser');
        })
        // confirmTwoFa lifecycle
        .addCase(confirmTwoFa.pending, (state) => {
          state.loading = true; state.error = null;
        })
        .addCase(confirmTwoFa.fulfilled, (state, action) => {
          state.loading = false;
          const payload = action.payload || {};
          if (payload.user) {
            state.user = payload.user;
            localStorage.setItem('authUser', JSON.stringify(payload.user));
          }
          state.pendingChallenge = null;
        })
        .addCase(confirmTwoFa.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message;
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

export const { logout, loadUserFromStorage, setSessionExpired, setPendingChallenge } = authSlice.actions;
export default authSlice.reducer;
