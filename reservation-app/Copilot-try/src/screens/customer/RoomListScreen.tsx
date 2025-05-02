import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { api } from '../../services/api';
import { Room, RoomType } from '../../types/room';
import { handleApiError, extractValidationErrors } from '../../utils/apiUtils';

const RoomListScreen = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      // Get a user-friendly error message
      const errorMessage = handleApiError(error);
      
      // Set the error state
      setError(errorMessage);
      
      // Display the error message to the user
      Alert.alert('Error', errorMessage);
      
      // For form validation errors (not applicable for this GET request, but shown for demonstration)
      const validationErrors = extractValidationErrors(error);
      console.log('Validation errors:', validationErrors);
    } finally {
      setLoading(false);
    }
  };

  const renderRoomItem = ({ item }: { item: Room }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{getRoomTypeLabel(item.type)} Room {item.number}</Title>
        <Paragraph>Floor: {item.floor}</Paragraph>
        <Paragraph>Capacity: {item.capacity.adults} Adults, {item.capacity.children} Children</Paragraph>
        <Paragraph>Price: ${item.pricePerNight}/night</Paragraph>
        <Paragraph>Amenities: {item.amenities.join(', ')}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigateToRoomDetails(item.id)}>View Details</Button>
        <Button mode="contained" onPress={() => navigateToBooking(item.id)}>Book Now</Button>
      </Card.Actions>
    </Card>
  );

  const getRoomTypeLabel = (type: RoomType): string => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const navigateToRoomDetails = (roomId: string) => {
    // Navigation logic to room details screen
    console.log(`Navigate to room details for room ${roomId}`);
  };

  const navigateToBooking = (roomId: string) => {
    // Navigation logic to booking screen
    console.log(`Navigate to booking for room ${roomId}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchRooms} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Rooms</Text>
      {rooms.length === 0 ? (
        <Text style={styles.noRoomsText}>No rooms available at the moment.</Text>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
  },
  noRoomsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#757575',
  },
});

export default RoomListScreen;