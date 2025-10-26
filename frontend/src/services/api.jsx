import axios from 'axios';

// Vite exposes env vars via import.meta.env and they must be prefixed with VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token');
  // ensure headers object exists
  config.headers = config.headers || {};
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Optional: handle 401 globally (logout)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token expired or invalid — clear local storage to force re-login
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
    }
    return Promise.reject(err);
  }
);

export default api;
