import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, Card, Title } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { Room, RoomType } from '../../types/room';
import { handleApiError, extractValidationErrors } from '../../utils/apiUtils';

interface ReservationFormData {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  specialRequests?: string;
}

interface FormErrors {
  [key: string]: string;
}

const CreateReservationScreen = ({ route, navigation }) => {
  const { roomId, roomDetails } = route.params || {};
  
  const initialFormData: ReservationFormData = {
    roomId: roomId || '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 86400000), // Tomorrow
    adults: 1,
    children: 0,
    specialRequests: '',
  };

  const [formData, setFormData] = useState<ReservationFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const handleInputChange = (field: keyof ReservationFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error for this field when user edits
    if (formErrors[field]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[field];
      setFormErrors(updatedErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.guestName.trim()) {
      errors.guestName = 'Name is required';
    }
    
    if (!formData.guestEmail.trim()) {
      errors.guestEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      errors.guestEmail = 'Email is invalid';
    }
    
    if (!formData.guestPhone.trim()) {
      errors.guestPhone = 'Phone number is required';
    }
    
    if (formData.checkInDate >= formData.checkOutDate) {
      errors.checkOutDate = 'Check-out date must be after check-in date';
    }
    
    if (formData.adults < 1) {
      errors.adults = 'At least 1 adult is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format dates for API
      const reservationData = {
        ...formData,
        checkInDate: format(formData.checkInDate, 'yyyy-MM-dd'),
        checkOutDate: format(formData.checkOutDate, 'yyyy-MM-dd'),
      };
      
      const response = await api.post('/reservations', reservationData);
      
      Alert.alert(
        'Success',
        'Your reservation has been created successfully!',
        [
          { 
            text: 'View My Reservations', 
            onPress: () => navigation.navigate('MyReservations') 
          },
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Home') 
          }
        ]
      );
      
    } catch (error) {
      // Get a user-friendly error message
      const errorMessage = handleApiError(error);
      
      // Display general error message
      Alert.alert('Error', errorMessage);
      
      // Extract and display field-specific validation errors
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(prev => ({ ...prev, ...validationErrors }));
      }
      
    } finally {
      setLoading(false);
    }
  };

  const onCheckInDateChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      handleInputChange('checkInDate', selectedDate);
    }
  };

  const onCheckOutDateChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      handleInputChange('checkOutDate', selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Create New Reservation</Title>
          
          {roomDetails && (
            <View style={styles.roomInfoContainer}>
              <Text style={styles.roomInfoText}>
                Room: {roomDetails.type} #{roomDetails.number}
              </Text>
              <Text style={styles.roomInfoText}>
                Price: ${roomDetails.pricePerNight}/night
              </Text>
            </View>
          )}
          
          <TextInput
            label="Guest Name"
            value={formData.guestName}
            onChangeText={(value) => handleInputChange('guestName', value)}
            mode="outlined"
            style={styles.input}
            error={!!formErrors.guestName}
          />
          {formErrors.guestName && (
            <HelperText type="error">{formErrors.guestName}</HelperText>
          )}
          
          <TextInput
            label="Email"
            value={formData.guestEmail}
            onChangeText={(value) => handleInputChange('guestEmail', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            error={!!formErrors.guestEmail}
          />
          {formErrors.guestEmail && (
            <HelperText type="error">{formErrors.guestEmail}</HelperText>
          )}
          
          <TextInput
            label="Phone Number"
            value={formData.guestPhone}
            onChangeText={(value) => handleInputChange('guestPhone', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            error={!!formErrors.guestPhone}
          />
          {formErrors.guestPhone && (
            <HelperText type="error">{formErrors.guestPhone}</HelperText>
          )}
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Check-in Date:</Text>
            <Button 
              mode="outlined" 
              onPress={() => setShowCheckInPicker(true)}
              style={styles.dateButton}
            >
              {format(formData.checkInDate, 'MMM dd, yyyy')}
            </Button>
          </View>
          
          {showCheckInPicker && (
            <DateTimePicker
              value={formData.checkInDate}
              mode="date"
              display="default"
              onChange={onCheckInDateChange}
              minimumDate={new Date()}
            />
          )}
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Check-out Date:</Text>
            <Button 
              mode="outlined" 
              onPress={() => setShowCheckOutPicker(true)}
              style={[
                styles.dateButton,
                formErrors.checkOutDate ? styles.errorButton : null
              ]}
            >
              {format(formData.checkOutDate, 'MMM dd, yyyy')}
            </Button>
          </View>
          
          {formErrors.checkOutDate && (
            <HelperText type="error">{formErrors.checkOutDate}</HelperText>
          )}
          
          {showCheckOutPicker && (
            <DateTimePicker
              value={formData.checkOutDate}
              mode="date"
              display="default"
              onChange={onCheckOutDateChange}
              minimumDate={new Date(formData.checkInDate.getTime() + 86400000)}
            />
          )}
          
          <View style={styles.guestsContainer}>
            <Text style={styles.guestsLabel}>Number of Guests:</Text>
            
            <View style={styles.counterContainer}>
              <Text style={styles.counterLabel}>Adults:</Text>
              <Button 
                mode="contained" 
                compact 
                onPress={() => handleInputChange('adults', Math.max(1, formData.adults - 1))}
              >
                -
              </Button>
              <Text style={styles.counterValue}>{formData.adults}</Text>
              <Button 
                mode="contained" 
                compact 
                onPress={() => handleInputChange('adults', formData.adults + 1)}
              >
                +
              </Button>
            </View>
            
            <View style={styles.counterContainer}>
              <Text style={styles.counterLabel}>Children:</Text>
              <Button 
                mode="contained" 
                compact 
                onPress={() => handleInputChange('children', Math.max(0, formData.children - 1))}
              >
                -
              </Button>
              <Text style={styles.counterValue}>{formData.children}</Text>
              <Button 
                mode="contained" 
                compact 
                onPress={() => handleInputChange('children', formData.children + 1)}
              >
                +
              </Button>
            </View>
          </View>
          
          <TextInput
            label="Special Requests (Optional)"
            value={formData.specialRequests || ''}
            onChangeText={(value) => handleInputChange('specialRequests', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
          
          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
          >
            Complete Reservation
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateLabel: {
    flex: 1,
    fontSize: 16,
  },
  dateButton: {
    flex: 2,
  },
  errorButton: {
    borderColor: 'red',
  },
  guestsContainer: {
    marginVertical: 10,
  },
  guestsLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  counterLabel: {
    flex: 1,
    fontSize: 16,
  },
  counterValue: {
    marginHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 10,
    padding: 8,
  },
  roomInfoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  roomInfoText: {
    fontSize: 14,
  },
});

export default CreateReservationScreen;