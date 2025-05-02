import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bella Cucina</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('AuthTest')}
          >
            <Text style={styles.link}>Auth Test Panel</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.version}>Environment: {process.env.NODE_ENV || 'development'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  link: {
    color: '#2196F3',
  },
  version: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
});

export default LoginScreen;