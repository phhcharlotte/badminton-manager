// src/hooks/useBookingSocketEvents.ts
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useBookingStore } from "@/store/bookingStore";
import { Booking } from "@/types/Booking/index";

/**
 * Goi 1 lan duy nhat o App.tsx (khi da dang nhap). Lang nghe cac su kien booking
 * tu BE va tu dong cap nhat bookingStore - moi trang doc tu store (HistoryPage,
 * ManageBookingsPage, DashboardPage...) se TU DONG re-render khi co du lieu moi,
 * khong can F5 hay tu goi lai API.
 */
export const useBookingSocketEvents = (enabled: boolean) => {
  const upsertBookingRealtime = useBookingStore((s) => s.upsertBookingRealtime);

  useEffect(() => {
    if (!enabled) return;
    const socket = getSocket();
    if (!socket) return;

    const handleBookingEvent = (payload: { booking: Booking }) => {
      upsertBookingRealtime(payload.booking);
    };

    socket.on("booking:new", handleBookingEvent);
    socket.on("booking:updated", handleBookingEvent);

    return () => {
      socket.off("booking:new", handleBookingEvent);
      socket.off("booking:updated", handleBookingEvent);
    };
  }, [enabled, upsertBookingRealtime]);
};
