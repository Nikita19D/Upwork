import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);
  const [showCancelledReservations, setShowCancelledReservations] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the application cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => Alert.alert('Success', 'Cache cleared successfully'),
          style: 'destructive' 
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert('Backup', 'System backup started');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="bell" size={22} color="#2196F3" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#2196F3" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="theme-light-dark" size={22} color="#2196F3" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={darkModeEnabled ? "#2196F3" : "#f4f3f4"}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservation Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="calendar-check" size={22} color="#2196F3" style={styles.settingIcon} />
            <View>
              <Text style={styles.settingLabel}>Auto-Accept Bookings</Text>
              <Text style={styles.settingDescription}>
                Automatically accept new bookings if tables are available
              </Text>
            </View>
          </View>
          <Switch
            value={autoAcceptBookings}
            onValueChange={setAutoAcceptBookings}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={autoAcceptBookings ? "#2196F3" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="cancel" size={22} color="#2196F3" style={styles.settingIcon} />
            <View>
              <Text style={styles.settingLabel}>Show Cancelled Reservations</Text>
              <Text style={styles.settingDescription}>
                Display cancelled reservations in the reservation list
              </Text>
            </View>
          </View>
          <Switch
            value={showCancelledReservations}
            onValueChange={setShowCancelledReservations}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={showCancelledReservations ? "#2196F3" : "#f4f3f4"}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System</Text>
        
        <TouchableOpacity style={styles.buttonItem} onPress={handleClearCache}>
          <View style={styles.settingInfo}>
            <Icon name="cached" size={22} color="#2196F3" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Clear Cache</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buttonItem} onPress={handleBackupData}>
          <View style={styles.settingInfo}>
            <Icon name="database" size={22} color="#2196F3" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Backup Data</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    width: '90%',
  },
  buttonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
});

export default SettingsScreen;