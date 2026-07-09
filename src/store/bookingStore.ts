// src/store/bookingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Booking, BookingStatus } from '../types';
import { INITIAL_BOOKINGS } from '../data/mockData';

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByCourt: (courtId: string, date: string) => Booking[];
  getBookedTimeSlots: (courtId: string, date: string) => string[];
  getAllBookings: () => Booking[];
  cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: INITIAL_BOOKINGS,

      addBooking: (bookingData) => {
        const newBooking: Booking = {
          ...bookingData,
          id: `b${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bookings: [...state.bookings, newBooking] }));
        return newBooking;
      },

      updateBookingStatus: (id, status) => {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        }));
      },

      getBookingsByUser: (userId) => {
        return get().bookings.filter((b) => b.userId === userId);
      },

      getBookingsByCourt: (courtId, date) => {
        return get().bookings.filter(
          (b) => b.courtId === courtId && b.date === date && b.status !== 'cancelled'
        );
      },

      getBookedTimeSlots: (courtId, date) => {
        const bookings = get().bookings.filter(
          (b) => b.courtId === courtId && b.date === date && b.status !== 'cancelled'
        );
        const slots: string[] = [];
        bookings.forEach((b) => {
          const startHour = parseInt(b.startTime.split(':')[0]);
          const endHour = parseInt(b.endTime.split(':')[0]);
          for (let h = startHour; h < endHour; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
          }
        });
        return slots;
      },

      getAllBookings: () => get().bookings,

      cancelBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b
          ),
        }));
      },
    }),
    { name: 'booking-store' }
  )
);
