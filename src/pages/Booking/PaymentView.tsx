// src/pages/booking-flow/PaymentView.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, Alert, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import dayjs from "dayjs";
import { useBookingFlowStore } from "@/store/bookingFlowStore";
import { useBookingStore } from "@/store/bookingStore";
import { formatCurrency } from "@/utils/helpers";
import { buildVietQrUrl } from "@/config/payment";

interface Props {
  onDone: () => void;
}

const PaymentView: React.FC<Props> = ({ onDone }) => {
  const {
    selectedCourt,
    selectedDate,
    selectedSlots,
    bookingType,
    notes,
    createdBooking,
    setCreatedBooking,
    goToCatalog,
    reset,
  } = useBookingFlowStore();
  const { createBooking } = useBookingStore();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const hasCreatedRef = useRef(false);

  useEffect(() => {
    if (
      createdBooking ||
      hasCreatedRef.current ||
      !selectedCourt ||
      !bookingType
    )
      return;
    hasCreatedRef.current = true;

    const create = async () => {
      setCreating(true);
      setError("");
      const result = await createBooking({
        courtId: selectedCourt._id,
        date: selectedDate,
        slots: selectedSlots,
        bookingType,
        notes,
      });

      setCreating(false);
      if (result.success && result.booking) {
        setCreatedBooking(result.booking);
      } else {
        setError(result.message);
        hasCreatedRef.current = false;
      }
    };

    create();
  }, []); // eslint-disable-line

  if (creating) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 16,
        }}>
        <CircularProgress />
        <div style={{ color: "#718096" }}>
          Đang giữ chỗ khung giờ của bạn...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={goToCatalog}
          sx={{ background: "#1a472a" }}>
          Quay lại chọn sân khác
        </Button>
      </div>
    );
  }

  if (!createdBooking) return null;

  const qrUrl = buildVietQrUrl(
    createdBooking.totalPrice,
    `DatSan ${createdBooking._id.slice(-8).toUpperCase()}`,
  );

  return (
    <div className="fade-in-up">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={goToCatalog}
        sx={{ mb: 2, color: "#1a472a", fontWeight: 700 }}>
        Về danh sách sân
      </Button>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="card">
          <div className="card-header">
            <QrCode2Icon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Thanh toán đặt sân
          </div>
          <div className="card-body">
            <div className="booking-summary" style={{ marginBottom: 20 }}>
              <div className="summary-row">
                <span className="summary-label">Sân</span>
                <span className="summary-value">
                  {createdBooking.courtName}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Loại giá</span>
                <span className="summary-value">
                  <Chip
                    size="small"
                    icon={
                      createdBooking.bookingType === "fixed" ? (
                        <StarIcon />
                      ) : (
                        <BoltIcon />
                      )
                    }
                    label={
                      createdBooking.bookingType === "fixed"
                        ? "Cố định"
                        : "Vãng lai"
                    }
                    color={
                      createdBooking.bookingType === "fixed"
                        ? "warning"
                        : "info"
                    }
                  />
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Ngày</span>
                <span className="summary-value">
                  {dayjs(createdBooking.date).format("DD/MM/YYYY")}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Khung giờ</span>
                <span className="summary-value">
                  {createdBooking.startTime} – {createdBooking.endTime} (
                  {createdBooking.hours}h)
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Đơn giá</span>
                <span className="summary-value">
                  {formatCurrency(createdBooking.pricePerHour)}/giờ
                </span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Số tiền cần thanh toán</span>
                <span className="summary-value">
                  {formatCurrency(createdBooking.totalPrice)}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <img
                src={qrUrl}
                alt="QR thanh toán"
                style={{
                  width: 260,
                  height: 260,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                }}
              />
              <div style={{ fontSize: 13, color: "#718096", marginTop: 10 }}>
                Quét mã bằng app ngân hàng — số tiền và nội dung đã được điền
                sẵn
              </div>
            </div>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Sau khi chuyển khoản, bấm nút bên dưới. Nhân viên sẽ đối chiếu và
              xác nhận đơn trong ít phút.
            </Alert>

            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                reset();
                onDone();
              }}
              sx={{
                background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
                fontWeight: 800,
                py: 1.5,
                fontSize: 15,
                "&:hover": { background: "#0d2614" },
              }}>
              Tôi đã thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
