import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

// Define user types as enum
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'waiter',
  CUSTOMER = 'customer',
  BODYGUARD = 'bodyguard'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize: check for existing token and user data
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setLoading(true);
        const storedUser = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('auth_token');
        
        if (storedUser && token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load stored authentication data');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    loadStoredData();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Adjust this to match your API's login endpoint and response format
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      // Convert the user role string to enum value
      const userWithEnumRole = {
        ...user,
        role: user.role as UserRole
      };
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userWithEnumRole));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userWithEnumRole);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Optional: call logout endpoint if your API has one
      // await api.post('/auth/logout');
      
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}