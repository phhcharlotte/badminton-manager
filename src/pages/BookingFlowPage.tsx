// src/pages/BookingFlowPage.tsx
import React from "react";
import { useBookingFlowStore } from "@/store/bookingFlowStore";
import IntroLandingView from "./Booking/IntroLandingView";
import CourtsCatalogView from "./Booking/CourtsCatalogView";
import CourtDetailView from "./Booking/CourtDetailView";
import PaymentView from "./Booking/PaymentView";

interface Props {
  onCompleted?: () => void;
  /** true khi dung ben trong app da dang nhap (trang "booking" cho customer) - bo qua man intro */
  skipIntro?: boolean;
}

const BookingFlowPage: React.FC<Props> = ({ onCompleted, skipIntro }) => {
  const view = useBookingFlowStore((s) => s.view);

  if (view === "intro" && !skipIntro) return <IntroLandingView />;
  if (view === "intro" && skipIntro) return <CourtsCatalogView />;
  if (view === "detail") return <CourtDetailView />;
  if (view === "payment") return <PaymentView onDone={() => onCompleted?.()} />;
  return <CourtsCatalogView />;
};

export default BookingFlowPage;
