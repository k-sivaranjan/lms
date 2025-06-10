import axios from 'axios';
import {Toast} from "../components/Toast"

const api = axios.create({
  baseURL: 'https://lms-v4vf.onrender.com/api'
  // baseURL:"http://localhost:5000/api"  
  // For Development
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

//Logout When toker expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      Toast.error("Login to Continue")

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

const retryRequest = async (request, retries = 3, delay = 1000) => {
  try {
    return await request();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(request, retries - 1, delay * 2);
  }
};

export const apiPostWithRetry = async (url, data) => {
  return retryRequest(() => api.post(url, data));
};

export default api;
