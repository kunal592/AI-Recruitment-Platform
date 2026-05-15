import axios from 'axios';
import toast from 'react-hot-toast';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

/**
 * Axios instance pre-configured for the FastAPI backend.
 *
 * - Base URL comes from VITE_API_URL (no /api prefix — backend routes
 *   are mounted at root: /auth, /jobs, /resume, etc.)
 * - JWT token is automatically attached from localStorage.
 * - 401 responses trigger a Redux logout + redirect.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120_000, // 2 min — generous for AI/automation endpoints
});

// ── Request interceptor: attach JWT ────────────────────────────────────────
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

// ── Response interceptor: global error handling ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Extract the most useful error message from FastAPI's error format
    const message =
      data?.message ||                         // our error_handler format
      data?.detail ||                          // FastAPI HTTPException format
      (Array.isArray(data?.details)            // validation error format
        ? data.details.map((d: any) => d.message).join(', ')
        : null) ||
      error.message ||
      'An unexpected error occurred';

    if (status === 401) {
      store.dispatch(logout());
      toast.error('Session expired. Please log in again.');
    } else if (status === 422) {
      toast.error(`Validation error: ${message}`);
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // Attach parsed message to the error for consumers
    error.parsedMessage = message;
    return Promise.reject(error);
  }
);

export default api;
