import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const bypass = import.meta.env.VITE_BYPASS_SECRET;
  if (bypass) {
    config.headers['x-vercel-protection-bypass'] = bypass;
  }
  return config;
});

export default api;
