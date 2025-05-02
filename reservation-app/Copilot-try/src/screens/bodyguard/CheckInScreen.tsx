import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

const CheckInScreen = ({ route, navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { venueId, venueName } = route.params || { venueId: '1', venueName: 'Default Venue' };
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is authorized to view this screen
    if (user?.role !== UserRole.BODYGUARD && user?.role !== UserRole.ADMIN) {
      Alert.alert('Unauthorized', 'You are not authorized to access this screen');
      navigation.goBack();
      return;
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Check if already checked in
      const storedCheckIn = await AsyncStorage.getItem(`checkIn_${venueId}`);
      if (storedCheckIn) {
        setIsCheckedIn(true);
      }
    })();
  }, [venueId, user, navigation]);

  const handleCheckIn = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(location);
      
      // Store check-in data
      const checkInData = {
        timestamp: new Date().toISOString(),
        coords: location.coords,
        venueId,
        venueName,
        userId: user?.id,
        userName: user?.name
      };
      
      await AsyncStorage.setItem(`checkIn_${venueId}`, JSON.stringify(checkInData));
      
      // Send to API
      await sendCheckInToServer(checkInData);
      
      setIsCheckedIn(true);
      Alert.alert('Success', `Checked in at ${venueName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check in. Please try again.');
      console.error(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      // Remove check-in data from storage
      await AsyncStorage.removeItem(`checkIn_${venueId}`);
      
      // Send check-out to server
      await sendCheckOutToServer({
        venueId,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      setIsCheckedIn(false);
      Alert.alert('Success', `Checked out from ${venueName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check out. Please try again.');
      console.error(error);
    }
  };

  const sendCheckInToServer = async (checkInData) => {
    // Replace with your actual API endpoint
    try {
      const response = await fetch('https://api.yourdomain.com/check-ins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use session token or any other auth method used in your app
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(checkInData),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending check-in data:', error);
      // Store for later sync if network fails
      await storeForOfflineSync('checkIn', checkInData);
      throw error;
    }
  };

  const sendCheckOutToServer = async (checkOutData) => {
    try {
      const response = await fetch('https://api.yourdomain.com/check-outs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use session token or any other auth method used in your app
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(checkOutData),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending check-out data:', error);
      // Store for later sync
      await storeForOfflineSync('checkOut', checkOutData);
      throw error;
    }
  };

  const storeForOfflineSync = async (type, data) => {
    try {
      // Get existing offline data
      const offlineDataString = await AsyncStorage.getItem('offlineSync');
      const offlineData = offlineDataString ? JSON.parse(offlineDataString) : [];
      
      // Add new item
      offlineData.push({
        type,
        data,
        timestamp: new Date().toISOString()
      });
      
      // Store updated list
      await AsyncStorage.setItem('offlineSync', JSON.stringify(offlineData));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Venue: {venueName}</Text>
      
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Button 
            title="Request Location Permission" 
            onPress={async () => {
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                setErrorMsg(null);
              }
            }} 
          />
        </View>
      ) : isCheckedIn ? (
        <View style={styles.checkedInContainer}>
          <Text style={styles.successText}>Checked In Successfully</Text>
          <Text style={styles.infoText}>
            Location: {location ? 
              `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}` : 
              'Retrieving...'}
          </Text>
          <Text style={styles.infoText}>
            Time: {new Date().toLocaleTimeString()}
          </Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="View Assignment Details" 
              onPress={() => navigation.navigate('AssignmentDetails', { venueId })}
              color="#007AFF"
            />
            <View style={styles.buttonSpacer} />
            <Button 
              title="Check Out" 
              onPress={handleCheckOut} 
              color="#FF3B30"
            />
          </View>
        </View>
      ) : (
        <View style={styles.checkInButtonContainer}>
          <Text style={styles.instructionText}>
            Please check in when you arrive at the venue
          </Text>
          <Button 
            title="Check In" 
            onPress={handleCheckIn} 
            color="#007AFF"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkedInContainer: {
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    marginVertical: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  buttonSpacer: {
    height: 10,
  },
  checkInButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  instructionText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  }
});

export default CheckInScreen;