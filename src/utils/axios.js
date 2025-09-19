import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:8091/sse-api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add this interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response &&
      error.response.status === 403 &&
      (typeof error.response.data === 'string' ? error.response.data.includes('expired') : error.response.data?.detail?.includes('expired'))
    ) {
      // Cannot import store here (would create circular dependency). Clear storage and redirect to login.
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.replace('/free/login');
    }
    return Promise.reject(error);
  }
);

export default api;
