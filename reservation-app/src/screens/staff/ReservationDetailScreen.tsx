import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock reservation data - in a real app, this would come from an API
const mockReservation = {
  id: '1',
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  customerPhone: '+1 (555) 123-4567',
  date: '2025-04-22',
  time: '19:00',
  partySize: 4,
  tableNumber: 5,
  specialRequests: 'Window seat preferred. Celebrating an anniversary.',
  status: 'confirmed',
  createdAt: '2025-04-15T10:30:00Z'
};

const ReservationDetailScreen = ({ route, navigation }) => {
  const { reservationId } = route.params || { reservationId: '1' };
  
  // In a real app, you would fetch the reservation by ID
  const [reservation, setReservation] = useState(mockReservation);

  const handleUpdateStatus = (newStatus) => {
    setReservation(prev => ({ ...prev, status: newStatus }));
    Alert.alert('Status Updated', `Reservation status updated to ${newStatus}`);
  };

  const handleAssignTable = () => {
    // This would open a table selection UI
    Alert.alert('Assign Table', 'This would open a table selection interface');
  };

  const handleEditReservation = () => {
    // Navigate to edit screen
    Alert.alert('Edit Reservation', 'This would navigate to the edit reservation screen');
  };

  const handleDeleteReservation = () => {
    Alert.alert(
      'Delete Reservation',
      'Are you sure you want to delete this reservation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            Alert.alert('Deleted', 'Reservation has been deleted');
            navigation.goBack();
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return styles.confirmedStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'cancelled':
        return styles.cancelledStatus;
      default:
        return styles.pendingStatus;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.customerName}>{reservation.customerName}</Text>
          <View style={[styles.statusBadge, getStatusStyle(reservation.status)]}>
            <Text style={styles.statusText}>{reservation.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservation Details</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={18} color="#2196F3" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{reservation.date}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={18} color="#2196F3" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{reservation.time}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="account-group" size={18} color="#2196F3" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Party Size</Text>
            <Text style={styles.detailValue}>{reservation.partySize} people</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="table-chair" size={18} color="#2196F3" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Table</Text>
            <Text style={styles.detailValue}>Table {reservation.tableNumber}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <View style={styles.infoItem}>
          <Icon name="account" size={20} color="#2196F3" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{reservation.customerName}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="email" size={20} color="#2196F3" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{reservation.customerEmail}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="phone" size={20} color="#2196F3" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{reservation.customerPhone}</Text>
          </View>
        </View>
        
        {reservation.specialRequests && (
          <View style={styles.specialRequests}>
            <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
            <Text style={styles.specialRequestsText}>{reservation.specialRequests}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <View style={styles.actionButtons}>
          {reservation.status !== 'confirmed' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleUpdateStatus('confirmed')}
            >
              <Icon name="check" size={20} color="white" />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}
          
          {reservation.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleUpdateStatus('cancelled')}
            >
              <Icon name="close" size={20} color="white" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAssignTable}
          >
            <Icon name="table-chair" size={20} color="white" />
            <Text style={styles.actionButtonText}>Assign Table</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditReservation}
          >
            <Icon name="pencil" size={20} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteReservation}
          >
            <Icon name="delete" size={20} color="white" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmedStatus: {
    backgroundColor: '#4CAF50',
  },
  pendingStatus: {
    backgroundColor: '#FFC107',
  },
  cancelledStatus: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  detailIcon: {
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  specialRequests: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  specialRequestsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  specialRequestsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionsSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    padding: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FF9800',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default ReservationDetailScreen;