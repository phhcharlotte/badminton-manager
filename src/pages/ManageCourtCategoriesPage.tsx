// src/pages/ManageCourtCategoriesPage.tsx
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
  Chip,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useCourtCategoryStore } from "@/store/courtCategoryStore";
import { CourtCategory, PriceRule } from "@/types/Courts";
import { formatCurrency } from "@/utils/helpers";
import NotificationSnackbar from "@/components/shared/NotificationSnackbar";
import { useNotification } from "@/hooks/useNotification";

interface CategoryForm {
  name: string;
  description: string;
  priceRules: PriceRule[];
  isActive: boolean;
}

const DEFAULT_RULE: PriceRule = {
  startTime: "00:00",
  endTime: "17:00",
  pricePerHourFixed: 100000,
  pricePerHourCasual: 120000,
};
const DEFAULT_FORM: CategoryForm = {
  name: "",
  description: "",
  priceRules: [
    {
      startTime: "00:00",
      endTime: "17:00",
      pricePerHourFixed: 100000,
      pricePerHourCasual: 120000,
    },
    {
      startTime: "17:00",
      endTime: "24:00",
      pricePerHourFixed: 150000,
      pricePerHourCasual: 180000,
    },
  ],
  isActive: true,
};

const ManageCourtCategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  } = useCourtCategoryStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourtCategory | null>(
    null,
  );
  const [form, setForm] = useState<CategoryForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories().catch(() =>
      notify("Không tải được danh sách loại sân!", "error"),
    );
  }, []); // eslint-disable-line

  const openAdd = () => {
    setEditingCategory(null);
    setForm(DEFAULT_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (c: CourtCategory) => {
    setEditingCategory(c);
    setForm({
      name: c.name,
      description: c.description,
      priceRules: [...c.priceRules],
      isActive: c.isActive,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const addRuleRow = () => {
    setForm((f) => ({
      ...f,
      priceRules: [...f.priceRules, { ...DEFAULT_RULE }],
    }));
  };

  const removeRuleRow = (index: number) => {
    setForm((f) => ({
      ...f,
      priceRules: f.priceRules.filter((_, i) => i !== index),
    }));
  };

  const updateRule = (
    index: number,
    field: keyof PriceRule,
    value: string | number,
  ) => {
    setForm((f) => ({
      ...f,
      priceRules: f.priceRules.map((r, i) =>
        i === index ? { ...r, [field]: value } : r,
      ),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên loại sân!");
      return;
    }
    if (form.priceRules.length === 0) {
      setFormError("Cần ít nhất 1 khung giá theo giờ!");
      return;
    }
    for (const r of form.priceRules) {
      if (!r.startTime || !r.endTime || r.startTime >= r.endTime) {
        setFormError("Mỗi khung giá cần giờ bắt đầu nhỏ hơn giờ kết thúc!");
        return;
      }
      if (r.pricePerHourFixed <= 0 || r.pricePerHourCasual <= 0) {
        setFormError("Cả 2 mức giá (cố định và vãng lai) phải lớn hơn 0!");
        return;
      }
    }

    setSaving(true);
    setFormError("");
    const result = editingCategory
      ? await editCategory(editingCategory._id, form)
      : await addCategory(form);
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
    const result = await removeCategory(deleteId);
    setDeleting(false);
    setDeleteId(null);
    notify(result.message, result.success ? "info" : "error");
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
            <CategoryIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            Quản lý loại sân
          </div>
          <div className="page-subtitle">
            Thiết lập tên loại sân và bảng giá cố định/vãng lai theo từng khung
            giờ
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
          Thêm loại sân
        </Button>
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
                    <th>Loại sân</th>
                    <th>Mô tả</th>
                    <th>Bảng giá theo giờ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td style={{ fontWeight: 700 }}>{cat.name}</td>
                      <td
                        style={{
                          fontSize: 13,
                          color: "#718096",
                          maxWidth: 180,
                        }}>
                        {cat.description || "—"}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}>
                          {cat.priceRules.map((r, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexWrap: "wrap",
                              }}>
                              <Chip
                                icon={<AccessTimeIcon />}
                                label={`${r.startTime}–${r.endTime}`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                icon={<StarIcon />}
                                label={formatCurrency(r.pricePerHourFixed)}
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                              <Chip
                                icon={<BoltIcon />}
                                label={formatCurrency(r.pricePerHourCasual)}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 13,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}>
                          {cat.isActive ? (
                            <CheckCircleIcon fontSize="small" color="success" />
                          ) : (
                            <PauseCircleIcon
                              fontSize="small"
                              color="disabled"
                            />
                          )}
                          {cat.isActive ? "Hoạt động" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(cat)}
                            color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteId(cat._id)}
                            color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "#718096",
                        }}>
                        Chưa có loại sân nào, bấm "Thêm loại sân" để bắt đầu
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
        maxWidth="md"
        fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          {editingCategory ? <EditIcon /> : <AddIcon />}
          {editingCategory ? "Chỉnh sửa loại sân" : "Thêm loại sân mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Tên loại sân *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              size="small"
              fullWidth
              placeholder="VD: Tiêu chuẩn, Thi đấu..."
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#4a5568" }}>
                  Bảng giá theo khung giờ (mỗi khung có 2 mức giá):
                </div>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addRuleRow}>
                  Thêm khung giờ
                </Button>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {form.priceRules.map((rule, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f8faf9",
                      padding: 12,
                      borderRadius: 8,
                    }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}>
                      <TextField
                        label="Từ"
                        type="time"
                        size="small"
                        value={rule.startTime}
                        onChange={(e) =>
                          updateRule(index, "startTime", e.target.value)
                        }
                        sx={{ width: 110 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Đến"
                        type="time"
                        size="small"
                        value={
                          rule.endTime === "24:00" ? "23:59" : rule.endTime
                        }
                        onChange={(e) =>
                          updateRule(index, "endTime", e.target.value)
                        }
                        disabled={rule.endTime === "24:00"}
                        sx={{ width: 110 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormControlLabel
                        sx={{ ml: 0 }}
                        control={
                          <Checkbox
                            size="small"
                            checked={rule.endTime === "24:00"}
                            onChange={(e) =>
                              updateRule(
                                index,
                                "endTime",
                                e.target.checked ? "24:00" : "23:00",
                              )
                            }
                          />
                        }
                        label={<span style={{ fontSize: 11 }}>Đến 24h</span>}
                      />
                      <div style={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRuleRow(index)}
                        disabled={form.priceRules.length <= 1}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <TextField
                        label="Giá cố định (đ/giờ) *"
                        type="number"
                        size="small"
                        value={rule.pricePerHourFixed}
                        onChange={(e) =>
                          updateRule(
                            index,
                            "pricePerHourFixed",
                            Number(e.target.value),
                          )
                        }
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <StarIcon
                              fontSize="small"
                              color="warning"
                              sx={{ mr: 0.5 }}
                            />
                          ),
                        }}
                        slotProps={{ htmlInput: { min: 0, step: 10000 } }}
                      />
                      <TextField
                        label="Giá vãng lai (đ/giờ) *"
                        type="number"
                        size="small"
                        value={rule.pricePerHourCasual}
                        onChange={(e) =>
                          updateRule(
                            index,
                            "pricePerHourCasual",
                            Number(e.target.value),
                          )
                        }
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <BoltIcon
                              fontSize="small"
                              color="info"
                              sx={{ mr: 0.5 }}
                            />
                          ),
                        }}
                        slotProps={{ htmlInput: { min: 0, step: 10000 } }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
              label="Loại sân đang áp dụng"
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
            ) : editingCategory ? (
              "Lưu thay đổi"
            ) : (
              "Thêm loại sân"
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
          <WarningAmberIcon /> Xoá loại sân
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Nếu đang có sân nào sử dụng loại sân này, hệ thống sẽ từ chối xoá —
            bạn cần đổi loại sân cho các sân đó trước.
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

export default ManageCourtCategoriesPage;
