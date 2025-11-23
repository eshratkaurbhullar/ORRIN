// src/api/axiosConfig.js
import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  // Point to the default JSON Server address
  baseURL: 'http://localhost:3001', // Standard JSON Server port
  timeout: 10000,
});

// Optional: Interceptor to log requests/responses for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Request logging removed to reduce console noise in development.
    return config;
  },
  (error) => {
    console.error(">> API Request Error:", error);
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => {
    // Response logging removed to reduce console noise. Keep response for normal flow.
    return response;
  },
  (error) => {
     console.error("<< API Response Error:", error.response?.status, error.response?.data || error.message);
     return Promise.reject(error);
  }
);

export default apiClient;