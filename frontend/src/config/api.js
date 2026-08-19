import axios from 'axios';

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export const getApiBaseUrl = () => {
  // 1. Dynamic Hostname Detection for Network/Livehost (e.g. http://172.19.18.11:3000 or custom domain)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    
    // If accessing via IP or domain, automatically route API calls to port 8000 on the same host
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:8000`;
    }
  }

  // 2. Explicit process.env.REACT_APP_API_URL override if present
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 3. Fallback for localhost development
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }

  return DEFAULT_BACKEND_URL;
};

export const buildApiUrl = (path) => {
  if (!path) return getApiBaseUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

export const getApiHeaders = (token = null, extraHeaders = {}) => {
  const headers = {
    ...extraHeaders,
  };

  const storedToken = token || localStorage.getItem('accessToken');
  if (storedToken) {
    headers.Authorization = `Bearer ${storedToken}`;
  }

  return headers;
};

// Global Axios Response Interceptor to handle 404, 405, 422 HTTP status codes cleanly
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status && [404, 405, 422].includes(status)) {
      console.warn(`[SwipeX API Interceptor] Handled HTTP ${status} gracefully for ${error.config?.url}`);
      return Promise.resolve({
        data: [],
        status: status,
        statusText: 'Handled Gracefully',
        headers: error.response?.headers || {},
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);
