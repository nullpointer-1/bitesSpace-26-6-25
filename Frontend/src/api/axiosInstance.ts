// src/api/axiosInstance.ts
import axios from 'axios';

// Define your backend API base URL
// Make sure to configure VITE_BACKEND_URL in your .env file
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for admin token first
    let token = localStorage.getItem('adminAuthToken');
    // If admin token is not found, check for vendor token
    if (!token) {
      token = localStorage.getItem('vendorAuthToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling (e.g., token expiration)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized response is received and a token was present in localStorage,
    // it likely means the token is expired or invalid. Clear both tokens and redirect.
    if (error.response && error.response.status === 401) {
      const currentAdminToken = localStorage.getItem('adminAuthToken');
      const currentVendorToken = localStorage.getItem('vendorAuthToken');

      // Only attempt to clear tokens and redirect if a token was actually present,
      // indicating an expired/invalid session rather than a failed login attempt.
      if (currentAdminToken || currentVendorToken) {
        console.error("Unauthorized API call detected (401), clearing tokens and redirecting to login.");
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('vendorAuthToken');
        localStorage.removeItem('currentUser'); // Also clear the stored user object

        // Redirect to a general login page. Your AuthProvider's useEffect will then
        // detect no token and ensure proper redirection, including any
        // initial password change flows or dashboard redirects.
        window.location.href = '/login'; // Redirect to a general login path
      } else {
        // If 401 but no token was present, it might be an unauthenticated call to a protected endpoint,
        // or a login attempt with invalid credentials. No specific redirect needed here,
        // as the login component itself should handle the error message.
        console.warn("Unauthorized (401) without active token. This might be an invalid login attempt or access to an unprotected endpoint.");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
