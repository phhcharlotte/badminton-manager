// src/api/booking.api.ts
import { apiClient } from "./axiosClient";
import { Booking, BookingStatus } from "@/types/Booking";

export const getAvailabilityApi = async (courtId: string, date: string) => {
  const { data } = await apiClient.get("/bookings/availability", {
    params: { courtId, date },
  });
  return data.data.bookedSlots as string[];
};

export interface CreateBookingPayload {
  courtId: string;
  date: string;
  slots: string[];
  notes?: string;
}

export const createBookingApi = async (payload: CreateBookingPayload) => {
  const { data } = await apiClient.post("/bookings", payload);
  return data.data.booking as Booking;
};

export const listMyBookingsApi = async () => {
  const { data } = await apiClient.get("/bookings/me");
  return data.data.bookings as Booking[];
};

export const cancelMyBookingApi = async (id: string) => {
  const { data } = await apiClient.patch(`/bookings/${id}/cancel`);
  return data.data.booking as Booking;
};

export const listAllBookingsApi = async (params?: {
  status?: BookingStatus;
  date?: string;
  courtId?: string;
}) => {
  const { data } = await apiClient.get("/bookings", { params });
  return data.data.bookings as Booking[];
};

export const updateBookingStatusApi = async (
  id: string,
  status: "confirmed" | "cancelled" | "completed",
  cancelReason?: string,
) => {
  const { data } = await apiClient.patch(`/bookings/${id}/status`, {
    status,
    cancelReason,
  });
  return data.data.booking as Booking;
};
