import * as Location from 'expo-location';
import { Alert } from 'react-native';

class GeofencingService {
  constructor() {
    this.activeGeofences = new Map();
    this.locationSubscription = null;
    this.isMonitoring = false;
  }

  // Calculate distance between two coordinates in meters
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  // Add a new geofence
  addGeofence(id, name, latitude, longitude, radius, onEnter, onExit) {
    this.activeGeofences.set(id, {
      id,
      name,
      latitude,
      longitude,
      radius, // in meters
      onEnter,
      onExit,
      isInside: false
    });

    console.log(`Geofence added: ${name}`);
    
    // Start monitoring if not already
    if (!this.isMonitoring) {
      this.startMonitoring();
    }
    
    return id;
  }

  // Remove a geofence
  removeGeofence(id) {
    const removed = this.activeGeofences.delete(id);
    
    // Stop monitoring if no geofences left
    if (this.activeGeofences.size === 0) {
      this.stopMonitoring();
    }
    
    return removed;
  }

  // Start location monitoring
  async startMonitoring() {
    if (this.isMonitoring) return;

    try {
      // Check and request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return false;
      }

      // Start watching position
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,    // Update every 5 seconds
          distanceInterval: 5,  // or when moved 5 meters
        },
        this.locationUpdate.bind(this)
      );
      
      this.isMonitoring = true;
      console.log('Geofence monitoring started');
      return true;

    } catch (error) {
      console.error('Error starting geofence monitoring:', error);
      return false;
    }
  }

  // Process location updates
  locationUpdate(location) {
    const { latitude, longitude } = location.coords;
    
    // Check each geofence
    this.activeGeofences.forEach(geofence => {
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        geofence.latitude, 
        geofence.longitude
      );
      
      const isInside = distance <= geofence.radius;
      
      // Detect transitions
      if (isInside && !geofence.isInside) {
        // Entered geofence
        geofence.isInside = true;
        if (geofence.onEnter) {
          geofence.onEnter(geofence);
        }
        this.logGeofenceEvent(geofence.id, 'enter');
      } else if (!isInside && geofence.isInside) {
        // Exited geofence
        geofence.isInside = false;
        if (geofence.onExit) {
          geofence.onExit(geofence);
        }
        this.logGeofenceEvent(geofence.id, 'exit');
      }
    });
  }
  
  // Log geofence events to server or local storage
  async logGeofenceEvent(geofenceId, eventType) {
    const geofence = this.activeGeofences.get(geofenceId);
    if (!geofence) return;
    
    const eventData = {
      geofenceId,
      geofenceName: geofence.name,
      eventType, // 'enter' or 'exit'
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Log to server
      await fetch('https://your-api.com/geofence-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      console.log(`Geofence ${eventType} event logged for ${geofence.name}`);
    } catch (error) {
      console.error('Failed to log geofence event:', error);
      // Consider storing failed logs locally for later sync
    }
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isMonitoring = false;
    console.log('Geofence monitoring stopped');
  }
}

// Export as singleton
export default new GeofencingService();