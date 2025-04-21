// Define room types
export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  EXECUTIVE = 'EXECUTIVE',
  FAMILY = 'FAMILY'
}

// Define room amenities
export enum RoomAmenity {
  WIFI = 'WIFI',
  AIR_CONDITIONING = 'AIR_CONDITIONING',
  TV = 'TV',
  MINIBAR = 'MINIBAR',
  SAFE = 'SAFE',
  BALCONY = 'BALCONY',
  OCEAN_VIEW = 'OCEAN_VIEW',
  KITCHEN = 'KITCHEN',
  JACUZZI = 'JACUZZI'
}

// Room status
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
  RESERVED = 'RESERVED'
}

// Room interface
export interface Room {
  id: string;
  number: number;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  capacity: {
    adults: number;
    children: number;
  };
  amenities: RoomAmenity[];
  pricePerNight: number;
  description?: string;
  images?: string[];
}

// Room search params interface
export interface RoomSearchParams {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomType?: RoomType;
  amenities?: RoomAmenity[];
  priceMin?: number;
  priceMax?: number;
}

// Room availability result
export interface RoomAvailability {
  room: Room;
  isAvailable: boolean;
  availableDates?: {
    from: string;
    to: string;
  }[];
}