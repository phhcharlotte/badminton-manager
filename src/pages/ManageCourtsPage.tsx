// src/pages/ManageCourtsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import StadiumIcon from "@mui/icons-material/Stadium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useCourtStore } from "@/store/courtStore";
import { Court } from "@/types/Courts";
import { formatCurrency } from "@/utils/helpers";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";
import {
  COURT_ICON_OPTIONS,
  DEFAULT_COURT_ICON_KEY,
  getCourtIcon,
} from "@/config/courtIcons";

interface CourtForm {
  name: string;
  description: string;
  pricePerHourFixed: number;
  pricePerHourCasual: number;
  image: string;
  isActive: boolean;
}
const DEFAULT_FORM: CourtForm = {
  name: "",
  description: "",
  pricePerHourFixed: 100000,
  pricePerHourCasual: 120000,
  image: DEFAULT_COURT_ICON_KEY,
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
  const { notification, notify, close: closeNotif } = useNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [form, setForm] = useState<CourtForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const [priceDialog, setPriceDialog] = useState(false);
  const [priceEditId, setPriceEditId] = useState("");
  const [newFixedPrice, setNewFixedPrice] = useState(0);
  const [newCasualPrice, setNewCasualPrice] = useState(0);
  const [priceSaving, setPriceSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchCourts().catch(() => notify("Không tải được danh sách sân!", "error"));
  }, []); // eslint-disable-line

  const openAdd = () => {
    setEditingCourt(null);
    setForm(DEFAULT_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (c: Court) => {
    setEditingCourt(c);
    setForm({
      name: c.name,
      description: c.description,
      pricePerHourFixed: c.pricePerHourFixed,
      pricePerHourCasual: c.pricePerHourCasual,
      image: c.image,
      isActive: c.isActive,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !form.name ||
      form.pricePerHourFixed <= 0 ||
      form.pricePerHourCasual <= 0
    ) {
      setFormError("Vui lòng điền đầy đủ tên sân và 2 mức giá lớn hơn 0!");
      return;
    }
    setSaving(true);
    setFormError("");
    const result = editingCourt
      ? await editCourt(editingCourt._id, form)
      : await addCourt(form);
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

  const openPrice = (c: Court) => {
    setPriceEditId(c._id);
    setNewFixedPrice(c.pricePerHourFixed);
    setNewCasualPrice(c.pricePerHourCasual);
    setPriceDialog(true);
  };

  const handleUpdatePrice = async () => {
    if (newFixedPrice <= 0 || newCasualPrice <= 0) return;
    setPriceSaving(true);
    const result = await editCourt(priceEditId, {
      pricePerHourFixed: newFixedPrice,
      pricePerHourCasual: newCasualPrice,
    });
    setPriceSaving(false);
    setPriceDialog(false);
    notify(
      result.success ? "Cập nhật giá sân thành công!" : result.message,
      result.success ? "success" : "error",
    );
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
            Thêm, sửa, xoá và điều chỉnh giá sân
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
                    <th>
                      <StarIcon
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      Giá cố định
                    </th>
                    <th>
                      <BoltIcon
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      Giá vãng lai
                    </th>
                    <th>Trạng thái</th>
                    <th>Tạo lúc</th>
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
                              sx={{ fontSize: 28, color: "#1a472a" }}
                            />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>
                              {court.name}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            maxWidth: 200,
                            fontSize: 13,
                            color: "#718096",
                          }}>
                          {court.description}
                        </td>
                        <td style={{ fontWeight: 700, color: "#b45309" }}>
                          {formatCurrency(court.pricePerHourFixed ?? 0)}
                        </td>
                        <td style={{ fontWeight: 700, color: "#1e40af" }}>
                          {formatCurrency(court.pricePerHourCasual ?? 0)}
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
                              <span
                                style={{
                                  fontSize: 13,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}>
                                {court.isActive ? (
                                  <CheckCircleIcon
                                    fontSize="small"
                                    color="success"
                                  />
                                ) : (
                                  <PauseCircleIcon
                                    fontSize="small"
                                    color="disabled"
                                  />
                                )}
                                {court.isActive ? "Hoạt động" : "Tạm ngưng"}
                              </span>
                            }
                          />
                        </td>
                        <td style={{ fontSize: 12, color: "#718096" }}>
                          {new Date(court.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <IconButton
                              size="small"
                              onClick={() => openPrice(court)}
                              color="warning"
                              title="Sửa giá">
                              <StarIcon fontSize="small" />
                            </IconButton>
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
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "#718096",
                        }}>
                        Chưa có sân nào, bấm "Thêm sân mới" để bắt đầu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Them/Sua san */}
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

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4a5568",
                  marginBottom: 8,
                }}>
                Chọn icon hiển thị cho sân:
              </div>
              <ToggleButtonGroup
                value={form.image}
                exclusive
                onChange={(_e, val) =>
                  val && setForm((f) => ({ ...f, image: val }))
                }
                sx={{ flexWrap: "wrap", gap: 1 }}>
                {COURT_ICON_OPTIONS.map(({ key, label, Icon }) => (
                  <ToggleButton
                    key={key}
                    value={key}
                    title={label}
                    sx={{ borderRadius: 2, px: 1.5 }}>
                    <Icon />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            <Alert severity="info" sx={{ py: 0.5 }}>
              Mỗi sân có <strong>2 mức giá</strong> — khách sẽ chọn loại giá lúc
              đặt sân, không cần tạo 2 sân riêng.
            </Alert>

            <div style={{ display: "flex", gap: 12 }}>
              <TextField
                label="Giá cố định (đ/giờ) *"
                type="number"
                value={form.pricePerHourFixed}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pricePerHourFixed: Number(e.target.value),
                  }))
                }
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StarIcon fontSize="small" color="warning" />
                    </InputAdornment>
                  ),
                }}
                slotProps={{ htmlInput: { min: 0, step: 10000 } }}
              />
              <TextField
                label="Giá vãng lai (đ/giờ) *"
                type="number"
                value={form.pricePerHourCasual}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pricePerHourCasual: Number(e.target.value),
                  }))
                }
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BoltIcon fontSize="small" color="info" />
                    </InputAdornment>
                  ),
                }}
                slotProps={{ htmlInput: { min: 0, step: 10000 } }}
              />
            </div>

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

      {/* Dialog sua nhanh gia */}
      <Dialog
        open={priceDialog}
        onClose={() => !priceSaving && setPriceDialog(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          <StarIcon /> Điều chỉnh giá sân
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 8,
            }}>
            <TextField
              fullWidth
              label="Giá cố định (đ/giờ)"
              type="number"
              value={newFixedPrice}
              onChange={(e) => setNewFixedPrice(Number(e.target.value))}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <StarIcon fontSize="small" color="warning" />
                  </InputAdornment>
                ),
              }}
              slotProps={{ htmlInput: { min: 0, step: 10000 } }}
            />
            <TextField
              fullWidth
              label="Giá vãng lai (đ/giờ)"
              type="number"
              value={newCasualPrice}
              onChange={(e) => setNewCasualPrice(Number(e.target.value))}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BoltIcon fontSize="small" color="info" />
                  </InputAdornment>
                ),
              }}
              slotProps={{ htmlInput: { min: 0, step: 10000 } }}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setPriceDialog(false)}
            color="inherit"
            disabled={priceSaving}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdatePrice}
            disabled={priceSaving}
            sx={{ background: "#1a472a", fontWeight: 700 }}>
            {priceSaving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Cập nhật giá"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xoa */}
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
