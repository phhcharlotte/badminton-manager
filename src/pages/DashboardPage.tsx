// src/pages/DashboardPage.tsx
import React, { useEffect } from "react";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TodayIcon from "@mui/icons-material/Today";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import GroupsIcon from "@mui/icons-material/Groups";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ListAltIcon from "@mui/icons-material/ListAlt";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useBookingStore } from "@/store/bookingStore";
import { useCourtStore } from "@/store/courtStore";
import { useAuthStore } from "@/store/authStore";
import { BookingStatus } from "@/types/Booking";
import { formatCurrency, formatDate } from "@/utils/helpers";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";

type StatusConfigMap = Record<
  BookingStatus,
  { label: string; icon: React.ElementType; cls: string; barColor: string }
>;

const STATUS_CONFIG: StatusConfigMap = {
  pending: {
    label: "Chờ xác nhận",
    icon: HourglassEmptyIcon,
    cls: "pending",
    barColor: "#f59e0b",
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: CheckCircleIcon,
    cls: "confirmed",
    barColor: "#22c55e",
  },
  cancelled: {
    label: "Đã huỷ",
    icon: CancelIcon,
    cls: "cancelled",
    barColor: "#ef4444",
  },
  completed: {
    label: "Hoàn thành",
    icon: EmojiEventsIcon,
    cls: "completed",
    barColor: "#3b82f6",
  },
};

