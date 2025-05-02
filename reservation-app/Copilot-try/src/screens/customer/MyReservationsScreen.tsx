import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock data for customer reservations
const mockReservations = [
  { 
    id: '1', 
    date: '2025-04-22',
    time: '19:00', 
    tableNumber: 5,
    partySize: 4,
    status: 'confirmed',
  },
  { 
    id: '2', 
    date: '2025-05-15',
    time: '20:30', 
    tableNumber: 8,
    partySize: 2,
    status: 'pending',
  },
  { 
    id: '3', 
    date: '2025-03-30',
    time: '18:00', 
    tableNumber: null,
    partySize: 6,
    status: 'cancelled',
  },
];

const MyReservationsScreen = ({ navigation }) => {
  const [reservations, setReservations] = useState(mockReservations);

  const renderReservationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.reservationItem,
        item.status === 'cancelled' && styles.cancelledItem
      ]}
      onPress={() => navigation.navigate('ReservationDetail', { reservationId: item.id })}
      disabled={item.status === 'cancelled'}
    >
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <Icon name="account-group" size={16} color="#666" />
          <Text style={styles.infoText}>{item.partySize} people</Text>
        </View>
        
        {item.tableNumber && (
          <View style={styles.infoRow}>
            <Icon name="table-chair" size={16} color="#666" />
            <Text style={styles.infoText}>Table {item.tableNumber}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          item.status === 'confirmed' ? styles.confirmedStatus :
          item.status === 'pending' ? styles.pendingStatus :
          styles.cancelledStatus
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        
        <Icon 
          name="chevron-right" 
          size={20} 
          color={item.status === 'cancelled' ? '#ccc' : '#2196F3'} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="calendar-blank" size={64} color="#ccc" />
      <Text style={styles.emptyText}>You don't have any reservations yet</Text>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('Book')}
      >
        <Text style={styles.bookButtonText}>Make a Reservation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        renderItem={renderReservationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Book')}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  reservationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelledItem: {
    opacity: 0.6,
  },
  dateTimeContainer: {
    width: 70,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  confirmedStatus: {
    backgroundColor: '#E8F5E9',
  },
  pendingStatus: {
    backgroundColor: '#FFF8E1',
  },
  cancelledStatus: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MyReservationsScreen;