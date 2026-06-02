import axios from 'axios';

// Ưu tiên lấy từ biến môi trường của Render, nếu không có thì dùng localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5245/api';

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