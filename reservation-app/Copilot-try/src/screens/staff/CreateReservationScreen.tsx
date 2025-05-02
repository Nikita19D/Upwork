import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Switch,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CreateReservationScreen = ({ navigation }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [autoAssign, setAutoAssign] = useState(true);
  const [sendConfirmation, setSendConfirmation] = useState(true);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCreateReservation = () => {
    // Simple validation
    if (!customerName || !customerEmail || !customerPhone || !partySize) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // In a real app, you would call an API to create the reservation
    Alert.alert(
      'Success',
      'Reservation created successfully!',
      [
        { 
          text: 'OK', 
          onPress: () => navigation.goBack() 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer's full name"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="Enter customer's email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="Enter customer's phone number"
            keyboardType="phone-pad"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservation Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Party Size *</Text>
          <TextInput
            style={styles.input}
            value={partySize}
            onChangeText={setPartySize}
            placeholder="Number of guests"
            keyboardType="number-pad"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
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
          <Text style={styles.label}>Time *</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.datePickerText}>{formatTime(time)}</Text>
            <Icon name="clock-outline" size={20} color="#2196F3" />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
              minuteInterval={15}
            />
          )}
        </View>
        
        <View style={styles.toggleContainer}>
          <View>
            <Text style={styles.toggleLabel}>Auto-assign Table</Text>
            <Text style={styles.toggleDescription}>
              System will automatically assign an available table
            </Text>
          </View>
          <Switch
            value={autoAssign}
            onValueChange={(value) => {
              setAutoAssign(value);
              if (value) setTableNumber('');
            }}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={autoAssign ? "#2196F3" : "#f4f3f4"}
          />
        </View>
        
        {!autoAssign && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Table Number *</Text>
            <TextInput
              style={styles.input}
              value={tableNumber}
              onChangeText={setTableNumber}
              placeholder="Enter table number"
              keyboardType="number-pad"
            />
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Enter any special requests or notes"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.toggleContainer}>
          <View>
            <Text style={styles.toggleLabel}>Send Confirmation Email</Text>
            <Text style={styles.toggleDescription}>
              Send a confirmation email to the customer
            </Text>
          </View>
          <Switch
            value={sendConfirmation}
            onValueChange={setSendConfirmation}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={sendConfirmation ? "#2196F3" : "#f4f3f4"}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateReservation}
        >
          <Text style={styles.createButtonText}>Create Reservation</Text>
        </TouchableOpacity>
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 3,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
    marginTop: 5,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateReservationScreen;