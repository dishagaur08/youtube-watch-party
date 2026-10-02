import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
// Ensure baseURL points to /api even if user provides base host without /api
const baseURL = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`) 
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token into requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyntra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('vyntra_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          if (res.data?.data?.token) {
            localStorage.setItem('vyntra_token', res.data.data.token);
            if (res.data.data.refreshToken) {
              localStorage.setItem('vyntra_refresh_token', res.data.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('vyntra_token');
          localStorage.removeItem('vyntra_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
