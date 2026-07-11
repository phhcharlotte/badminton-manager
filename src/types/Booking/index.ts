import { CourtType } from "../Courts";

export const TIME_SLOTS: string[] = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  _id: string;
  user: string;
  userName: string;
  court: string;
  courtName: string;
  courtType: CourtType;
  date: string; // YYYY-MM-DD
  slots: string[];
  startTime: string;
  endTime: string;
  hours: number;
  pricePerHour: number;
  totalPrice: number;
  status: BookingStatus;
  notes: string;
  cancelledBy?: string | null;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}
