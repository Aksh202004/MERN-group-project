import axios from 'axios';

// Determine the base URL for the API
// In development, it's usually localhost:PORT (where PORT is from backend .env)
// In production, it would be your deployed backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Default to port 5000

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptor to include JWT token in requests if logged in
// We will add this later when handling login state
// apiClient.interceptors.request.use(config => {
//   const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
//   if (userInfo && userInfo.token) {
//     config.headers.Authorization = `Bearer ${userInfo.token}`;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });


export default apiClient;
