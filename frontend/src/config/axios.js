import axios from 'axios';

/**
 * Configure global Axios defaults for production & development.
 * Resolves API Base URL from Vite environment variable (VITE_API_BASE_URL).
 * Normalizes trailing slashes and '/api' so all endpoint paths work consistently.
 */
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// In production, default directly to api.newhomedevelopers.in if env var is omitted
if (!apiBaseUrl && import.meta.env.PROD) {
  apiBaseUrl = 'https://api.newhomedevelopers.in';
}

if (apiBaseUrl) {
  // Strip trailing slashes
  apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  // If base URL ends with '/api', strip it because endpoints already prefix with '/api/...'
  if (apiBaseUrl.endsWith('/api')) {
    apiBaseUrl = apiBaseUrl.slice(0, -4);
  }
  axios.defaults.baseURL = apiBaseUrl;
}

// Enable sending cookies across origins (for admin authentication)
axios.defaults.withCredentials = true;

// Request interceptor to attach admin authorization bearer token if present
axios.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
