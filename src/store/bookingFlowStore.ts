import { create } from "zustand";
import { Court } from "@/types/Courts";
import { Booking } from "@/types/Booking";
import { FixedDurationOption } from "@/apis/booking.api";

export type BookingFlowView = "catalog" | "detail" | "payment" | "done";

interface BookingFlowStore {
  view: BookingFlowView;
  selectedCourt: Court | null;
  selectedDate: string;
  selectedSlots: string[];
  selectedDuration: FixedDurationOption | null;
  notes: string;
  createdBooking: Booking | null;

  goToCatalog: () => void;
  selectCourt: (court: Court) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlots: (slots: string[]) => void;
  setSelectedDuration: (d: FixedDurationOption | null) => void;
  setNotes: (notes: string) => void;
  goToPayment: () => void;
  setCreatedBooking: (b: Booking) => void;
  reset: () => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export const useBookingFlowStore = create<BookingFlowStore>((set) => ({
  view: "catalog",
  selectedCourt: null,
  selectedDate: todayStr(),
  selectedSlots: [],
  selectedDuration: null,
  notes: "",
  createdBooking: null,

  goToCatalog: () => set({ view: "catalog" }),
  selectCourt: (court) =>
    set({
      view: "detail",
      selectedCourt: court,
      selectedDate: todayStr(),
      selectedSlots: [],
      selectedDuration: null,
    }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [] }),
  setSelectedSlots: (slots) => set({ selectedSlots: slots }),
  setSelectedDuration: (d) => set({ selectedDuration: d }),
  setNotes: (notes) => set({ notes }),
  goToPayment: () => set({ view: "payment" }),
  setCreatedBooking: (b) => set({ createdBooking: b, view: "done" }),
  reset: () =>
    set({
      view: "catalog",
      selectedCourt: null,
      selectedDate: todayStr(),
      selectedSlots: [],
      selectedDuration: null,
      notes: "",
      createdBooking: null,
    }),
}));
