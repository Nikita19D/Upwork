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
  IconButton,
  Surface,
  List,
  Avatar,
  Badge,
  SegmentedButtons,
  Switch
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, differenceInDays } from 'date-fns';
import { api } from '../../services/api';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GeofencingService from '../../services/GeofencingService';

// Define the navigation params
interface ReservationDetailParams {
  reservationId: string;
}

// Define the staff stack param list
type StaffStackParamList = {
  ReservationList: undefined;
  ReservationDetail: ReservationDetailParams;
  CreateReservation: undefined;
  EditReservation: { reservationId: string };
  VenueGeofence: { venueId: string };
};

const ReservationDetailScreen = () => {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [notesDialogVisible, setNotesDialogVisible] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [geofencingEnabled, setGeofencingEnabled] = useState(false);
  const [geofenceId, setGeofenceId] = useState<string | null>(null);

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
      setStaffNotes(response.data.staffNotes || '');
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

  useEffect(() => {
    // Set up geofencing when the reservation data is loaded
    if (reservation && reservation.venue && reservation.venue.coordinates) {
      // Create a unique geofence ID for this reservation
      const uniqueId = `venue-${reservation.id}`;
      
      // Setup handlers for geofence events
      const onEnterVenue = (geofence) => {
        Alert.alert(
          'Geofence Alert',
          `You've entered ${geofence.name}.`,
          [{ text: 'OK' }]
        );
      };
      
      const onExitVenue = (geofence) => {
        Alert.alert(
          'Geofence Alert',
          `You've left ${geofence.name}. Please return to the designated area.`,
          [{ text: 'OK' }]
        );
      };

      if (geofencingEnabled) {
        // Add the geofence when enabled
        const id = GeofencingService.addGeofence(
          uniqueId,
          reservation.venue.name || 'Venue',
          reservation.venue.coordinates.latitude,
          reservation.venue.coordinates.longitude,
          reservation.venue.radius || 100, // Default 100m radius if not specified
          onEnterVenue,
          onExitVenue
        );
        setGeofenceId(id);
      } else if (geofenceId) {
        // Remove geofence when disabled
        GeofencingService.removeGeofence(geofenceId);
        setGeofenceId(null);
      }
    }
    
    // Cleanup function to remove geofence when component unmounts
    return () => {
      if (geofenceId) {
        GeofencingService.removeGeofence(geofenceId);
      }
    };
  }, [reservation, geofencingEnabled, geofenceId]);

  const updateReservationStatus = async (newStatus: ReservationStatus, reason?: string) => {
    if (!reservation) return;
    
    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        cancellationReason: reason,
        updatedBy: user?.id
      };
      
      await api.patch(`/reservations/${reservation.id}/status`, payload);
      
      // Update the local state
      setReservation(prev => {
        if (!prev) return null;
        return { ...prev, status: newStatus, cancellationReason: reason };
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

  const saveStaffNotes = async () => {
    if (!reservation) return;
    
    setUpdating(true);
    try {
      await api.patch(`/reservations/${reservation.id}`, {
        staffNotes: staffNotes,
        updatedBy: user?.id
      });
      
      setReservation(prev => {
        if (!prev) return null;
        return { ...prev, staffNotes };
      });
      
      Alert.alert('Success', 'Staff notes updated successfully');
      setNotesDialogVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update staff notes');
      console.error(err);
    } finally {
      setUpdating(false);
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

  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'check-circle';
      case ReservationStatus.CHECKED_IN:
        return 'login';
      case ReservationStatus.CHECKED_OUT:
        return 'logout';
      case ReservationStatus.CANCELLED:
        return 'cancel';
      case ReservationStatus.PENDING:
      default:
        return 'clock-outline';
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

  const canEditReservation = (): boolean => {
    if (!reservation) return false;
    
    // Admin can edit any reservation
    if (user?.role === UserRole.ADMIN) return true;
    
    // Staff can edit reservations that are not checked out or cancelled
    if (user?.role === UserRole.STAFF) {
      return ![ReservationStatus.CHECKED_OUT, ReservationStatus.CANCELLED].includes(reservation.status);
    }
    
    return false;
  };

  const canAddStaffNotes = (): boolean => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF;
  };

  const calculateTotalNights = (): number => {
    if (!reservation) return 0;
    
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    
    return differenceInDays(checkOut, checkIn);
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
    <View style={styles.container}>
      {/* Status bar at the top */}
      <Surface style={[styles.statusBar, { backgroundColor: getStatusColor(reservation.status) }]}>
        <MaterialCommunityIcons name={getStatusIcon(reservation.status)} size={24} color="white" />
        <Text style={styles.statusText}>{reservation.status}</Text>
      </Surface>

      {/* Tab Selector */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'details', label: 'Details' },
          { value: 'guest', label: 'Guest' },
          { value: 'history', label: 'History' }
        ]}
        style={styles.segmentedButtons}
      />

      <ScrollView style={styles.scrollView}>
        {activeTab === 'details' && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <View>
                    <Text variant="titleLarge">Reservation #{reservation.confirmationCode}</Text>
                    <Text variant="bodyMedium">Created on {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}</Text>
                  </View>
                </View>

                <Divider style={styles.divider} />
                
                <View style={styles.section}>
                  <Text variant="titleMedium">Reservation Details</Text>
                  <List.Item
                    title="Room"
                    description={reservation.roomNumber || 'Not assigned'}
                    left={props => <List.Icon {...props} icon="door" />}
                  />
                  <List.Item
                    title="Check-in"
                    description={format(new Date(reservation.checkInDate), 'EEE, MMM dd, yyyy')}
                    left={props => <List.Icon {...props} icon="login" />}
                  />
                  <List.Item
                    title="Check-out"
                    description={format(new Date(reservation.checkOutDate), 'EEE, MMM dd, yyyy')}
                    left={props => <List.Icon {...props} icon="logout" />}
                  />
                  <List.Item
                    title="Duration"
                    description={`${calculateTotalNights()} night${calculateTotalNights() !== 1 ? 's' : ''}`}
                    left={props => <List.Icon {...props} icon="calendar-range" />}
                  />
                  <List.Item
                    title="Guests"
                    description={`${reservation.adults} Adults, ${reservation.children} Children`}
                    left={props => <List.Icon {...props} icon="account-group" />}
                  />
                </View>

                {reservation.specialRequests && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.section}>
                      <Text variant="titleMedium">Special Requests</Text>
                      <View style={styles.specialRequestsContainer}>
                        <MaterialCommunityIcons name="note-text" size={20} color="#666" />
                        <Text variant="bodyMedium" style={styles.specialRequestsText}>
                          {reservation.specialRequests}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Staff Notes Section - visible only to staff and admin */}
                {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF) && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text variant="titleMedium">Staff Notes</Text>
                        {canAddStaffNotes() && (
                          <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => setNotesDialogVisible(true)}
                          />
                        )}
                      </View>
                      <View style={styles.specialRequestsContainer}>
                        <MaterialCommunityIcons name="clipboard-text" size={20} color="#666" />
                        <Text variant="bodyMedium" style={styles.specialRequestsText}>
                          {staffNotes || 'No staff notes added yet.'}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>

            {reservation.cancellationReason && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.cancellationTitle}>Cancellation Reason</Text>
                  <Text variant="bodyMedium">{reservation.cancellationReason}</Text>
                </Card.Content>
              </Card>
            )}

            {/* Geofencing Card - only visible to staff and admin */}
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF) && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Text variant="titleMedium">Venue Geofencing</Text>
                    <Switch
                      value={geofencingEnabled}
                      onValueChange={setGeofencingEnabled}
                    />
                  </View>
                  <View style={styles.geofencingInfoContainer}>
                    <MaterialCommunityIcons name="map-marker-radius" size={20} color="#666" />
                    <View style={styles.geofencingTextContainer}>
                      <Text variant="bodyMedium" style={styles.geofencingText}>
                        {geofencingEnabled 
                          ? `Monitoring active for ${reservation.venue?.name || 'venue'}.` 
                          : 'Toggle to monitor if you stay within the venue area.'}
                      </Text>
                      {geofencingEnabled && (
                        <Text variant="bodySmall" style={styles.geofencingSubtext}>
                          You'll be notified if you exit the designated area.
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {/* Add button to navigate to detailed venue geofencing screen */}
                  {reservation.venue && (
                    <Button 
                      mode="outlined"
                      icon="map-marker-radius"
                      style={styles.geofencingButton}
                      onPress={() => navigation.navigate('VenueGeofence', { venueId: reservation.venue.id })}
                    >
                      Manage Venue Areas
                    </Button>
                  )}
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {activeTab === 'guest' && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.guestProfileContainer}>
                <Avatar.Text
                  size={60}
                  label={reservation.guest.name.split(' ').map(n => n[0]).join('')}
                  style={styles.guestAvatar}
                />
                <Text variant="titleLarge" style={styles.guestName}>{reservation.guest.name}</Text>
              </View>

              <Divider style={styles.divider} />
              
              <List.Item
                title="Email"
                description={reservation.guest.email}
                left={props => <List.Icon {...props} icon="email" />}
              />
              
              {reservation.guest.phone && (
                <List.Item
                  title="Phone"
                  description={reservation.guest.phone}
                  left={props => <List.Icon {...props} icon="phone" />}
                />
              )}
              
              {/* Additional guest information could be added here */}
              <List.Item
                title="Reservation Count"
                description="Loading..."
                left={props => <List.Icon {...props} icon="history" />}
              />
            </Card.Content>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.historyTitle}>Reservation History</Text>
              
              <List.Item
                title="Created"
                description={format(new Date(reservation.createdAt), 'MMM dd, yyyy HH:mm')}
                left={props => <List.Icon {...props} icon="plus-circle" />}
              />
              
              <List.Item
                title="Last Updated"
                description={format(new Date(reservation.updatedAt), 'MMM dd, yyyy HH:mm')}
                left={props => <List.Icon {...props} icon="update" />}
              />
              
              {/* Status change logs would be fetched from API and displayed here */}
              <Text variant="bodyMedium" style={styles.statusLogTitle}>Status Changes:</Text>
              <List.Item
                title={`Status changed to ${reservation.status}`}
                description={`${format(new Date(reservation.updatedAt), 'MMM dd, yyyy HH:mm')}`}
                left={props => <List.Icon {...props} icon={getStatusIcon(reservation.status)} />}
              />
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        {/* Status update button - visible only to staff and admin with appropriate permissions */}
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
                  leadingIcon={getStatusIcon(status)}
                />
              ))}
            </Menu>
          </View>
        )}

        {/* Edit reservation button - visible only to admin and staff with appropriate permissions */}
        {canEditReservation() && (
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

      {/* Staff Notes Dialog */}
      <Portal>
        <Dialog visible={notesDialogVisible} onDismiss={() => setNotesDialogVisible(false)}>
          <Dialog.Title>Staff Notes</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Notes"
              value={staffNotes}
              onChangeText={setStaffNotes}
              multiline
              numberOfLines={4}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotesDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveStaffNotes} loading={updating}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 2,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  segmentedButtons: {
    margin: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 0,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  statusUpdateContainer: {
    marginBottom: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  specialRequestsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  specialRequestsText: {
    marginLeft: 12,
    flex: 1,
  },
  guestProfileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  guestAvatar: {
    marginBottom: 8,
  },
  guestName: {
    marginBottom: 4,
  },
  historyTitle: {
    marginBottom: 16,
  },
  statusLogTitle: {
    marginLeft: 16,
    marginTop: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  cancellationTitle: {
    color: '#F44336',
  },
  geofencingInfoContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  geofencingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  geofencingText: {
    flex: 1,
  },
  geofencingSubtext: {
    color: '#666',
  },
  geofencingButton: {
    marginTop: 16,
  },
});

export default ReservationDetailScreen;