import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on actual authentication failures
    if (error.response?.status === 401) {
      // Check if it's a genuine auth error (token expired/invalid)
      const message = error.response?.data?.message || '';
      if (message.includes('expired') || message.includes('Invalid token') || message.includes('missing')) {
        console.warn('[Auth] Session expired, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // DO NOT auto-logout on 403 - let the UI handle it with toasts
    // 403 can be legitimate business logic (insufficient balance, QR expired, etc.)
    return Promise.reject(error);
  }
);

export default api;
