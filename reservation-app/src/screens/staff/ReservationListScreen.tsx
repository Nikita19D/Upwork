import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import { 
  Text, 
  Searchbar, 
  Chip, 
  Card, 
  Divider, 
  ActivityIndicator, 
  Button, 
  Menu, 
  IconButton 
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

// Define the navigation type for this screen
type ReservationStackParamList = {
  ReservationList: undefined;
  ReservationDetail: { reservationId: string };
  CreateReservation: undefined;
};

type ReservationScreenNavigationProp = NativeStackNavigationProp<ReservationStackParamList>;

const ReservationListScreen = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const navigation = useNavigation<ReservationScreenNavigationProp>();
  const { user } = useAuth();

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
      applyFilters(response.data, searchQuery, statusFilter);
    } catch (err) {
      setError('Failed to load reservations');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const applyFilters = (data: Reservation[], query: string, status: ReservationStatus | 'ALL') => {
    let result = [...data];
    
    // Apply search query
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      result = result.filter(item => 
        item.guest.name.toLowerCase().includes(lowercasedQuery) ||
        item.guest.email.toLowerCase().includes(lowercasedQuery) ||
        item.roomNumber?.toString().includes(lowercasedQuery) ||
        item.confirmationCode?.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    // Apply status filter
    if (status !== 'ALL') {
      result = result.filter(item => item.status === status);
    }
    
    // Apply sorting (newest first by default)
    result.sort((a, b) => {
      const dateA = new Date(a.checkInDate).getTime();
      const dateB = new Date(b.checkInDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredReservations(result);
  };

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(reservations, query, statusFilter);
  };

  const onFilterStatus = (status: ReservationStatus | 'ALL') => {
    setStatusFilter(status);
    applyFilters(reservations, searchQuery, status);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    applyFilters(reservations, searchQuery, statusFilter);
  };

  const openReservationDetail = (reservation: Reservation) => {
    navigation.navigate('ReservationDetail', { reservationId: reservation.id });
  };

  const navigateToCreateReservation = () => {
    navigation.navigate('CreateReservation');
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

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <Card style={styles.card} onPress={() => openReservationDetail(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">{item.guest.name}</Text>
          <Chip
            mode="flat"
            textStyle={{ color: '#fff' }}
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.dateContainer}>
          <View>
            <Text variant="labelMedium">Check In</Text>
            <Text>{format(new Date(item.checkInDate), 'MMM dd, yyyy')}</Text>
          </View>
          <View>
            <Text variant="labelMedium">Check Out</Text>
            <Text>{format(new Date(item.checkOutDate), 'MMM dd, yyyy')}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <Text variant="bodyMedium">
            Room {item.roomNumber || 'TBD'} · {item.adults + item.children} Guest{item.adults + item.children !== 1 ? 's' : ''}
          </Text>
          <Text variant="bodyMedium">
            #{item.confirmationCode}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      <Chip
        selected={statusFilter === 'ALL'}
        onPress={() => onFilterStatus('ALL')}
        style={styles.filterChip}
      >
        All
      </Chip>
      <Chip
        selected={statusFilter === ReservationStatus.PENDING}
        onPress={() => onFilterStatus(ReservationStatus.PENDING)}
        style={styles.filterChip}
      >
        Pending
      </Chip>
      <Chip
        selected={statusFilter === ReservationStatus.CONFIRMED}
        onPress={() => onFilterStatus(ReservationStatus.CONFIRMED)}
        style={styles.filterChip}
      >
        Confirmed
      </Chip>
      <Chip
        selected={statusFilter === ReservationStatus.CHECKED_IN}
        onPress={() => onFilterStatus(ReservationStatus.CHECKED_IN)}
        style={styles.filterChip}
      >
        Checked In
      </Chip>
      <Chip
        selected={statusFilter === ReservationStatus.CHECKED_OUT}
        onPress={() => onFilterStatus(ReservationStatus.CHECKED_OUT)}
        style={styles.filterChip}
      >
        Checked Out
      </Chip>
      <Chip
        selected={statusFilter === ReservationStatus.CANCELLED}
        onPress={() => onFilterStatus(ReservationStatus.CANCELLED)}
        style={styles.filterChip}
      >
        Cancelled
      </Chip>
    </ScrollView>
  );

  const renderHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search reservations"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="sort"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            title="Newest First" 
            onPress={() => {
              setSortOrder('desc');
              applyFilters(reservations, searchQuery, statusFilter);
              setMenuVisible(false);
            }}
            leadingIcon="sort-calendar-descending"
          />
          <Menu.Item 
            title="Oldest First" 
            onPress={() => {
              setSortOrder('asc');
              applyFilters(reservations, searchQuery, statusFilter);
              setMenuVisible(false);
            }}
            leadingIcon="sort-calendar-ascending"
          />
        </Menu>
      </View>
      {renderFilterChips()}
    </>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge">{error}</Text>
        <Button mode="contained" onPress={fetchReservations} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={filteredReservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No reservations found</Text>
          </View>
        }
      />
      
      {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF) && (
        <Button 
          mode="contained" 
          icon="plus" 
          onPress={navigateToCreateReservation}
          style={styles.fab}
        >
          New Reservation
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Add padding for FAB
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
  retryButton: {
    marginTop: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
});

export default ReservationListScreen;