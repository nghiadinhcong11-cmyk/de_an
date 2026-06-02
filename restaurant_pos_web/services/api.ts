import axios from 'axios';

// URL Backend mới nhất từ Render
const API_URL = import.meta.env.VITE_API_URL || 'https://restaurant-pos-api-uvcz.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;