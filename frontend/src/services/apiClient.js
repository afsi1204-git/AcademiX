import axios from 'axios';

const getBaseUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;

  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }

  return '/api';
};

const BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attaches your Auth bearer token if it exists in local storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercepts incoming responses and logs safety flags for debugging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API ALERT] Session expired or unauthorized handshake. Token renewal recommended.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
