import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

// Type definitions for navigation
type CustomerTabParamList = {
  Book: undefined;
  MyReservations: undefined;
  Profile: undefined;
};

type CustomerReservationStackParamList = {
  MyReservationsList: undefined;
  ReservationDetail: { reservationId: string };
  BookConfirmation: undefined;
};

type BookingScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, 'Book'>,
  StackNavigationProp<CustomerReservationStackParamList>
>;

type BookingScreenRouteProp = RouteProp<
  { Book: undefined; BookConfirmation: undefined },
  'Book' | 'BookConfirmation'
>;

// Mock data for available time slots
const timeSlots = [
  '17:30', '18:00', '18:30', '19:00', '19:30', 
  '20:00', '20:30', '21:00', '21:30'
];

const BookingScreen = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const route = useRoute<BookingScreenRouteProp>();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [step, setStep] = useState(1); // 1: Select date & party size, 2: Select time, 3: Confirm

  const isConfirmationMode = route.name === 'BookConfirmation';

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!partySize || parseInt(partySize) < 1) {
        Alert.alert('Error', 'Please enter a valid party size');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedTime) {
        Alert.alert('Error', 'Please select a time slot');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Create the reservation object with the current date and time
      const reservation = {
        id: Math.random().toString(36).substring(2, 10),
        date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        time: selectedTime,
        partySize: parseInt(partySize),
        specialRequests,
        status: 'confirmed'
      };
      
      console.log('Creating reservation:', reservation);
      
      // Submit reservation
      Alert.alert(
        'Reservation Confirmed',
        'Your reservation has been successfully submitted!',
        [
          { 
            text: 'View My Reservations', 
            onPress: () => navigation.navigate('MyReservations')
          }
        ]
      );
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Date &amp; Party Size</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>{formatDate(date)}</Text>
          <Icon name="calendar" size={20} color="#2196F3" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Number of People</Text>
        <TextInput
          style={styles.input}
          value={partySize}
          onChangeText={setPartySize}
          placeholder="Enter party size"
          keyboardType="number-pad"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Time</Text>
      <Text style={styles.selectedInfo}>
        {formatDate(date)} • {partySize} {parseInt(partySize) === 1 ? 'person' : 'people'}
      </Text>
      
      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedTime === time && styles.selectedTimeSlot
            ]}
            onPress={() => handleTimeSelection(time)}
          >
            <Text 
              style={[
                styles.timeSlotText,
                selectedTime === time && styles.selectedTimeSlotText
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirm Your Reservation</Text>
      
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationHeader}>
          <Text style={styles.confirmationTitle}>Reservation Details</Text>
        </View>
        
        <View style={styles.confirmationDetails}>
          <View style={styles.confirmationRow}>
            <Icon name="calendar" size={20} color="#2196F3" />
            <Text style={styles.confirmationLabel}>Date:</Text>
            <Text style={styles.confirmationValue}>{formatDate(date)}</Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Icon name="clock-outline" size={20} color="#2196F3" />
            <Text style={styles.confirmationLabel}>Time:</Text>
            <Text style={styles.confirmationValue}>{selectedTime}</Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Icon name="account-group" size={20} color="#2196F3" />
            <Text style={styles.confirmationLabel}>Party:</Text>
            <Text style={styles.confirmationValue}>{partySize} {parseInt(partySize) === 1 ? 'person' : 'people'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Special Requests (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          placeholder="Any special requests or notes for your reservation"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {!isConfirmationMode && (
        <View style={styles.progressIndicator}>
          <View style={[styles.progressStep, step >= 1 && styles.activeStep]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, step >= 2 && styles.activeStep]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, step >= 3 && styles.activeStep]} />
        </View>
      )}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {(step === 3 || isConfirmationMode) && renderStep3()}
      
      {!isConfirmationMode && (
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.continueButton,
              { marginLeft: step > 1 ? 8 : 0 }
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {step === 3 ? 'Confirm Reservation' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  progressStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  activeStep: {
    backgroundColor: '#2196F3',
  },
  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  selectedInfo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timeSlot: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTimeSlot: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeSlotText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmationCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  confirmationHeader: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmationDetails: {
    padding: 15,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    width: 50,
  },
  confirmationValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
    marginTop: 5,
    marginBottom: 30,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BookingScreen;