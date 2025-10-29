import axios from 'axios';
import { getAuthToken } from './apiUtils';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api/',
  timeout: 10000,
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Authentication failed - 401 Unauthorized');
      
      // Optionally redirect to login or clear storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
