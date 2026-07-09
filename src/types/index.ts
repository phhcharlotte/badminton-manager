// src/types/index.ts

export type UserRole = 'admin' | 'staff' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export type CourtType = 'fixed' | 'casual';

export interface Court {
  id: string;
  name: string;
  description: string;
  type: CourtType;
  pricePerHour: number;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TimeSlot {
  id: string;
  startTime: string; // "07:00"
  endTime: string;   // "08:00"
  isBooked: boolean;
  bookingId?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  courtId: string;
  courtName: string;
  date: string; // "2024-01-15"
  startTime: string;
  endTime: string;
  hours: number;
  totalPrice: number;
  status: BookingStatus;
  courtType: CourtType;
  pricePerHour: number;
  createdAt: string;
  notes?: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

export interface CourtStore {
  courts: Court[];
  addCourt: (court: Omit<Court, 'id' | 'createdAt'>) => void;
  updateCourt: (id: string, updates: Partial<Court>) => void;
  deleteCourt: (id: string) => void;
  updatePrice: (id: string, price: number) => void;
}

export interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByCourt: (courtId: string, date: string) => Booking[];
  getBookedSlots: (courtId: string, date: string) => string[];
}

export interface UserStore {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
}

export const TIME_SLOTS: string[] = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];
