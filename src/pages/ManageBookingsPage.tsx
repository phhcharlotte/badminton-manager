// src/pages/ManageBookingsPage.tsx
import React, { useState } from 'react';
import { Button, Chip, TextField, InputAdornment, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useBookingStore } from '../store/bookingStore';
import { BookingStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import NotificationSnackbar from '../components/shared/NotificationSnackbar';
import { useNotification } from '../hooks/useNotification';

const STATUS_CONFIG: Record<BookingStatus, { label: string; icon: string; cls: string }> = {
  pending:   { label: 'Chờ xác nhận', icon: '⏳', cls: 'pending' },
  confirmed: { label: 'Đã xác nhận',  icon: '✅', cls: 'confirmed' },
  cancelled: { label: 'Đã huỷ',       icon: '❌', cls: 'cancelled' },
  completed: { label: 'Hoàn thành',   icon: '🏅', cls: 'completed' },
};

const ManageBookingsPage: React.FC = () => {
  const { getAllBookings, updateBookingStatus } = useBookingStore();
  const { notification, notify, close: closeNotif } = useNotification();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');

  const all = getAllBookings();
  const filtered = all.filter((b) => {
    const matchSearch =
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.courtName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === 'all' || b.status === filterStatus);
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatus = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    const msgs: Record<string, string> = {
      confirmed: '✅ Đã xác nhận lịch đặt sân!',
      cancelled:  '❌ Đã huỷ lịch đặt sân.',
      completed:  '🏅 Đã đánh dấu hoàn thành!',
    };
    notify(msgs[status], status === 'cancelled' ? 'warning' : 'success');
  };

  const totalRevenue = all.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">📊 Quản lý đặt sân</div>
        <div className="page-subtitle">Xem và cập nhật trạng thái tất cả các lịch đặt sân</div>
      </div>

      <div className="stat-cards">
        {[
          { label: 'Tổng cộng',    value: all.length,                                          icon: '📅', bg: '#e8f5e9', ibg: '#c8e6c9' },
          { label: 'Chờ xác nhận', value: all.filter((b) => b.status === 'pending').length,    icon: '⏳', bg: '#fef3c7', ibg: '#fde68a' },
          { label: 'Đã xác nhận',  value: all.filter((b) => b.status === 'confirmed').length,  icon: '✅', bg: '#d1fae5', ibg: '#a7f3d0' },
          { label: 'Doanh thu',    value: formatCurrency(totalRevenue),                        icon: '💰', bg: '#dbeafe', ibg: '#bfdbfe' },
        ].map((s) => (
          <div className="stat-card" key={s.label} style={{ background: s.bg }}>
            <div className="stat-icon" style={{ background: s.ibg }}>{s.icon}</div>
            <div className="stat-content">
              <div className="stat-value" style={{ fontSize: typeof s.value === 'string' && s.value.length > 8 ? 15 : 28 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <TextField
          size="small" placeholder="Tìm theo tên, sân, mã..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} label="Trạng thái">
            <MenuItem value="all">Tất cả</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <MenuItem key={key} value={key}>{val.icon} {val.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#718096' }}>{sorted.length} lịch đặt</span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Không có dữ liệu</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Mã</th><th>Khách hàng</th><th>Sân</th><th>Ngày</th>
                    <th>Giờ</th><th>Tổng tiền</th><th>Trạng thái</th><th>Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b) => {
                    const s = STATUS_CONFIG[b.status];
                    return (
                      <tr key={b.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#718096' }}>#{b.id.slice(-6).toUpperCase()}</span></td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.userName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.courtName}</div>
                          <Chip label={b.courtType === 'fixed' ? '⭐ Cố định' : '🎯 Vãng lai'} size="small" color={b.courtType === 'fixed' ? 'warning' : 'info'} variant="outlined" sx={{ mt: 0.5 }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatDate(b.date)}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.startTime} – {b.endTime}</div>
                          <div style={{ fontSize: 12, color: '#718096' }}>{b.hours}h</div>
                        </td>
                        <td><span style={{ fontWeight: 700, color: '#1a472a' }}>{formatCurrency(b.totalPrice)}</span></td>
                        <td><span className={`status-badge ${s.cls}`}>{s.icon} {s.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {b.status === 'pending' && (
                              <>
                                <Button size="small" variant="contained" color="success" onClick={() => handleStatus(b.id, 'confirmed')} sx={{ fontSize: 11 }}>✅ Xác nhận</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleStatus(b.id, 'cancelled')} sx={{ fontSize: 11 }}>❌ Huỷ</Button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <Button size="small" variant="contained" onClick={() => handleStatus(b.id, 'completed')} sx={{ fontSize: 11, background: '#1a472a' }}>🏅 Hoàn thành</Button>
                            )}
                            {(b.status === 'completed' || b.status === 'cancelled') && (
                              <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>
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

      <NotificationSnackbar open={notification.open} msg={notification.msg} type={notification.type} onClose={closeNotif} />
    </div>
  );
};

export default ManageBookingsPage;
