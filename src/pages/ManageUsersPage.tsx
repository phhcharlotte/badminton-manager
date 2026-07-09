// src/pages/ManageUsersPage.tsx
import React, { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Switch, FormControlLabel, Alert,
  IconButton, InputAdornment, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { User, UserRole } from '../types';
import NotificationSnackbar from '../components/shared/NotificationSnackbar';
import { useNotification } from '../hooks/useNotification';

interface UserForm {
  username: string; password: string; fullName: string;
  email: string; phone: string; role: UserRole; isActive: boolean;
}
const DEFAULT_FORM: UserForm = {
  username: '', password: '', fullName: '', email: '', phone: '', role: 'user', isActive: true,
};
const ROLE_CONFIG: Record<UserRole, { label: string; color: 'error' | 'warning' | 'info' }> = {
  admin: { label: 'Quản lý',    color: 'error' },
  staff: { label: 'Nhân viên',  color: 'warning' },
  user:  { label: 'Khách hàng', color: 'info' },
};

const ManageUsersPage: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, deleteUser, currentUser } = useAuthStore();
  const { notification, notify, close: closeNotif } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(DEFAULT_FORM);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showPwd, setShowPwd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (roleFilter === 'all' || u.role === roleFilter);
  });

  const openAdd = () => { setEditUser(null); setForm(DEFAULT_FORM); setFormError(''); setDialogOpen(true); };
  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ username: user.username, password: user.password, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive });
    setFormError(''); setDialogOpen(true);
  };
  const handleSave = () => {
    if (!form.username || !form.password || !form.fullName) { setFormError('Vui lòng điền đầy đủ thông tin bắt buộc!'); return; }
    if (editUser) {
      updateUser(editUser.id, form);
      notify('Cập nhật tài khoản thành công!', 'success');
      setDialogOpen(false);
    } else {
      const result = addUser(form);
      if (result.success) { notify(result.message, 'success'); setDialogOpen(false); }
      else setFormError(result.message);
    }
  };
  const handleDelete = () => {
    if (deleteId) { deleteUser(deleteId); setDeleteId(null); notify('Đã xoá tài khoản.', 'info'); }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">👥 Quản lý người dùng</div>
          <div className="page-subtitle">Quản lý tài khoản admin, nhân viên và khách hàng</div>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ background: 'linear-gradient(135deg,#1a472a,#2d6a4f)', fontWeight: 700, '&:hover': { background: '#0d2614' } }}>
          Tạo tài khoản
        </Button>
      </div>

      <div className="stat-cards">
        {[
          { label: 'Tổng TK',    value: users.length,                              icon: '👥', bg: '#e8f5e9', ibg: '#c8e6c9' },
          { label: 'Quản lý',    value: users.filter((u) => u.role === 'admin').length,  icon: '👑', bg: '#fee2e2', ibg: '#fecaca' },
          { label: 'Nhân viên',  value: users.filter((u) => u.role === 'staff').length,  icon: '🧑‍💼', bg: '#fef3c7', ibg: '#fde68a' },
          { label: 'Khách hàng', value: users.filter((u) => u.role === 'user').length,   icon: '🙋', bg: '#dbeafe', ibg: '#bfdbfe' },
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

      <div className="filter-bar">
        <TextField size="small" placeholder="Tìm theo tên, username, email..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ minWidth: 260 }} />
        <TextField select size="small" label="Vai trò" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="admin">👑 Quản lý</MenuItem>
          <MenuItem value="staff">🧑‍💼 Nhân viên</MenuItem>
          <MenuItem value="user">🙋 Khách hàng</MenuItem>
        </TextField>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#718096' }}>{filtered.length} tài khoản</span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr><th>Người dùng</th><th>Username</th><th>Liên hệ</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const roleConf = ROLE_CONFIG[user.role];
                  const isSelf = user.id === currentUser?.id;
                  const avatarColors: Record<UserRole, { bg: string; color: string }> = {
                    admin: { bg: '#fee2e2', color: '#dc2626' },
                    staff: { bg: '#fef3c7', color: '#d97706' },
                    user:  { bg: '#dbeafe', color: '#2563eb' },
                  };
                  const av = avatarColors[user.role];
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: av.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0, color: av.color }}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{user.fullName}</div>
                            {isSelf && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>• Bạn</span>}
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{user.username}</span></td>
                      <td>
                        <div style={{ fontSize: 13 }}>{user.email}</div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{user.phone}</div>
                      </td>
                      <td><Chip label={roleConf.label} color={roleConf.color} size="small" variant="outlined" /></td>
                      <td>
                        <FormControlLabel
                          control={<Switch checked={user.isActive} onChange={() => !isSelf && toggleUserStatus(user.id)} size="small" color="success" disabled={isSelf} />}
                          label={<span style={{ fontSize: 12 }}>{user.isActive ? '✅ Hoạt động' : '🚫 Khoá'}</span>}
                        />
                      </td>
                      <td style={{ fontSize: 12, color: '#718096' }}>{user.createdAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <IconButton size="small" onClick={() => openEdit(user)} color="primary"><EditIcon fontSize="small" /></IconButton>
                          {!isSelf && <IconButton size="small" onClick={() => setDeleteId(user.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editUser ? '✏️ Chỉnh sửa tài khoản' : '➕ Tạo tài khoản mới'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Họ tên đầy đủ *" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} size="small" fullWidth />
            <div style={{ display: 'flex', gap: 12 }}>
              <TextField label="Username *" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} size="small" sx={{ flex: 1 }} disabled={!!editUser} />
              <TextField
                label="Mật khẩu *" type={showPwd ? 'text' : 'password'}
                value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                size="small" sx={{ flex: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd(!showPwd)} size="small">{showPwd ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
              />
            </div>
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} size="small" fullWidth />
            <div style={{ display: 'flex', gap: 12 }}>
              <TextField label="Số điện thoại" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} size="small" sx={{ flex: 1 }} />
              <TextField select label="Vai trò *" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))} size="small" sx={{ flex: 1 }}>
                <MenuItem value="admin">👑 Quản lý</MenuItem>
                <MenuItem value="staff">🧑‍💼 Nhân viên</MenuItem>
                <MenuItem value="user">🙋 Khách hàng</MenuItem>
              </TextField>
            </div>
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} color="success" />} label="Tài khoản đang hoạt động" />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Huỷ</Button>
          <Button variant="contained" onClick={handleSave} sx={{ background: 'linear-gradient(135deg,#1a472a,#2d6a4f)', fontWeight: 700 }}>
            {editUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>⚠️ Xoá tài khoản</DialogTitle>
        <DialogContent><Alert severity="error">Bạn có chắc muốn xoá tài khoản này không?</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">Huỷ</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ fontWeight: 700 }}>Xoá</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={notification.open} msg={notification.msg} type={notification.type} onClose={closeNotif} />
    </div>
  );
};

export default ManageUsersPage;