const DashboardPage: React.FC = () => {
  const { allBookings, isLoading, fetchAllBookings, updateBookingStatus } =
    useBookingStore();
  const { courts, fetchCourts } = useCourtStore();
  const { users, currentUser, fetchUsers } = useAuthStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchAllBookings().catch(() =>
      notify("Không tải được dữ liệu đặt sân!", "error"),
    );
    fetchCourts();
    // Danh sach nguoi dung (de dem so khach hang) chi admin duoc phep goi -
    // manager se bi BE tra 403 neu goi, nen chi fetch khi la admin.
    if (isAdmin) {
      fetchUsers("customer").catch(() => {});
    }
  }, []); // eslint-disable-line

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = allBookings.filter(
    (b) => b.date === today && b.status !== "cancelled",
  );
  const revenue = allBookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + b.totalPrice, 0);
  const recentBookings = [...allBookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const customerCount = isAdmin
    ? users.filter((u) => u.role === "customer").length
    : null;

  const handleStatus = async (
    id: string,
    status: "confirmed" | "cancelled" | "completed",
  ) => {
    const result = await updateBookingStatus(id, status);
    const labels: Record<string, string> = {
      confirmed: "Đã xác nhận lịch đặt sân!",
      cancelled: "Đã huỷ lịch đặt sân.",
      completed: "Đã đánh dấu hoàn thành!",
    };
    notify(
      result.success ? labels[status] : result.message,
      result.success
        ? status === "cancelled"
          ? "warning"
          : "success"
        : "error",
    );
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">
          <DashboardIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Tổng quan hệ thống
        </div>
        <div className="page-subtitle">
          Xin chào, <strong>{currentUser?.fullName}</strong>! Đây là tình trạng
          hôm nay.
        </div>
      </div>

      <div className="stat-cards">
        {[
          {
            label: "Tổng đặt sân",
            value: allBookings.length,
            Icon: EventNoteIcon,
            bg: "#e8f5e9",
            ibg: "#c8e6c9",
            color: "#1a472a",
          },
          {
            label: "Đặt hôm nay",
            value: todayBookings.length,
            Icon: TodayIcon,
            bg: "#dbeafe",
            ibg: "#bfdbfe",
            color: "#1e40af",
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
            label: "Sân hoạt động",
            value: courts.filter((c) => c.isActive).length,
            Icon: SportsTennisIcon,
            bg: "#f3e8ff",
            ibg: "#e9d5ff",
            color: "#7c3aed",
          },
          {
            label: "Khách hàng",
            value: customerCount ?? "—",
            Icon: GroupsIcon,
            bg: "#fee2e2",
            ibg: "#fecaca",
            color: "#dc2626",
          },
          {
            label: "Doanh thu",
            value: formatCurrency(revenue),
            Icon: AttachMoneyIcon,
            bg: "#d1fae5",
            ibg: "#a7f3d0",
            color: "#065f46",
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
        {!isAdmin && (
          <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#9ca3af" }}>
            * Số liệu "Khách hàng" chỉ hiển thị đầy đủ với tài khoản Admin.
          </div>
        )}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <ListAltIcon
              sx={{ verticalAlign: "middle", mr: 1, fontSize: 20 }}
            />
            Lịch đặt gần đây
          </div>
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
            ) : recentBookings.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#718096",
                }}>
                Chưa có lịch đặt nào
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Khách hàng</th>
                      <th>Sân</th>
                      <th>Ngày / Giờ</th>
                      <th>Tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => {
                      const s = STATUS_CONFIG[b.status];
                      return (
                        <tr key={b._id}>
                          <td>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: 11,
                                color: "#9ca3af",
                              }}>
                              #{b._id.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{b.userName}</td>
                          <td>{b.courtName}</td>
                          <td>
                            <div style={{ fontSize: 13 }}>
                              {formatDate(b.date)}
                            </div>
                            <div style={{ fontSize: 12, color: "#718096" }}>
                              {b.startTime} – {b.endTime}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: "#1a472a" }}>
                            {formatCurrency(b.totalPrice)}
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
                                gap: 5,
                                flexWrap: "wrap",
                              }}>
                              {b.status === "pending" && (
                                <>
                                  <Tooltip title="Xác nhận">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleStatus(b._id, "confirmed")
                                      }
                                      sx={{
                                        background: "#d1fae5",
                                        border: "1px solid #6ee7b7",
                                        color: "#065f46",
                                        borderRadius: 1.5,
                                      }}>
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Huỷ">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleStatus(b._id, "cancelled")
                                      }
                                      sx={{
                                        background: "#fee2e2",
                                        border: "1px solid #fca5a5",
                                        color: "#991b1b",
                                        borderRadius: 1.5,
                                      }}>
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {b.status === "confirmed" && (
                                <Tooltip title="Hoàn thành">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleStatus(b._id, "completed")
                                    }
                                    sx={{
                                      background: "#dbeafe",
                                      border: "1px solid #93c5fd",
                                      color: "#1e40af",
                                      borderRadius: 1.5,
                                    }}>
                                    <EmojiEventsIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
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

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <SportsTennisIcon
                sx={{ verticalAlign: "middle", mr: 1, fontSize: 20 }}
              />
              Tình trạng sân hôm nay
            </div>
            <div className="card-body">
              {courts
                .filter((c) => c.isActive)
                .map((court) => {
                  const booked = allBookings
                    .filter(
                      (b) =>
                        b.court === court._id &&
                        b.date === today &&
                        b.status !== "cancelled",
                    )
                    .reduce((s, b) => s + b.hours, 0);
                  const pct = Math.min((booked / 16) * 100, 100);
                  return (
                    <div key={court._id} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                          fontSize: 13,
                        }}>
                        <span style={{ fontWeight: 700 }}>
                          {court.image} {court.name}
                        </span>
                        <span style={{ color: "#718096" }}>{booked}h/16h</span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "#e5e7eb",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background:
                              pct > 75
                                ? "#ef4444"
                                : pct > 50
                                  ? "#f59e0b"
                                  : "#22c55e",
                            borderRadius: 4,
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <BarChartIcon
                sx={{ verticalAlign: "middle", mr: 1, fontSize: 20 }}
              />
              Phân bổ trạng thái
            </div>
            <div className="card-body">
              {(
                [
                  "pending",
                  "confirmed",
                  "completed",
                  "cancelled",
                ] as BookingStatus[]
              ).map((status) => {
                const count = allBookings.filter(
                  (b) => b.status === status,
                ).length;
                const pct =
                  allBookings.length > 0
                    ? (count / allBookings.length) * 100
                    : 0;
                const s = STATUS_CONFIG[status];
                return (
                  <div key={status} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        fontSize: 13,
                      }}>
                      <span
                        className={`status-badge ${s.cls}`}
                        style={{ padding: "2px 8px" }}>
                        <s.icon
                          fontSize="small"
                          sx={{
                            verticalAlign: "middle",
                            mr: 0.5,
                            fontSize: 14,
                          }}
                        />
                        {s.label}
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#e5e7eb",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: s.barColor,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <NotificationSnackbar
        open={notification.open}
        msg={notification.msg}
        type={notification.type}
        onClose={closeNotif}
      />
    </div>
  );
};

export default DashboardPage;
