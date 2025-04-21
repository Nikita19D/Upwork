import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Common Screens (available to all authenticated users)
import DashboardScreen from '../screens/common/DashboardScreen';

// Create placeholder components for missing screens
const ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile Screen</Text></View>;
const StaffManagementScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Staff Management Screen</Text></View>;
const SettingsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Settings Screen</Text></View>;
const ReservationListScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Reservation List Screen</Text></View>;
const ReservationDetailScreen = ({ route }) => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Reservation Detail Screen: {route.params?.reservationId}</Text></View>;
const CreateReservationScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Create Reservation Screen</Text></View>;
const MyReservationsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>My Reservations Screen</Text></View>;
const BookingScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Booking Screen</Text></View>;

// Icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define types for the navigation stacks
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

type AdminReservationStackParamList = {
  ReservationList: undefined;
  ReservationDetail: { reservationId: string };
  CreateReservation: undefined;
};

type StaffReservationStackParamList = {
  ReservationList: undefined;
  ReservationDetail: { reservationId: string };
  CreateReservation: undefined;
};

type CustomerReservationStackParamList = {
  MyReservationsList: undefined;
  ReservationDetail: { reservationId: string };
};

type AdminTabParamList = {
  Dashboard: undefined;
  Reservations: undefined;
  Staff: undefined;
  Settings: undefined;
  Profile: undefined;
};

type StaffTabParamList = {
  Dashboard: undefined;
  Reservations: undefined;
  Profile: undefined;
};

type CustomerTabParamList = {
  Book: undefined;
  MyReservations: undefined;
  Profile: undefined;
};

// Define stack navigator types
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator id={undefined} screenOptions={{ tabBarActiveTintColor: '#2196F3' }}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={AdminReservationStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Staff" 
        component={StaffManagementScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Reservation Stack
const AdminReservationStack = () => {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen name="ReservationList" component={ReservationListScreen} options={{ title: 'All Reservations' }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ title: 'Reservation Details' }} />
      <Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{ title: 'New Reservation' }} />
    </Stack.Navigator>
  );
};

// Staff Tab Navigator
const StaffTabNavigator = () => {
  return (
    <Tab.Navigator id={undefined} screenOptions={{ tabBarActiveTintColor: '#2196F3' }}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={StaffReservationStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Staff Reservation Stack
const StaffReservationStack = () => {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen name="ReservationList" component={ReservationListScreen} options={{ title: 'All Reservations' }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ title: 'Reservation Details' }} />
      <Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{ title: 'New Reservation' }} />
    </Stack.Navigator>
  );
};

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator 
      id={undefined}
      screenOptions={{ 
        tabBarActiveTintColor: '#2196F3' 
      }}
    >
      <Tab.Screen 
        name="Book" 
        component={BookingScreen}
        options={{
          title: 'Book a Table',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-plus" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="MyReservations" 
        component={CustomerReservationStack}
        options={{
          headerShown: false,
          title: 'My Reservations',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Customer Reservation Stack
const CustomerReservationStack = () => {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen name="MyReservationsList" component={MyReservationsScreen} options={{ title: 'My Reservations' }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ title: 'Reservation Details' }} />
      <Stack.Screen name="BookConfirmation" component={BookingScreen} options={{ title: 'Booking Confirmation' }} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, loading, initialized } = useAuth();
  
  if (loading || !initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : (
        <>
          {user.role === UserRole.ADMIN && <AdminTabNavigator />}
          {user.role === UserRole.STAFF && <StaffTabNavigator />}
          {user.role === UserRole.CUSTOMER && <CustomerTabNavigator />}
          {user.role !== UserRole.ADMIN && 
           user.role !== UserRole.STAFF && 
           user.role !== UserRole.CUSTOMER && <CustomerTabNavigator />}
        </>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;