import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Point to your existing Render web service based on environment
// The API_URL will be automatically loaded from the proper .env file

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      // You'll need to implement this based on your navigation
      // Example: navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);

// Simple connection test you can run during app startup
const testApiConnection = async () => {
  try {
    // Use an endpoint you know exists and doesn't require authentication
    const response = await api.get('/health-check');
    console.log('API connection successful');
    return true;
  } catch (error) {
    console.error('API connection failed:', error.message);
    return false;
  }
};

export { api, testApiConnection };