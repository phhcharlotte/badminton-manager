// src/hooks/useBookingSocketEvents.ts
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useBookingStore } from "@/store/bookingStore";
import { Booking } from "@/types/Booking/index";

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
