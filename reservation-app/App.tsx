import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

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
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme} children={
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      } />
    </SafeAreaProvider>
  );
}