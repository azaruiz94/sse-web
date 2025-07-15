import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async () => {
    let page = 1;
    let allPermissions = [];
    let total = 0;
    let keepFetching = true;

    while (keepFetching) {
      const response = await api.get(`/permissions/page/${page}`);
      const permissions = response.data.permissions || [];
      total = response.data.totalElements || 0;
      allPermissions = allPermissions.concat(permissions);
      // Stop if we've fetched all permissions
      if (allPermissions.length >= total || permissions.length === 0) {
        keepFetching = false;
      } else {
        page += 1;
      }
    }

    return {
      permissions: allPermissions,
      total,
      page: 1
    };
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState: {
    list: [],
    total: 0,
    page: 1,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.permissions;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default permissionsSlice.reducer;