import React from "react";
import { useBookingFlowStore } from "@/store/bookingFlowStore";
import CourtsCatalogView from "./Booking/CourtsCatalogView";
import CourtDetailView from "./Booking/CourtDetailView";
import PaymentView from "./Booking/PaymentView";

interface Props {
  onCompleted?: () => void;
}

const BookingFlowPage: React.FC<Props> = ({ onCompleted }) => {
  const view = useBookingFlowStore((s) => s.view);

  if (view === "detail") return <CourtDetailView />;
  if (view === "payment") return <PaymentView onDone={() => onCompleted?.()} />;
  return <CourtsCatalogView />;
};

export default BookingFlowPage;
