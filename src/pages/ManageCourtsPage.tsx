// src/pages/ManageCourtsPage.tsx
import React, { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Switch, FormControlLabel, Alert, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useCourtStore } from '../store/courtStore';
import { Court } from '../types';
import { formatCurrency } from '../utils/helpers';
import NotificationSnackbar from '../components/shared/NotificationSnackbar';
import { useNotification } from '../hooks/useNotification';

interface CourtForm {
  name: string; description: string;
  type: 'fixed' | 'casual'; pricePerHour: number;
  image: string; isActive: boolean;
}
const DEFAULT_FORM: CourtForm = {
  name: '', description: '', type: 'casual', pricePerHour: 100000, image: '🏸', isActive: true,
};
const ICONS = ['🏸', '🏟️', '⭐', '🎯', '🥇', '🏆', '🎖️', '🎗️'];

const ManageCourtsPage: React.FC = () => {
  const { courts, addCourt, updateCourt, deleteCourt, toggleCourtStatus, updatePrice } = useCourtStore();
  const { notification, notify, close: closeNotif } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourt, setEditCourt] = useState<Court | null>(null);
  const [form, setForm] = useState<CourtForm>(DEFAULT_FORM);
  const [priceDialog, setPriceDialog] = useState(false);
  const [priceEditId, setPriceEditId] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const openAdd = () => { setEditCourt(null); setForm(DEFAULT_FORM); setFormError(''); setDialogOpen(true); };
  const openEdit = (c: Court) => {
    setEditCourt(c);
    setForm({ name: c.name, description: c.description, type: c.type, pricePerHour: c.pricePerHour, image: c.image, isActive: c.isActive });
    setFormError(''); setDialogOpen(true);
  };
  const handleSave = () => {
    if (!form.name || form.pricePerHour <= 0) { setFormError('Vui lòng điền đầy đủ thông tin!'); return; }
    if (editCourt) { updateCourt(editCourt.id, form); notify('Cập nhật sân thành công!', 'success'); }
    else { addCourt(form); notify('Thêm sân mới thành công!', 'success'); }
    setDialogOpen(false);
  };
  const handleDelete = () => { if (deleteId) { deleteCourt(deleteId); setDeleteId(null); notify('Đã xoá sân.', 'info'); } };
  const openPrice = (c: Court) => { setPriceEditId(c.id); setNewPrice(c.pricePerHour); setPriceDialog(true); };
  const handleUpdatePrice = () => {
    updatePrice(priceEditId, newPrice); setPriceDialog(false);
    notify('Cập nhật giá sân thành công!', 'success');
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">🏟️ Quản lý sân</div>
          <div className="page-subtitle">Thêm, sửa, xoá và điều chỉnh giá sân</div>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ background: 'linear-gradient(135deg,#1a472a,#2d6a4f)', fontWeight: 700, '&:hover': { background: '#0d2614' } }}>
          Thêm sân mới
        </Button>
      </div>

      <div className="stat-cards">
        {[
          { label: 'Tổng sân',      value: courts.length,                              icon: '🏟️', bg: '#e8f5e9', ibg: '#c8e6c9' },
          { label: 'Đang hoạt động',value: courts.filter((c) => c.isActive).length,    icon: '✅', bg: '#d1fae5', ibg: '#a7f3d0' },
          { label: 'Tạm ngưng',     value: courts.filter((c) => !c.isActive).length,   icon: '⏸️', bg: '#fee2e2', ibg: '#fecaca' },
          { label: 'Sân cố định',   value: courts.filter((c) => c.type === 'fixed').length, icon: '⭐', bg: '#fef3c7', ibg: '#fde68a' },
        ].map((s) => (
          <div className="stat-card" key={s.label} style={{ background: s.bg }}>
            <div className="stat-icon" style={{ background: s.ibg }}>{s.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr><th>Sân</th><th>Mô tả</th><th>Loại</th><th>Giá/giờ</th><th>Trạng thái</th><th>Tạo lúc</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {courts.map((court) => (
                  <tr key={court.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 28 }}>{court.image}</span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{court.name}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 200, fontSize: 13, color: '#718096' }}>{court.description}</td>
                    <td>
                      <span className={`status-badge ${court.type === 'fixed' ? 'confirmed' : 'pending'}`}>
                        {court.type === 'fixed' ? '⭐ Cố định' : '🎯 Vãng lai'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1a472a' }}>{formatCurrency(court.pricePerHour)}</div>
                      <Button size="small" variant="text" sx={{ fontSize: 11, p: 0, minWidth: 0, color: '#718096' }} onClick={() => openPrice(court)}>Sửa giá</Button>
                    </td>
                    <td>
                      <FormControlLabel
                        control={<Switch checked={court.isActive} onChange={() => toggleCourtStatus(court.id)} size="small" color="success" />}
                        label={<span style={{ fontSize: 13 }}>{court.isActive ? '✅ Hoạt động' : '⏸️ Tạm ngưng'}</span>}
                      />
                    </td>
                    <td style={{ fontSize: 12, color: '#718096' }}>{court.createdAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <IconButton size="small" onClick={() => openEdit(court)} color="primary"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(court.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editCourt ? '✏️ Chỉnh sửa sân' : '➕ Thêm sân mới'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Tên sân *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} size="small" fullWidth />
            <TextField label="Mô tả" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} size="small" fullWidth multiline rows={2} />
            <div style={{ display: 'flex', gap: 12 }}>
              <TextField select label="Loại sân *" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))} size="small" sx={{ flex: 1 }}>
                <MenuItem value="fixed">⭐ Cố định</MenuItem>
                <MenuItem value="casual">🎯 Vãng lai</MenuItem>
              </TextField>
              <TextField select label="Icon" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} size="small" sx={{ flex: 1 }}>
                {ICONS.map((icon) => <MenuItem key={icon} value={icon}>{icon}</MenuItem>)}
              </TextField>
            </div>
            <TextField label="Giá/giờ (đồng) *" type="number" value={form.pricePerHour} onChange={(e) => setForm((f) => ({ ...f, pricePerHour: Number(e.target.value) }))} size="small" fullWidth inputProps={{ min: 0, step: 10000 }} />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} color="success" />} label="Sân đang hoạt động" />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Huỷ</Button>
          <Button variant="contained" onClick={handleSave} sx={{ background: 'linear-gradient(135deg,#1a472a,#2d6a4f)', fontWeight: 700 }}>
            {editCourt ? 'Lưu thay đổi' : 'Thêm sân'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price */}
      <Dialog open={priceDialog} onClose={() => setPriceDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>💰 Điều chỉnh giá sân</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Giá mới (đồng/giờ)" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} size="small" sx={{ mt: 1 }} inputProps={{ min: 0, step: 10000 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPriceDialog(false)} color="inherit">Huỷ</Button>
          <Button variant="contained" onClick={handleUpdatePrice} sx={{ background: '#1a472a', fontWeight: 700 }}>Cập nhật giá</Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>⚠️ Xoá sân</DialogTitle>
        <DialogContent><Alert severity="error">Bạn có chắc muốn xoá sân này? Hành động này không thể hoàn tác!</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">Huỷ</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xoá</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={notification.open} msg={notification.msg} type={notification.type} onClose={closeNotif} />
    </div>
  );
};

export default ManageCourtsPage;
