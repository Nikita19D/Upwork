// Define reservation statuses
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Venue {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
}

export interface Reservation {
  id: string;
  guest: Guest;
  roomNumber?: number;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  confirmationCode?: string;
  specialRequests?: string;
  cancellationReason?: string;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
  venue?: Venue;
}