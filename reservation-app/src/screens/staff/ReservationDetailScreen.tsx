import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  Chip, 
  ActivityIndicator, 
  Menu, 
  Portal, 
  Dialog, 
  TextInput, 
  IconButton 
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

type ReservationDetailParams = {
  reservationId: string;
};

type StaffStackParamList = {
  ReservationList: undefined;
  ReservationDetail: { reservationId: string };
  CreateReservation: undefined;
  EditReservation: { reservationId: string };
};

const ReservationDetailScreen = () => {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const route = useRoute<RouteProp<Record<string, ReservationDetailParams>, string>>();
  const navigation = useNavigation<StackNavigationProp<StaffStackParamList>>();
  const { user } = useAuth();
  
  const reservationId = route.params.reservationId;

  const fetchReservationDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/reservations/${reservationId}`);
      setReservation(response.data);
    } catch (err) {
      setError('Failed to load reservation details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservationDetail();
    }, [reservationId])
  );

  const updateReservationStatus = async (newStatus: ReservationStatus, reason?: string) => {
    if (!reservation) return;
    
    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        cancellationReason: reason
      };
      
      await api.patch(`/reservations/${reservation.id}/status`, payload);
      
      // Update the local state
      setReservation(prev => {
        if (!prev) return null;
        return { ...prev, status: newStatus };
      });
      
      Alert.alert('Success', `Reservation status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update reservation status');
      console.error(err);
    } finally {
      setUpdating(false);
      setStatusMenuVisible(false);
      setCancelDialogVisible(false);
      setCancellationReason('');
    }
  };

  const handleStatusChange = (newStatus: ReservationStatus) => {
    if (newStatus === ReservationStatus.CANCELLED) {
      setCancelDialogVisible(true);
    } else {
      Alert.alert(
        'Confirm Status Change',
        `Are you sure you want to change the status to ${newStatus}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => updateReservationStatus(newStatus) }
        ]
      );
    }
  };

  const handleCancellation = () => {
    if (cancellationReason.trim().length === 0) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }
    
    updateReservationStatus(ReservationStatus.CANCELLED, cancellationReason);
  };

  const navigateToEdit = () => {
    if (reservation) {
      navigation.navigate('EditReservation', { reservationId: reservation.id });
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return '#4CAF50';
      case ReservationStatus.CHECKED_IN:
        return '#2196F3';
      case ReservationStatus.CHECKED_OUT:
        return '#9E9E9E';
      case ReservationStatus.CANCELLED:
        return '#F44336';
      case ReservationStatus.PENDING:
      default:
        return '#FF9800';
    }
  };

  const canChangeStatus = (currentStatus: ReservationStatus): boolean => {
    // Admin can change to any status
    if (user?.role === UserRole.ADMIN) return true;
    
    // Staff can change between PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT but not to CANCELLED
    if (user?.role === UserRole.STAFF) {
      // Staff can't change already cancelled reservations
      if (currentStatus === ReservationStatus.CANCELLED) return false;
      return true;
    }
    
    return false; // Customer and other roles can't change status
  };

  const getAvailableStatusOptions = (): ReservationStatus[] => {
    if (!reservation) return [];
    
    // Admin can change to any status
    if (user?.role === UserRole.ADMIN) {
      return Object.values(ReservationStatus);
    }
    
    // Staff options depend on current status
    if (user?.role === UserRole.STAFF) {
      switch (reservation.status) {
        case ReservationStatus.PENDING:
          return [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED];
        case ReservationStatus.CONFIRMED:
          return [ReservationStatus.CHECKED_IN, ReservationStatus.CANCELLED];
        case ReservationStatus.CHECKED_IN:
          return [ReservationStatus.CHECKED_OUT];
        case ReservationStatus.CHECKED_OUT:
          return []; // Can't change after check-out
        case ReservationStatus.CANCELLED:
          return []; // Can't change after cancellation
        default:
          return [];
      }
    }
    
    return []; // No options for other roles
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !reservation) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge">{error || 'Reservation not found'}</Text>
        <Button mode="contained" onPress={fetchReservationDetail} style={styles.actionButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text variant="titleLarge">Reservation #{reservation.confirmationCode}</Text>
              <Text variant="bodyMedium">Created on {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}</Text>
            </View>
            <Chip
              mode="flat"
              textStyle={{ color: '#fff' }}
              style={{ backgroundColor: getStatusColor(reservation.status) }}
            >
              {reservation.status}
            </Chip>
          </View>

          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text variant="titleMedium">Guest Information</Text>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Name:</Text>
              <Text variant="bodyMedium">{reservation.guest.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Email:</Text>
              <Text variant="bodyMedium">{reservation.guest.email}</Text>
            </View>
            {reservation.guest.phone && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium">Phone:</Text>
                <Text variant="bodyMedium">{reservation.guest.phone}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text variant="titleMedium">Reservation Details</Text>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Room:</Text>
              <Text variant="bodyMedium">{reservation.roomNumber || 'Not assigned'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Check-in:</Text>
              <Text variant="bodyMedium">{format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Check-out:</Text>
              <Text variant="bodyMedium">{format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Guests:</Text>
              <Text variant="bodyMedium">{reservation.adults} Adults, {reservation.children} Children</Text>
            </View>
          </View>

          {reservation.specialRequests && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium">Special Requests</Text>
                <Text variant="bodyMedium">{reservation.specialRequests}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        {/* Status update button - visible only to staff and admin */}
        {canChangeStatus(reservation.status) && (
          <View style={styles.statusUpdateContainer}>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button 
                  mode="contained" 
                  icon="clipboard-edit-outline" 
                  onPress={() => setStatusMenuVisible(true)}
                  loading={updating}
                  style={styles.actionButton}
                >
                  Update Status
                </Button>
              }
            >
              {getAvailableStatusOptions().map((status) => (
                <Menu.Item
                  key={status}
                  title={status}
                  onPress={() => handleStatusChange(status)}
                />
              ))}
            </Menu>
          </View>
        )}

        {/* Edit reservation button - visible only to admin and staff */}
        {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF) && (
          <Button 
            mode="outlined" 
            icon="pencil" 
            onPress={navigateToEdit}
            style={styles.actionButton}
          >
            Edit Reservation
          </Button>
        )}
        
        {/* Back button */}
        <Button 
          mode="text" 
          icon="arrow-left" 
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Back to List
        </Button>
      </View>

      {/* Cancellation Dialog */}
      <Portal>
        <Dialog visible={cancelDialogVisible} onDismiss={() => setCancelDialogVisible(false)}>
          <Dialog.Title>Reason for Cancellation</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reason"
              value={cancellationReason}
              onChangeText={setCancellationReason}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCancellation} loading={updating}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  statusUpdateContainer: {
    marginBottom: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default ReservationDetailScreen;