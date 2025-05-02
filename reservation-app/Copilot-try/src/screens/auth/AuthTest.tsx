import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, TextInput, Divider } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { handleApiError } from '../../utils/apiUtils';

const AuthTest = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Test login with credentials
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      setTestResponse('Login successful!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      setTestResponse(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Test logout functionality
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setTestResponse('Logout successful!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      setTestResponse(`Logout failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Test accessing a protected endpoint
  const testProtectedEndpoint = async () => {
    setLoading(true);
    try {
      // Replace with an actual protected endpoint in your API
      const response = await api.get('/reservations');
      setTestResponse(`Protected endpoint access successful: ${JSON.stringify(response.data).slice(0, 100)}...`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setTestResponse(`Protected endpoint access failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Test token validation
  const checkToken = async () => {
    setLoading(true);
    try {
      // Replace with an endpoint that validates the token
      const response = await api.get('/auth/me');
      setTestResponse(`Token validation successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setTestResponse(`Token validation failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Authentication Test Panel" />
        <Card.Content>
          <Text style={styles.subtitle}>API URL from Environment:</Text>
          <Text style={styles.apiUrl}>{api.defaults.baseURL}</Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.subtitle}>Current Authentication State:</Text>
          <Text style={styles.state}>
            {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
          </Text>
          
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.label}>User ID: {user.id}</Text>
              <Text style={styles.label}>Name: {user.name}</Text>
              <Text style={styles.label}>Email: {user.email}</Text>
              <Text style={styles.label}>Role: {user.role}</Text>
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          {!isAuthenticated ? (
            <>
              <Text style={styles.subtitle}>Login Test:</Text>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
              />
              <Button 
                mode="contained" 
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Test Login
              </Button>
            </>
          ) : (
            <>
              <Button 
                mode="contained" 
                onPress={testProtectedEndpoint}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Test Protected Endpoint
              </Button>
              
              <Button 
                mode="contained" 
                onPress={checkToken}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Validate Token
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={handleLogout}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Test Logout
              </Button>
            </>
          )}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.subtitle}>Test Results:</Text>
          <View style={styles.responseContainer}>
            <Text style={styles.response}>{testResponse || 'No tests run yet'}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  apiUrl: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  divider: {
    marginVertical: 15,
  },
  state: {
    fontSize: 16,
    marginVertical: 5,
  },
  userInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 8,
  },
  responseContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
  },
  response: {
    fontFamily: 'monospace',
  },
});

export default AuthTest;