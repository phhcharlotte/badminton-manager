import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GroupsIcon from "@mui/icons-material/Groups";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuthStore } from "@/store/authStore";
import { User, UserRole } from "@/types";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";
import { AVATAR_COLORS } from "@/config/manage";

interface ManagerForm {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}
const DEFAULT_FORM: ManagerForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
};

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    color: "error" | "warning" | "info";
    icon: React.ElementType;
  }
> = {
  admin: { label: "Admin", color: "error", icon: AdminPanelSettingsIcon },
  manager: { label: "Quản lý", color: "warning", icon: ManageAccountsIcon },
  customer: { label: "Khách hàng", color: "info", icon: PersonIcon },
};

const ManageUsersPage: React.FC = () => {
  const {
    users,
    fetchUsers,
    addManager,
    toggleUserStatus,
    deleteUser,
    currentUser,
  } = useAuthStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ManagerForm>(DEFAULT_FORM);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showPwd, setShowPwd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUsers(roleFilter === "all" ? undefined : roleFilter)
      .catch(() => notify("Không tải được danh sách người dùng!", "error"))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const filtered = users.filter((u) => {
    const keyword = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword) ||
      (u.phone || "").toLowerCase().includes(keyword)
    );
  });

  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setFormError("Vui lòng điền đầy đủ họ tên, email và mật khẩu!");
      return;
    }
    setSaving(true);
    setFormError("");
    const result = await addManager(form);
    setSaving(false);
    if (result.success) {
      notify(result.message, "success");
      setDialogOpen(false);
    } else {
      setFormError(result.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user._id, user.isActive);
      notify(
        user.isActive ? "Đã khoá tài khoản." : "Đã mở khoá tài khoản.",
        "success",
      );
    } catch (err: any) {
      notify(
        err?.response?.data?.message || "Không thể cập nhật trạng thái!",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      notify("Đã xoá tài khoản.", "info");
    } catch (err: any) {
      notify(
        err?.response?.data?.message || "Không thể xoá tài khoản!",
        "error",
      );
    } finally {
      setDeleteId(null);
    }
  };

  const countByRole = (role: UserRole) =>
    users.filter((u) => u.role === role).length;

  return (
    <div className="fade-in-up">
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div>
          <div className="page-title">
            <GroupsIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            Quản lý người dùng
          </div>
          <div className="page-subtitle">
            Xem danh sách quản lý, khách hàng và tạo tài khoản quản lý mới
          </div>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
            fontWeight: 700,
            "&:hover": { background: "#0d2614" },
          }}>
          Tạo tài khoản Quản lý
        </Button>
      </div>

      <div className="stat-cards">
        {[
          {
            label: "Tổng TK",
            value: users.length,
            Icon: GroupsIcon,
            bg: "#e8f5e9",
            ibg: "#c8e6c9",
            color: "#1a472a",
          },
          {
            label: "Admin",
            value: countByRole("admin"),
            Icon: AdminPanelSettingsIcon,
            bg: "#fee2e2",
            ibg: "#fecaca",
            color: "#dc2626",
          },
          {
            label: "Quản lý",
            value: countByRole("manager"),
            Icon: ManageAccountsIcon,
            bg: "#fef3c7",
            ibg: "#fde68a",
            color: "#b45309",
          },
          {
            label: "Khách hàng",
            value: countByRole("customer"),
            Icon: PersonIcon,
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
        <TextField
          size="small"
          placeholder="Tìm theo tên, email, SĐT..."
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
          sx={{ minWidth: 260 }}
        />
        <TextField
          select
          size="small"
          label="Vai trò"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          sx={{ minWidth: 160 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="admin">
            <AdminPanelSettingsIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Admin
          </MenuItem>
          <MenuItem value="manager">
            <ManageAccountsIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Quản lý
          </MenuItem>
          <MenuItem value="customer">
            <PersonIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Khách hàng
          </MenuItem>
        </TextField>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#718096" }}>
          {filtered.length} tài khoản
        </span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
              }}>
              <CircularProgress size={28} />
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const roleConf = ROLE_CONFIG[user.role];
                    const isSelf = user._id === currentUser?._id;
                    const av = AVATAR_COLORS[user.role];
                    return (
                      <tr key={user._id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: av.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 16,
                                flexShrink: 0,
                                color: av.color,
                              }}>
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {user.fullName}
                              </div>
                              {isSelf && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "#16a34a",
                                    fontWeight: 700,
                                  }}>
                                  • Bạn
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{user.email}</td>
                        <td style={{ fontSize: 13, color: "#718096" }}>
                          {user.phone || "—"}
                        </td>
                        <td>
                          <Chip
                            icon={<roleConf.icon fontSize="small" />}
                            label={roleConf.label}
                            color={roleConf.color}
                            size="small"
                            variant="outlined"
                          />
                        </td>
                        <td>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={user.isActive}
                                onChange={() =>
                                  !isSelf &&
                                  user.role !== "admin" &&
                                  handleToggleStatus(user)
                                }
                                size="small"
                                color="success"
                                disabled={isSelf || user.role === "admin"}
                              />
                            }
                            label={
                              <span
                                style={{
                                  fontSize: 12,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}>
                                {user.isActive ? (
                                  <CheckCircleIcon
                                    fontSize="small"
                                    color="success"
                                  />
                                ) : (
                                  <BlockIcon
                                    fontSize="small"
                                    color="disabled"
                                  />
                                )}
                                {user.isActive ? "Hoạt động" : "Khoá"}
                              </span>
                            }
                          />
                        </td>
                        <td style={{ fontSize: 12, color: "#718096" }}>
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td>
                          {!isSelf && user.role !== "admin" && (
                            <IconButton
                              size="small"
                              onClick={() => setDeleteId(user._id)}
                              color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "#718096",
                        }}>
                        Không có tài khoản nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          <ManageAccountsIcon /> Tạo tài khoản Quản lý
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Họ tên đầy đủ *"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Mật khẩu *"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              size="small"
              fullWidth
              helperText="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd((prev) => !prev)}
                        edge="end"
                        size="small">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              size="small"
              fullWidth
              placeholder="0912345678"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            color="inherit"
            disabled={saving}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
              fontWeight: 700,
            }}>
            {saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
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
          <WarningAmberIcon /> Xoá tài khoản
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Bạn có chắc muốn xoá tài khoản này không?
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Huỷ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ fontWeight: 700 }}>
            Xoá
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

export default ManageUsersPage;
