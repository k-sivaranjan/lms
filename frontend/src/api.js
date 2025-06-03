import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const retryRequest = async (request, retries = 3, delay = 1000) => {
  try {
    return await request();
  } catch (error) {
    if (retries === 0) throw error;
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(request, retries - 1, delay * 2);
  }
};

export const apiPostWithRetry = async (url, data) => {
  return retryRequest(() => api.post(url, data));
};

export default api;