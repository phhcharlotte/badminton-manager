// src/pages/HistoryPage.tsx
import React, { useState } from 'react';
import { Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { BookingStatus } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';
import NotificationSnackbar from '../components/shared/NotificationSnackbar';
import { useNotification } from '../hooks/useNotification';

const STATUS_CONFIG: Record<BookingStatus, { label: string; icon: string; cls: string }> = {
  pending:   { label: 'Chờ xác nhận', icon: '⏳', cls: 'pending' },
  confirmed: { label: 'Đã xác nhận',  icon: '✅', cls: 'confirmed' },
  cancelled: { label: 'Đã huỷ',       icon: '❌', cls: 'cancelled' },
  completed: { label: 'Hoàn thành',   icon: '🏅', cls: 'completed' },
};

const HistoryPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getBookingsByUser, cancelBooking } = useBookingStore();
  const { notification, notify, close: closeNotif } = useNotification();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');

  const bookings = currentUser ? getBookingsByUser(currentUser.id) : [];
  const sorted = [...bookings]
    .filter((b) => filterStatus === 'all' || b.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCancel = () => {
    if (cancelId) {
      cancelBooking(cancelId);
      setCancelId(null);
      notify('Đã huỷ lịch đặt sân thành công.', 'info');
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">📋 Lịch sử đặt sân</div>
        <div className="page-subtitle">Theo dõi và quản lý các lần đặt sân của bạn</div>
      </div>
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))' }}>
        {[
          { label: 'Tổng đặt',     value: bookings.length,                                          icon: '📅', bg: '#e8f5e9', ibg: '#c8e6c9' },
          { label: 'Chờ xác nhận', value: bookings.filter((b) => b.status === 'pending').length,    icon: '⏳', bg: '#fef3c7', ibg: '#fde68a' },
          { label: 'Đã xác nhận',  value: bookings.filter((b) => b.status === 'confirmed').length,  icon: '✅', bg: '#d1fae5', ibg: '#a7f3d0' },
          { label: 'Hoàn thành',   value: bookings.filter((b) => b.status === 'completed').length,  icon: '🏅', bg: '#dbeafe', ibg: '#bfdbfe' },
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
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4a5568' }}>Lọc:</span>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
          <Chip
            key={s}
            label={s === 'all' ? 'Tất cả' : `${STATUS_CONFIG[s as BookingStatus].icon} ${STATUS_CONFIG[s as BookingStatus].label}`}
            variant={filterStatus === s ? 'filled' : 'outlined'}
            color={filterStatus === s ? 'success' : 'default'}
            onClick={() => setFilterStatus(s)}
            size="small" sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#718096' }}>{sorted.length} lịch</span>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Chưa có lịch đặt sân nào</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Hãy đặt sân ngay!</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Mã đặt</th><th>Sân</th><th>Ngày</th><th>Khung giờ</th>
                    <th>Loại</th><th>Tổng tiền</th><th>Đặt lúc</th><th>Trạng thái</th><th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b) => {
                    const s = STATUS_CONFIG[b.status];
                    return (
                      <tr key={b.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#718096' }}>#{b.id.slice(-8).toUpperCase()}</span></td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.courtName}</div>
                          <div style={{ fontSize: 12, color: '#718096' }}>{formatCurrency(b.pricePerHour)}/giờ</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatDate(b.date)}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.startTime} – {b.endTime}</div>
                          <div style={{ fontSize: 12, color: '#718096' }}>{b.hours} giờ</div>
                        </td>
                        <td>
                          <Chip label={b.courtType === 'fixed' ? '⭐ Cố định' : '🎯 Vãng lai'} size="small" color={b.courtType === 'fixed' ? 'warning' : 'info'} variant="outlined" />
                        </td>
                        <td><span style={{ fontWeight: 800, color: '#1a472a', fontSize: 15 }}>{formatCurrency(b.totalPrice)}</span></td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{formatDateTime(b.createdAt)}</td>
                        <td><span className={`status-badge ${s.cls}`}>{s.icon} {s.label}</span></td>
                        <td>
                          {b.status === 'pending' && (
                            <Button size="small" color="error" variant="outlined" onClick={() => setCancelId(b.id)} sx={{ fontSize: 12 }}>Huỷ</Button>
                          )}
                          {b.status !== 'pending' && <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>}
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
      <Dialog open={!!cancelId} onClose={() => setCancelId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>⚠️ Xác nhận huỷ</DialogTitle>
        <DialogContent><Alert severity="warning" sx={{ borderRadius: 2 }}>Bạn có chắc muốn huỷ lịch đặt sân này không?</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCancelId(null)} color="inherit">Không</Button>
          <Button variant="contained" color="error" onClick={handleCancel} sx={{ fontWeight: 700 }}>Xác nhận huỷ</Button>
        </DialogActions>
      </Dialog>
      <NotificationSnackbar open={notification.open} msg={notification.msg} type={notification.type} onClose={closeNotif} />
    </div>
  );
};

export default HistoryPage;
