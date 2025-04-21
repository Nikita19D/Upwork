import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, loginUser } from '../services/api';

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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function loadStoredData() {
      setLoading(true);
      
      const storedUser = await SecureStore.getItemAsync('user');
      const storedToken = await SecureStore.getItemAsync('authToken');
      
      if (storedUser && storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
      setInitialized(true);
    }
    
    loadStoredData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      
      const { user, token } = response;
      
      // Convert the user role string to enum value
      const userWithEnumRole = {
        ...user,
        role: user.role as UserRole
      };
      
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(userWithEnumRole));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userWithEnumRole);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('authToken');
    
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        initialized,
        signIn, 
        signOut, 
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