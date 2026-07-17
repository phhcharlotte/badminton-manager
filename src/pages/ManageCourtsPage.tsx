// src/pages/ManageCourtsPage.tsx
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
  CircularProgress,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import StadiumIcon from "@mui/icons-material/Stadium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useCourtStore } from "@/store/courtStore";
import { useCourtCategoryStore } from "@/store/courtCategoryStore";
import { Court } from "@/types/Courts";
import { formatCurrency } from "@/utils/helpers";
import { getCourtIcon } from "@/config/courtIcons";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";

interface CourtForm {
  name: string;
  description: string;
  category: string; // id cua CourtCategory
  isActive: boolean;
}
const DEFAULT_FORM: CourtForm = {
  name: "",
  description: "",
  category: "",
  isActive: true,
};

const ManageCourtsPage: React.FC = () => {
  const {
    courts,
    isLoading,
    error,
    fetchCourts,
    addCourt,
    editCourt,
    removeCourt,
  } = useCourtStore();
  const { categories, fetchCategories } = useCourtCategoryStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [form, setForm] = useState<CourtForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourts().catch(() => notify("Không tải được danh sách sân!", "error"));
    fetchCategories().catch(() =>
      notify("Không tải được danh sách loại sân!", "error"),
    );
  }, []); // eslint-disable-line

  const activeCategories = categories.filter((c) => c.isActive);

  const openAdd = () => {
    if (activeCategories.length === 0) {
      notify(
        'Chưa có loại sân nào đang hoạt động. Vào "Quản lý loại sân" để tạo trước!',
        "warning",
      );
      return;
    }
    setEditingCourt(null);
    setForm({ ...DEFAULT_FORM, category: activeCategories[0]._id });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (c: Court) => {
    setEditingCourt(c);
    setForm({
      name: c.name,
      description: c.description,
      category: c.category._id,
      isActive: c.isActive,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category) {
      setFormError("Vui lòng nhập tên sân và chọn loại sân!");
      return;
    }
    setSaving(true);
    setFormError("");
    const payload = { ...form, image: "sports_tennis" }; // icon mac dinh, khong can admin chon
    const result = editingCourt
      ? await editCourt(editingCourt._id, payload)
      : await addCourt(payload);
    setSaving(false);
    if (result.success) {
      notify(result.message, "success");
      setDialogOpen(false);
    } else {
      setFormError(result.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await removeCourt(deleteId);
    setDeleting(false);
    setDeleteId(null);
    notify(result.message, result.success ? "info" : "error");
  };

  const handleToggleStatus = async (court: Court) => {
    const result = await editCourt(court._id, { isActive: !court.isActive });
    if (!result.success) notify(result.message, "error");
  };

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
            <StadiumIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            Quản lý sân
          </div>
          <div className="page-subtitle">
            Thêm, sửa, xoá sân — giá tiền được lấy từ loại sân đã thiết lập
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
          Thêm sân mới
        </Button>
      </div>

      <div className="stat-cards">
        {[
          {
            label: "Tổng sân",
            value: courts.length,
            Icon: StadiumIcon,
            bg: "#e8f5e9",
            ibg: "#c8e6c9",
            color: "#1a472a",
          },
          {
            label: "Đang hoạt động",
            value: courts.filter((c) => c.isActive).length,
            Icon: CheckCircleIcon,
            bg: "#d1fae5",
            ibg: "#a7f3d0",
            color: "#065f46",
          },
          {
            label: "Tạm ngưng",
            value: courts.filter((c) => !c.isActive).length,
            Icon: PauseCircleIcon,
            bg: "#fee2e2",
            ibg: "#fecaca",
            color: "#dc2626",
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Sân</th>
                    <th>Mô tả</th>
                    <th>Loại sân</th>
                    <th>Bảng giá</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courts.map((court) => {
                    const CourtIcon = getCourtIcon(court.image);
                    return (
                      <tr key={court._id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}>
                            <CourtIcon
                              sx={{ fontSize: 26, color: "#1a472a" }}
                            />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>
                              {court.name}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            maxWidth: 180,
                            fontSize: 13,
                            color: "#718096",
                          }}>
                          {court.description}
                        </td>
                        <td>
                          <Chip
                            label={court.category?.name || "—"}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}>
                            {court.category?.priceRules.map((r, i) => (
                              <span
                                key={i}
                                style={{ fontSize: 11, color: "#718096" }}>
                                <AccessTimeIcon
                                  sx={{ fontSize: 12, verticalAlign: "middle" }}
                                />{" "}
                                {r.startTime}–{r.endTime}:{" "}
                                {formatCurrency(r.pricePerHour)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={court.isActive}
                                onChange={() => handleToggleStatus(court)}
                                size="small"
                                color="success"
                              />
                            }
                            label={
                              <span style={{ fontSize: 13 }}>
                                {court.isActive ? "Hoạt động" : "Tạm ngưng"}
                              </span>
                            }
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <IconButton
                              size="small"
                              onClick={() => openEdit(court)}
                              color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setDeleteId(court._id)}
                              color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {courts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "#718096",
                        }}>
                        Chưa có sân nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Them/Sua san - CHI 3 truong */}
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
          {editingCourt ? <EditIcon /> : <AddIcon />}
          {editingCourt ? "Chỉnh sửa sân" : "Thêm sân mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Tên sân *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Mô tả"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              size="small"
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              select
              label="Loại sân *"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              size="small"
              fullWidth
              helperText={
                activeCategories.length === 0
                  ? 'Chưa có loại sân nào — vào "Quản lý loại sân" để tạo trước'
                  : ""
              }>
              {activeCategories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            {form.category && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Giá theo giờ của loại sân này:{" "}
                {categories
                  .find((c) => c._id === form.category)
                  ?.priceRules.map((r, i) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      {r.startTime}–{r.endTime}:{" "}
                      {formatCurrency(r.pricePerHour)}
                    </span>
                  ))}
              </Alert>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  color="success"
                />
              }
              label="Sân đang hoạt động"
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
            ) : editingCourt ? (
              "Lưu thay đổi"
            ) : (
              "Thêm sân"
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
          <WarningAmberIcon /> Xoá sân
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Bạn có chắc muốn xoá sân này? Hành động này không thể hoàn tác!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteId(null)}
            color="inherit"
            disabled={deleting}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : "Xoá"}
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

export default ManageCourtsPage;
