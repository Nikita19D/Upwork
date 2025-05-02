import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { api, testApiConnection } from './src/services/api.js';

// Define a custom theme for the app using MD3 (Material You)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1E88E5',
    secondaryContainer: '#FF5722',
    tertiary: '#FF9800',
  },
};

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Test API connection on app startup with improved error handling
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const connected = await testApiConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Retry connection function
  const retryConnection = () => {
    setRetryCount(prev => prev + 1);
    checkConnection();
  };

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Show loading screen while checking connection
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Connecting to Bella Cucina services...</Text>
      </View>
    );
  }

  // Show offline message if not connected with retry button
  if (isConnected === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Unable to connect to the server.</Text>
        <Text style={styles.subMessage}>
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={retryConnection}
        >
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
        <Text style={styles.apiUrlText}>
          API URL: {api.defaults.baseURL || 'Not configured'}
        </Text>
      </View>
    );
  }

  // Main app rendering when connected
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  apiUrlText: {
    marginTop: 20,
    fontSize: 12,
    color: '#777777',
  }
});