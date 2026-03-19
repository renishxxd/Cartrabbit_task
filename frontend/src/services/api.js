// filepath: e:\CARTRABBIT\frontend\src\services\api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      if (parsedUserInfo.token) {
        config.headers.Authorization = `Bearer ${parsedUserInfo.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // You can handle 401 Unauthorized globally here
    if (error.response && error.response.status === 401) {
      // Optional: auto-logout mechanism here
      console.log('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default api;
