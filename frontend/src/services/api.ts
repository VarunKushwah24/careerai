import axios from 'axios';

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string;
    };
  }
}

// Resilient API base URL resolution:
// 1. Checks window.__ENV__ (injected dynamically at container start)
// 2. Checks build-time import.meta.env.VITE_API_URL
// 3. Defaults to localhost for dev or relative /api
function getBaseUrl(): string {
  let url =
    (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.VITE_API_URL) ||
    (import.meta as any).env?.VITE_API_URL ||
    '';

  url = url.trim();

  // If no URL configured:
  if (!url) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:8000/api';
    }
    return '/api';
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // If URL doesn't end with /api, append it automatically
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
}

export const API_BASE_URL = getBaseUrl();
console.log('[CareerAI] Configured Backend Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 if not on login/register pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
