import { create } from "zustand";
import { Court } from "@/types/Courts";
import { Booking, BookingType } from "@/types/Booking";

export type BookingFlowView =
  | "intro"
  | "catalog"
  | "detail"
  | "payment"
  | "done";

interface BookingFlowStore {
  view: BookingFlowView;
  selectedCourt: Court | null;
  selectedDate: string;
  selectedSlots: string[];
  bookingType: BookingType | null;
  notes: string;
  createdBooking: Booking | null;

  goToIntro: () => void;
  goToCatalog: () => void;
  selectCourt: (court: Court) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlots: (slots: string[]) => void;
  setBookingType: (t: BookingType | null) => void;
  setNotes: (notes: string) => void;
  goToPayment: () => void;
  setCreatedBooking: (b: Booking) => void;
  reset: () => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export const useBookingFlowStore = create<BookingFlowStore>((set) => ({
  view: "intro",
  selectedCourt: null,
  selectedDate: todayStr(),
  selectedSlots: [],
  bookingType: null,
  notes: "",
  createdBooking: null,

  goToIntro: () => set({ view: "intro" }),
  goToCatalog: () => set({ view: "catalog" }),
  selectCourt: (court) =>
    set({
      view: "detail",
      selectedCourt: court,
      selectedDate: todayStr(),
      selectedSlots: [],
      bookingType: null,
    }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [] }),
  setSelectedSlots: (slots) => set({ selectedSlots: slots }),
  setBookingType: (t) => set({ bookingType: t }),
  setNotes: (notes) => set({ notes }),
  goToPayment: () => set({ view: "payment" }),
  setCreatedBooking: (b) => set({ createdBooking: b, view: "done" }),
  reset: () =>
    set({
      view: "intro",
      selectedCourt: null,
      selectedDate: todayStr(),
      selectedSlots: [],
      bookingType: null,
      notes: "",
      createdBooking: null,
    }),
}));
