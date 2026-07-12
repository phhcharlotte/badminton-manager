import React, { useEffect, useState } from "react";
import {
  Button,
  Chip,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InboxIcon from "@mui/icons-material/Inbox";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import { useBookingStore } from "@/store/bookingStore";
import { BookingStatus } from "@/types/Booking/index";
import { formatCurrency, formatDate } from "@/utils/helpers";
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

const ManageBookingsPage: React.FC = () => {
  const { allBookings, isLoading, fetchAllBookings, updateBookingStatus } =
    useBookingStore();
  const { notification, notify, close: closeNotif } = useNotification();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">(
    "all",
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [cancelDialog, setCancelDialog] = useState<{ id: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchAllBookings().catch(() =>
      notify("Không tải được danh sách đặt sân!", "error"),
    );
  }, []);

  const filtered = allBookings.filter((b) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      b.userName.toLowerCase().includes(keyword) ||
      b.courtName.toLowerCase().includes(keyword) ||
      b._id.toLowerCase().includes(keyword);
    return matchSearch && (filterStatus === "all" || b.status === filterStatus);
  });
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleConfirm = async (id: string) => {
    setProcessingId(id);
    const result = await updateBookingStatus(id, "confirmed");
    setProcessingId(null);
    notify(
      result.success ? "Đã xác nhận lịch đặt sân!" : result.message,
      result.success ? "success" : "error",
    );
  };

  const handleComplete = async (id: string) => {
    setProcessingId(id);
    const result = await updateBookingStatus(id, "completed");
    setProcessingId(null);
    notify(
      result.success ? "Đã đánh dấu hoàn thành!" : result.message,
      result.success ? "success" : "error",
    );
  };

  const openCancelDialog = (id: string) => {
    setCancelReason("");
    setCancelDialog({ id });
  };

  const handleCancelConfirm = async () => {
    if (!cancelDialog) return;
    setProcessingId(cancelDialog.id);
    const result = await updateBookingStatus(
      cancelDialog.id,
      "cancelled",
      cancelReason || undefined,
    );
    setProcessingId(null);
    setCancelDialog(null);
    notify(
      result.success ? "Đã huỷ lịch đặt sân." : result.message,
      result.success ? "warning" : "error",
    );
  };

  const totalRevenue = allBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">
          <AssessmentIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Quản lý đặt sân
        </div>
        <div className="page-subtitle">
          Xem và cập nhật trạng thái tất cả các lịch đặt sân
        </div>
      </div>

      <div className="stat-cards">
        {[
          {
            label: "Tổng cộng",
            value: allBookings.length,
            Icon: EventNoteIcon,
            bg: "#e8f5e9",
            ibg: "#c8e6c9",
            color: "#1a472a",
          },
          {
            label: "Chờ xác nhận",
            value: allBookings.filter((b) => b.status === "pending").length,
            Icon: HourglassEmptyIcon,
            bg: "#fef3c7",
            ibg: "#fde68a",
            color: "#b45309",
          },
          {
            label: "Đã xác nhận",
            value: allBookings.filter((b) => b.status === "confirmed").length,
            Icon: CheckCircleIcon,
            bg: "#d1fae5",
            ibg: "#a7f3d0",
            color: "#065f46",
          },
          {
            label: "Doanh thu",
            value: formatCurrency(totalRevenue),
            Icon: AttachMoneyIcon,
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
              <div
                className="stat-value"
                style={{
                  fontSize:
                    typeof s.value === "string" && s.value.length > 8 ? 15 : 28,
                }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <TextField
          size="small"
          placeholder="Tìm theo tên, sân, mã..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as BookingStatus | "all")
            }
            label="Trạng thái">
            <MenuItem value="all">Tất cả</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <MenuItem key={key} value={key}>
                <val.icon
                  fontSize="small"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                {val.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#718096" }}>
          {sorted.length} lịch đặt
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
              <InboxIcon sx={{ fontSize: 48, mb: 2, color: "#cbd5e1" }} />
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                Không có dữ liệu
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách hàng</th>
                    <th>Sân</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b) => {
                    const s = STATUS_CONFIG[b.status];
                    const isProcessing = processingId === b._id;
                    return (
                      <tr key={b._id}>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "#718096",
                            }}>
                            #{b._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.userName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.courtName}</div>
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
                            sx={{ mt: 0.5 }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatDate(b.date)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {b.startTime} – {b.endTime}
                          </div>
                          <div style={{ fontSize: 12, color: "#718096" }}>
                            {b.hours}h
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "#1a472a" }}>
                            {formatCurrency(b.totalPrice)}
                          </span>
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
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}>
                            {isProcessing ? (
                              <CircularProgress size={18} />
                            ) : (
                              <>
                                {b.status === "pending" && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={
                                        <CheckCircleIcon fontSize="small" />
                                      }
                                      onClick={() => handleConfirm(b._id)}
                                      sx={{ fontSize: 11 }}>
                                      Xác nhận
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={
                                        <CancelIcon fontSize="small" />
                                      }
                                      onClick={() => openCancelDialog(b._id)}
                                      sx={{ fontSize: 11 }}>
                                      Huỷ
                                    </Button>
                                  </>
                                )}
                                {b.status === "confirmed" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={
                                      <EmojiEventsIcon fontSize="small" />
                                    }
                                    onClick={() => handleComplete(b._id)}
                                    sx={{
                                      fontSize: 11,
                                      background: "#1a472a",
                                    }}>
                                    Hoàn thành
                                  </Button>
                                )}
                                {(b.status === "completed" ||
                                  b.status === "cancelled") && (
                                  <span
                                    style={{ fontSize: 12, color: "#9ca3af" }}>
                                    —
                                  </span>
                                )}
                              </>
                            )}
                          </div>
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
        open={!!cancelDialog}
        onClose={() => setCancelDialog(null)}
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
          <CancelIcon /> Huỷ lịch đặt sân
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Hành động này sẽ giải phóng khung giờ để khách khác có thể đặt lại.
          </Alert>
          <TextField
            fullWidth
            label="Lý do huỷ (tuỳ chọn)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            size="small"
            multiline
            rows={2}
            placeholder="VD: Sân bảo trì đột xuất, khách không phản hồi xác nhận..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCancelDialog(null)} color="inherit">
            Đóng
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelConfirm}>
            Xác nhận huỷ
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

export default ManageBookingsPage;
