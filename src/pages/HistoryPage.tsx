import React, { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InboxIcon from "@mui/icons-material/Inbox";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import { useBookingStore } from "@/store/bookingStore";
import { BookingStatus } from "@/types/Booking";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/helpers";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";

type StatusConfigMap = Record<
  BookingStatus,
  { label: string; icon: React.ElementType; cls: string }
>;

const STATUS_CONFIG: StatusConfigMap = {
  pending: { label: "Chờ xác nhận", icon: HourglassEmptyIcon, cls: "pending" },
  confirmed: { label: "Đã xác nhận", icon: CheckCircleIcon, cls: "confirmed" },
  cancelled: { label: "Đã huỷ", icon: CancelIcon, cls: "cancelled" },
  completed: { label: "Hoàn thành", icon: EmojiEventsIcon, cls: "completed" },
};

const HistoryPage: React.FC = () => {
  const { myBookings, isLoading, fetchMyBookings, cancelBooking } =
    useBookingStore();
  const { notification, notify, close: closeNotif } = useNotification();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">(
    "all",
  );

  useEffect(() => {
    fetchMyBookings().catch(() =>
      notify("Không tải được lịch sử đặt sân!", "error"),
    );
  }, []);

  const sorted = [...myBookings]
    .filter((b) => filterStatus === "all" || b.status === filterStatus)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    const result = await cancelBooking(cancelId);
    setCancelling(false);
    setCancelId(null);
    notify(result.message, result.success ? "info" : "error");
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">
          <EventNoteIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Lịch sử đặt sân
        </div>
        <div className="page-subtitle">
          Theo dõi và quản lý các lần đặt sân của bạn
        </div>
      </div>

      <div
        className="stat-cards"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
        {[
          {
            label: "Tổng đặt",
            value: myBookings.length,
            Icon: EventNoteIcon,
            bg: "#e8f5e9",
            ibg: "#c8e6c9",
            color: "#1a472a",
          },
          {
            label: "Chờ xác nhận",
            value: myBookings.filter((b) => b.status === "pending").length,
            Icon: HourglassEmptyIcon,
            bg: "#fef3c7",
            ibg: "#fde68a",
            color: "#b45309",
          },
          {
            label: "Đã xác nhận",
            value: myBookings.filter((b) => b.status === "confirmed").length,
            Icon: CheckCircleIcon,
            bg: "#d1fae5",
            ibg: "#a7f3d0",
            color: "#065f46",
          },
          {
            label: "Hoàn thành",
            value: myBookings.filter((b) => b.status === "completed").length,
            Icon: EmojiEventsIcon,
            bg: "#dbeafe",
            ibg: "#bfdbfe",
            color: "#1e40af",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label} style={{ background: s.bg }}>
            <div className="stat-icon" style={{ background: s.ibg }}>
              <s.Icon sx={{ color: s.color }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <span style={{ fontSize: 13, fontWeight: 600, color: "#4a5568" }}>
          Lọc:
        </span>
        {(
          ["all", "pending", "confirmed", "completed", "cancelled"] as const
        ).map((s) => {
          const conf = s !== "all" ? STATUS_CONFIG[s as BookingStatus] : null;
          return (
            <Chip
              key={s}
              icon={conf ? <conf.icon fontSize="small" /> : undefined}
              label={s === "all" ? "Tất cả" : conf!.label}
              variant={filterStatus === s ? "filled" : "outlined"}
              color={filterStatus === s ? "success" : "default"}
              onClick={() => setFilterStatus(s)}
              size="small"
              sx={{ fontWeight: 600, cursor: "pointer" }}
            />
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#718096" }}>
          {sorted.length} lịch
        </span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
              }}>
              <CircularProgress size={28} />
            </div>
          ) : sorted.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
              }}>
              <InboxIcon sx={{ fontSize: 52, mb: 2, color: "#cbd5e1" }} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                Chưa có lịch đặt sân nào
              </div>
              <div style={{ fontSize: 14, marginTop: 6 }}>
                Hãy đặt sân ngay!
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Mã đặt</th>
                    <th>Sân</th>
                    <th>Ngày</th>
                    <th>Khung giờ</th>
                    <th>Loại</th>
                    <th>Tổng tiền</th>
                    <th>Đặt lúc</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b) => {
                    const s = STATUS_CONFIG[b.status];
                    return (
                      <tr key={b._id}>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "#718096",
                            }}>
                            #{b._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.courtName}</div>
                          <div style={{ fontSize: 12, color: "#718096" }}>
                            {formatCurrency(b.pricePerHour)}/giờ
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatDate(b.date)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {b.startTime} – {b.endTime}
                          </div>
                          <div style={{ fontSize: 12, color: "#718096" }}>
                            {b.hours} giờ
                          </div>
                        </td>
                        <td>
                          <Chip
                            icon={
                              b.courtType === "fixed" ? (
                                <StarIcon fontSize="small" />
                              ) : (
                                <BoltIcon fontSize="small" />
                              )
                            }
                            label={
                              b.courtType === "fixed" ? "Cố định" : "Vãng lai"
                            }
                            size="small"
                            color={b.courtType === "fixed" ? "warning" : "info"}
                            variant="outlined"
                          />
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              color: "#1a472a",
                              fontSize: 15,
                            }}>
                            {formatCurrency(b.totalPrice)}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "#718096" }}>
                          {formatDateTime(b.createdAt)}
                        </td>
                        <td>
                          <span className={`status-badge ${s.cls}`}>
                            <s.icon
                              fontSize="small"
                              sx={{ verticalAlign: "middle", mr: 0.5 }}
                            />
                            {s.label}
                          </span>
                        </td>
                        <td>
                          {b.status === "pending" ? (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => setCancelId(b._id)}
                              sx={{ fontSize: 12 }}>
                              Huỷ
                            </Button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#d1d5db" }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          <WarningAmberIcon /> Xác nhận huỷ
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Bạn có chắc muốn huỷ lịch đặt sân này không?
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setCancelId(null)}
            color="inherit"
            disabled={cancelling}>
            Không
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={cancelling}
            sx={{ fontWeight: 700 }}>
            {cancelling ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Xác nhận huỷ"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar
        open={notification.open}
        msg={notification.msg}
        type={notification.type}
        onClose={closeNotif}
      />
    </div>
  );
};

export default HistoryPage;
