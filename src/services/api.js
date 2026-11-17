import axios from 'axios';

// Instance untuk backend Express.js (Gemini AI dan operasi server khusus)
export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance untuk JSON Server (Mock database REST API untuk data events, announcements, users)
export const jsonServerApi = axios.create({
  baseURL: import.meta.env?.VITE_JSON_SERVER_URL || '/json-server',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Menyisipkan Auth Bearer Token ke header jika tersimpan
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
