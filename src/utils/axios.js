import axios from 'axios';
const api = axios.create({
  // Use relative base so dev proxy (vite) can forward to backend and cookies are same-origin
  baseURL: '/sse-api',
  withCredentials: true // send/receive SESSION cookie
});

// Add this interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log errors for debugging (don't expose to users here)
    try {
      console.debug('[api] response error', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    } catch (e) {
      // Ignore logging failures
    }
    if (
      error.response &&
      error.response.status === 403 &&
      (typeof error.response.data === 'string' ? error.response.data.includes('expired') : error.response.data?.detail?.includes('expired'))
    ) {
  // Cannot import store here (would create circular dependency). Clear storage and redirect to login.
  localStorage.removeItem('authUser');
  window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
