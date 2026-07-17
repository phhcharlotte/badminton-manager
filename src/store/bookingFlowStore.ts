import { create } from "zustand";
import { Court } from "@/types/Courts";
import { Booking, BookingType } from "@/types/Booking";

export type BookingFlowView = "intro" | "catalog" | "detail" | "payment";

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

  goToIntro: () => set({ view: "intro", createdBooking: null }),
  // FIX: xoa createdBooking moi lan quay lai danh sach, tranh QR cu bi ket dinh lai
  goToCatalog: () => set({ view: "catalog", createdBooking: null }),
  selectCourt: (court) =>
    set({
      view: "detail",
      selectedCourt: court,
      selectedDate: todayStr(),
      selectedSlots: [],
      bookingType: null,
      createdBooking: null, // FIX: xoa don cu khi bat dau chon san moi
    }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [] }),
  setSelectedSlots: (slots) => set({ selectedSlots: slots }),
  setBookingType: (t) => set({ bookingType: t }),
  setNotes: (notes) => set({ notes }),
  goToPayment: () => set({ view: "payment" }),
  // FIX: KHONG con "view: 'done'" nua - BookingFlowPage khong co nhanh xu ly view nay,
  // truoc day khien man QR bi tu dong chuyen ve CourtsCatalogView ngay khi vua tao xong don.
  setCreatedBooking: (b) => set({ createdBooking: b }),
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
