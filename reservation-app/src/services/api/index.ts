import axios from 'axios';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { Room, RoomSearchParams, RoomAvailability, RoomStatus } from '../../types/room';

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

// Reservation functions
export const getReservations = async (filters?: {
  status?: ReservationStatus;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  guestId?: string;
}): Promise<Reservation[]> => {
  try {
    const response = await api.get<Reservation[]>('/reservations', { params: filters });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch reservations';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getReservationById = async (id: string): Promise<Reservation> => {
  try {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch reservation details';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const createReservation = async (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'>): Promise<Reservation> => {
  try {
    const response = await api.post<Reservation>('/reservations', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to create reservation';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const updateReservation = async (id: string, data: Partial<Reservation>): Promise<Reservation> => {
  try {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to update reservation';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const updateReservationStatus = async (
  id: string, 
  status: ReservationStatus, 
  cancellationReason?: string
): Promise<Reservation> => {
  try {
    const response = await api.patch<Reservation>(`/reservations/${id}/status`, {
      status,
      cancellationReason
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to update reservation status';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const deleteReservation = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reservations/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to delete reservation';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Room functions
export const getRooms = async (filters?: {
  status?: RoomStatus;
  type?: string;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Room[]> => {
  try {
    const response = await api.get<Room[]>('/rooms', { params: filters });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch rooms';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getRoomById = async (id: string): Promise<Room> => {
  try {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to fetch room details';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const checkRoomAvailability = async (
  roomId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> => {
  try {
    const response = await api.get<{ available: boolean }>(`/rooms/${roomId}/availability`, {
      params: { checkInDate, checkOutDate }
    });
    return response.data.available;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to check room availability';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const searchAvailableRooms = async (searchParams: RoomSearchParams): Promise<RoomAvailability[]> => {
  try {
    const response = await api.get<RoomAvailability[]>('/rooms/search', { params: searchParams });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to search for available rooms';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const updateRoomStatus = async (
  id: string,
  status: RoomStatus
): Promise<Room> => {
  try {
    const response = await api.patch<Room>(`/rooms/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to update room status';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export default api;