import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import GeofencingService from '../../services/GeofencingService';

const VenueGeofenceScreen = ({ route }) => {
  const { venueId } = route.params;
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueAreas();
  }, []);

  const fetchVenueAreas = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch(`https://your-api.com/venues/${venueId}/areas`);
      const data = await response.json();
      setVenues(data.map(area => ({ ...area, isMonitored: false })));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue areas:', error);
      Alert.alert('Error', 'Failed to load venue areas');
      setLoading(false);
    }
  };

  const toggleGeofence = (area, isEnabled) => {
    if (isEnabled) {
      // Add geofence
      GeofencingService.addGeofence(
        area.id,
        area.name,
        area.latitude,
        area.longitude,
        area.radius,
        (geofence) => {
          console.log(`Entered ${geofence.name}`);
          Alert.alert('Area Update', `You've entered ${geofence.name}`);
        },
        (geofence) => {
          console.log(`Left ${geofence.name}`);
          Alert.alert('Warning', `You've left ${geofence.name}. Please return to your assigned area.`);
        }
      );
    } else {
      // Remove geofence
      GeofencingService.removeGeofence(area.id);
    }

    // Update local state
    setVenues(venues.map(v => 
      v.id === area.id ? { ...v, isMonitored: isEnabled } : v
    ));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading venue areas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Venue Areas</Text>
      <Text style={styles.subtitle}>Toggle monitoring for specific areas</Text>
      
      <ScrollView style={styles.areaList}>
        {venues.map(area => (
          <View key={area.id} style={styles.areaItem}>
            <View style={styles.areaInfo}>
              <Text style={styles.areaName}>{area.name}</Text>
              <Text style={styles.areaDetails}>Radius: {area.radius}m</Text>
            </View>
            <Switch
              value={area.isMonitored}
              onValueChange={(value) => toggleGeofence(area, value)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  areaList: {
    flex: 1,
  },
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 18,
    fontWeight: '500',
  },
  areaDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default VenueGeofenceScreen;