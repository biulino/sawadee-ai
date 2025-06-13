import axios from 'axios';

const API_URL = 'http://172.20.10.14:8099/api';

// Hotel interfaces
export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string | null;
  description: string;
  pricePerNight: number;
  totalRooms: number | null;
  availableRooms: number | null;
}

// Room interfaces
export interface Room {
  id: number;
  roomNumber: string;
  name: string | null;
  capacity: number;
  type: string | null;
  description: string | null;
  pricePerNight: number | null;
  hasWifi: boolean | null;
  hasTV: boolean | null;
  hasBalcony: boolean | null;
  hasMinibar: boolean | null;
  floorNumber: number | null;
  bedCount: number | null;
  status: string | null;
  hotelId: number;
  hotelName: string;
}

// Reservation interface
export interface ReservationRequest {
  fullName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  specialRequests: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  hotelId: number;
  roomId: number;
  paymentMethod: string;
}

// API service
const apiService = {
  // Get hotel by ID
  getHotelById: async (id: number): Promise<Hotel> => {
    try {
      const response = await axios.get(`${API_URL}/hotels/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  },

  // Get hotels by city
  getHotelsByCity: async (city: string): Promise<Hotel[]> => {
    try {
      const response = await axios.get(`${API_URL}/hotels`, {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hotels by city:', error);
      throw error;
    }
  },

  // Get rooms by hotel ID
  getRoomsByHotelId: async (hotelId: number): Promise<Room[]> => {
    try {
      const response = await axios.get(`${API_URL}/rooms/hotel/${hotelId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Get available rooms by date range
  getAvailableRooms: async (hotelId: number, startDate: string, endDate: string): Promise<Room[]> => {
    try {
      const response = await axios.get(`${API_URL}/rooms/available`, {
        params: {
          hotelId,
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  },

  // Create reservation
  createReservation: async (reservationData: ReservationRequest): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/reservations`, reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }
};

export default apiService; 