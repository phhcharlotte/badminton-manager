// src/pages/ProfilePage.tsx
import React, { useState } from "react";
import {
  Button,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import HistoryIcon from "@mui/icons-material/History";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";
import { useBookingStore } from "@/store/bookingStore";
import { formatCurrency, formatDate } from "@/utils/helpers";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  admin: {
    label: "Admin",
    color: "#dc2626",
    bg: "#fee2e2",
    icon: AdminPanelSettingsIcon,
  },
  manager: {
    label: "Quản lý",
    color: "#d97706",
    bg: "#fef3c7",
    icon: ManageAccountsIcon,
  },
  customer: {
    label: "Khách hàng",
    color: "#2563eb",
    bg: "#dbeafe",
    icon: PersonIcon,
  },
};

type BookingStatusMap = Record<
  string,
  { cls: string; label: string; icon: React.ElementType }
>;
const STATUS_MAP: BookingStatusMap = {
  pending: { cls: "pending", label: "Chờ xác nhận", icon: HourglassEmptyIcon },
  confirmed: { cls: "confirmed", label: "Đã xác nhận", icon: CheckCircleIcon },
  cancelled: { cls: "cancelled", label: "Đã huỷ", icon: CancelIcon },
  completed: { cls: "completed", label: "Hoàn thành", icon: EmojiEventsIcon },
};

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, changePassword } = useAuthStore();
  const { getBookingsByUser } = useBookingStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwMode, setPwMode] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  if (!currentUser) return null;

  const roleConf = ROLE_CONFIG[currentUser.role];
  const myBookings = getBookingsByUser(currentUser._id);
  const totalSpent = myBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalPrice, 0);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      notify("Họ tên không được để trống!", "error");
      return;
    }
    setSavingProfile(true);
    const result = await updateProfile({ fullName, phone });
    setSavingProfile(false);
    if (result.success) {
      setEditMode(false);
      notify(result.message, "success");
    } else {
      notify(result.message, "error");
    }
  };

  const handleCancelEdit = () => {
    setFullName(currentUser.fullName);
    setPhone(currentUser.phone || "");
    setEditMode(false);
  };

  const handleChangePw = async () => {
    setPwError("");
    if (newPw.length < 8) {
      setPwError("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setChangingPw(true);
    const result = await changePassword(oldPw, newPw);
    setChangingPw(false);

    if (result.success) {
      notify(result.message, "success");
    } else {
      setPwError(result.message);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">
          <PersonIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Hồ sơ cá nhân
        </div>
        <div className="page-subtitle">
          Xem và cập nhật thông tin tài khoản của bạn
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24,
          alignItems: "start",
        }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div
              className="card-body"
              style={{ textAlign: "center", padding: 32 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  background: `linear-gradient(135deg, ${roleConf.color}, ${roleConf.color}88)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  fontWeight: 900,
                  color: "white",
                  boxShadow: `0 8px 24px ${roleConf.color}40`,
                }}>
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1a1a2f",
                  marginBottom: 4,
                }}>
                {currentUser.fullName}
              </div>
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 12 }}>
                {currentUser.email}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: roleConf.bg,
                  color: roleConf.color,
                  fontWeight: 700,
                  fontSize: 13,
                }}>
                <roleConf.icon fontSize="small" />
                {roleConf.label}
              </span>
            </div>
          </div>

          {currentUser.role === "customer" && (
            <div className="card">
              <div className="card-header">
                <AssessmentIcon
                  fontSize="small"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Thống kê
              </div>
              <div className="card-body">
                {[
                  {
                    label: "Tổng lần đặt",
                    value: myBookings.length,
                    Icon: EventNoteIcon,
                  },
                  {
                    label: "Đang chờ",
                    value: myBookings.filter((b) => b.status === "pending")
                      .length,
                    Icon: HourglassEmptyIcon,
                  },
                  {
                    label: "Đã xác nhận",
                    value: myBookings.filter((b) => b.status === "confirmed")
                      .length,
                    Icon: CheckCircleIcon,
                  },
                  {
                    label: "Hoàn thành",
                    value: myBookings.filter((b) => b.status === "completed")
                      .length,
                    Icon: EmojiEventsIcon,
                  },
                  {
                    label: "Tổng chi tiêu",
                    value: formatCurrency(totalSpent),
                    Icon: AttachMoneyIcon,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px dashed #e5e7eb",
                    }}>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#718096",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}>
                      <s.Icon fontSize="small" /> {s.label}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1a472a",
                      }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span>
                  <EditNoteIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", mr: 1 }}
                  />
                  Thông tin cá nhân
                </span>
                {!editMode && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditMode(true)}
                    sx={{
                      borderColor: "#52b788",
                      color: "#1a472a",
                      fontWeight: 700,
                    }}>
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>
            <div className="card-body">
              {editMode ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <TextField
                    label="Họ tên đầy đủ *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={currentUser.email}
                    size="small"
                    fullWidth
                    disabled
                    helperText="Email không thể thay đổi (dùng để đăng nhập)"
                  />
                  <TextField
                    label="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="0912345678"
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      startIcon={!savingProfile ? <SaveIcon /> : undefined}
                      sx={{
                        background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
                        fontWeight: 700,
                      }}>
                      {savingProfile ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleCancelEdit}
                      disabled={savingProfile}>
                      Huỷ
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { label: "Họ tên", value: currentUser.fullName },
                    { label: "Email", value: currentUser.email },
                    { label: "Số điện thoại", value: currentUser.phone || "—" },
                    {
                      label: "Trạng thái",
                      value: currentUser.isActive
                        ? "Đang hoạt động"
                        : "Bị khoá",
                    },
                    {
                      label: "Ngày tạo TK",
                      value: formatDate(currentUser.createdAt),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        padding: "12px 0",
                        borderBottom: "1px dashed #e5e7eb",
                        gap: 16,
                      }}>
                      <span
                        style={{
                          width: 140,
                          fontSize: 13,
                          color: "#718096",
                          flexShrink: 0,
                        }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#1a1a2f",
                        }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span>
                  <LockIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", mr: 1 }}
                  />
                  Đổi mật khẩu
                </span>
                {!pwMode && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => setPwMode(true)}
                    sx={{ fontWeight: 700 }}>
                    Đổi mật khẩu
                  </Button>
                )}
              </div>
            </div>
            <div className="card-body">
              {pwMode ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {pwError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {pwError}
                    </Alert>
                  )}
                  <TextField
                    label="Mật khẩu hiện tại *"
                    type={showOld ? "text" : "password"}
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowOld(!showOld)}
                            size="small">
                            {showOld ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Mật khẩu mới * (tối thiểu 8 ký tự, có hoa/thường/số/ký tự đặc biệt)"
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNew(!showNew)}
                            size="small">
                            {showNew ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Xác nhận mật khẩu mới *"
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    size="small"
                    fullWidth
                    error={confirmPw !== "" && confirmPw !== newPw}
                    helperText={
                      confirmPw !== "" && confirmPw !== newPw
                        ? "Mật khẩu không khớp"
                        : ""
                    }
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleChangePw}
                      disabled={changingPw}
                      sx={{ fontWeight: 700 }}>
                      {changingPw ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        "Xác nhận đổi mật khẩu"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      disabled={changingPw}
                      onClick={() => {
                        setPwMode(false);
                        setOldPw("");
                        setNewPw("");
                        setConfirmPw("");
                        setPwError("");
                      }}>
                      Huỷ
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: "#718096",
                    fontSize: 14,
                  }}>
                  <LockIcon sx={{ fontSize: 28, color: "#94a3b8" }} />
                  <span>
                    Để bảo mật tài khoản, hãy đổi mật khẩu định kỳ. Sau khi đổi,
                    bạn sẽ cần đăng nhập lại.
                  </span>
                </div>
              )}
            </div>
          </div>

          {currentUser.role === "customer" && myBookings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <HistoryIcon
                  fontSize="small"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Hoạt động gần đây
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Sân</th>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...myBookings]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .slice(0, 5)
                        .map((b) => {
                          const s = STATUS_MAP[b.status];
                          return (
                            <tr key={b._id}>
                              <td style={{ fontWeight: 700 }}>{b.courtName}</td>
                              <td>{formatDate(b.date)}</td>
                              <td style={{ fontSize: 13 }}>
                                {b.startTime}–{b.endTime}
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
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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

export default ProfilePage;
