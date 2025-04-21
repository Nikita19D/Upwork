import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock data for staff members
const mockStaffData = [
  { id: '1', name: 'John Smith', email: 'john.smith@example.com', role: 'waiter', status: 'active' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'waiter', status: 'active' },
  { id: '3', name: 'Michael Brown', email: 'michael.b@example.com', role: 'bodyguard', status: 'active' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@example.com', role: 'waiter', status: 'inactive' },
];

const StaffManagementScreen = () => {
  const [staff, setStaff] = useState(mockStaffData);

  const handleAddStaff = () => {
    // This would open a form to add a new staff member
    Alert.alert('Add Staff', 'This would open a form to add a new staff member');
  };

  const handleEditStaff = (staffId) => {
    // This would open a form to edit the staff member
    Alert.alert('Edit Staff', `This would open a form to edit staff with ID: ${staffId}`);
  };

  const handleToggleStatus = (staffId) => {
    // Toggle the staff member's status
    setStaff(currentStaff => {
      return currentStaff.map(member => {
        if (member.id === staffId) {
          return {
            ...member,
            status: member.status === 'active' ? 'inactive' : 'active'
          };
        }
        return member;
      });
    });
  };

  const renderStaffItem = ({ item }) => (
    <View style={styles.staffItem}>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffEmail}>{item.email}</Text>
        <View style={styles.roleStatusContainer}>
          <Text style={styles.staffRole}>{item.role}</Text>
          <Text style={[
            styles.staffStatus,
            item.status === 'active' ? styles.activeStatus : styles.inactiveStatus
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditStaff(item.id)}
        >
          <Icon name="pencil" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleToggleStatus(item.id)}
        >
          <Icon 
            name={item.status === 'active' ? 'close-circle' : 'check-circle'} 
            size={20} 
            color={item.status === 'active' ? '#FF3B30' : '#4CD964'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddStaff}
        >
          <Icon name="plus" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Staff</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={staff}
        renderItem={renderStaffItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  staffItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  staffEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  roleStatusContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  staffRole: {
    fontSize: 12,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    color: '#2196F3',
    textTransform: 'capitalize',
  },
  staffStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 5,
    textTransform: 'capitalize',
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  actionsContainer: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 5,
  },
});

export default StaffManagementScreen;