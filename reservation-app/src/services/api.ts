import axios from 'axios';

const API_BASE_URL = 'https://api.example.com'; // Replace with your API base URL

export const fetchReservations = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reservations`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        throw error;
    }
};

export const createReservation = async (reservationData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/reservations`, reservationData);
        return response.data;
    } catch (error) {
        console.error('Error creating reservation:', error);
        throw error;
    }
};

export const updateReservation = async (id, reservationData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/reservations/${id}`, reservationData);
        return response.data;
    } catch (error) {
        console.error('Error updating reservation:', error);
        throw error;
    }
};

export const deleteReservation = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/reservations/${id}`);
    } catch (error) {
        console.error('Error deleting reservation:', error);
        throw error;
    }
};