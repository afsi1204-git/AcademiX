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
    const config = error.config || {};

    if (error.response) {
      if (error.response.status === 401) {
        console.warn('[API ALERT] Session expired or unauthorized handshake. Token renewal recommended.');
      }

      // If backend returned a 404 for an auth route, some deployments serve the SPA
      // at the root and the API is available under `/api`. Retry automatically
      // once by prefixing the request with the origin + `/api` to fix routing
      // mismatches on hosting platforms.
      if (
        error.response.status === 404 &&
        !config.__retried_with_api_prefix &&
        config.url &&
        (config.url.startsWith('/auth') || config.url.indexOf('/auth') !== -1)
      ) {
        config.__retried_with_api_prefix = true;
        const retryBase = window.location.origin.replace(/\/+$/, '') + '/api';
        const retryConfig = Object.assign({}, config, { baseURL: retryBase });
        console.info('[API CLIENT] Retrying failed auth request with base:', retryBase, 'url:', config.url);
        return axios(retryConfig);
      }
    }

    return Promise.reject(error);
  }
);

// Helpful debug log to surface what the client is actually using at runtime
try {
  console.info('[API CLIENT] baseURL =', BASE_URL);
} catch (e) {}

export default apiClient;
