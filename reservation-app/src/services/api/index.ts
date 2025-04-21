import axios from 'axios';

// Create an API client instance
export const api = axios.create({
  baseURL: 'https://your-api-domain.com/api', // Replace with your API domain
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication interfaces
interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'waiter' | 'bodyguard' | 'admin';
  };
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Authentication functions
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Authentication failed';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const registerUser = async (userData: LoginCredentials & { name: string, role?: string }): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/register', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Add an interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you could implement token refresh logic
      // For example:
      // const refreshToken = await SecureStore.getItemAsync('refreshToken');
      // const response = await api.post('/auth/refresh', { refreshToken });
      // if (response.data.token) {
      //   api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      //   return api(originalRequest);
      // }
    }
    
    return Promise.reject(error);
  }
);

export default api;