// src/pages/DashboardPage.tsx
import React from 'react';
import { useBookingStore } from '../store/bookingStore';
import { useCourtStore } from '../store/courtStore';
import { useAuthStore } from '../store/authStore';
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

const DashboardPage: React.FC = () => {
  const { getAllBookings, updateBookingStatus } = useBookingStore();
  const { courts } = useCourtStore();
  const { users, currentUser } = useAuthStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const allBookings = getAllBookings();
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = allBookings.filter((b) => b.date === today && b.status !== 'cancelled');
  const revenue = allBookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0);
  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const handleStatus = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    const labels: Record<string, string> = {
      confirmed: 'Đã xác nhận lịch đặt sân!',
      cancelled: 'Đã huỷ lịch đặt sân.',
      completed: 'Đã đánh dấu hoàn thành!',
    };
    notify(labels[status] || 'Cập nhật thành công!', status === 'cancelled' ? 'warning' : 'success');
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">🏠 Tổng quan hệ thống</div>
        <div className="page-subtitle">
          Xin chào, <strong>{currentUser?.fullName}</strong>! Đây là tình trạng hôm nay.
        </div>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        {[
          { label: 'Tổng đặt sân',   value: allBookings.length,                          icon: '📅', bg: '#e8f5e9', ibg: '#c8e6c9' },
          { label: 'Đặt hôm nay',    value: todayBookings.length,                        icon: '🗓️', bg: '#dbeafe', ibg: '#bfdbfe' },
          { label: 'Chờ xác nhận',   value: allBookings.filter((b) => b.status === 'pending').length, icon: '⏳', bg: '#fef3c7', ibg: '#fde68a' },
          { label: 'Sân hoạt động',  value: courts.filter((c) => c.isActive).length,     icon: '🏟️', bg: '#f3e8ff', ibg: '#e9d5ff' },
          { label: 'Khách hàng',     value: users.filter((u) => u.role === 'user').length, icon: '👥', bg: '#fee2e2', ibg: '#fecaca' },
          { label: 'Doanh thu',      value: formatCurrency(revenue),                     icon: '💰', bg: '#d1fae5', ibg: '#a7f3d0' },
        ].map((s) => (
          <div className="stat-card" key={s.label} style={{ background: s.bg }}>
            <div className="stat-icon" style={{ background: s.ibg }}>{s.icon}</div>
            <div className="stat-content">
              <div className="stat-value" style={{ fontSize: typeof s.value === 'string' && s.value.length > 8 ? 15 : 28 }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Recent bookings */}
        <div className="card">
          <div className="card-header">📋 Lịch đặt gần đây</div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Chưa có lịch đặt nào</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Mã</th><th>Khách hàng</th><th>Sân</th><th>Ngày / Giờ</th>
                      <th>Tiền</th><th>Trạng thái</th><th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => {
                      const s = STATUS_CONFIG[b.status];
                      return (
                        <tr key={b.id}>
                          <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>#{b.id.slice(-6).toUpperCase()}</span></td>
                          <td style={{ fontWeight: 600 }}>{b.userName}</td>
                          <td>{b.courtName}</td>
                          <td>
                            <div style={{ fontSize: 13 }}>{formatDate(b.date)}</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>{b.startTime} – {b.endTime}</div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#1a472a' }}>{formatCurrency(b.totalPrice)}</td>
                          <td><span className={`status-badge ${s.cls}`}>{s.icon} {s.label}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {b.status === 'pending' && (
                                <>
                                  <button onClick={() => handleStatus(b.id, 'confirmed')} style={{ padding: '4px 10px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#065f46' }}>✅ Xác nhận</button>
                                  <button onClick={() => handleStatus(b.id, 'cancelled')} style={{ padding: '4px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#991b1b' }}>❌ Huỷ</button>
                                </>
                              )}
                              {b.status === 'confirmed' && (
                                <button onClick={() => handleStatus(b.id, 'completed')} style={{ padding: '4px 10px', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#1e40af' }}>🏅 Hoàn thành</button>
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

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Court occupancy */}
          <div className="card">
            <div className="card-header">🏟️ Tình trạng sân hôm nay</div>
            <div className="card-body">
              {courts.filter((c) => c.isActive).map((court) => {
                const booked = allBookings.filter((b) => b.courtId === court.id && b.date === today && b.status !== 'cancelled').reduce((s, b) => s + b.hours, 0);
                const pct = Math.min((booked / 16) * 100, 100);
                return (
                  <div key={court.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 700 }}>{court.image} {court.name}</span>
                      <span style={{ color: '#718096' }}>{booked}h/16h</span>
                    </div>
                    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct > 75 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e', borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking status distribution */}
          <div className="card">
            <div className="card-header">📊 Phân bổ trạng thái</div>
            <div className="card-body">
              {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((status) => {
                const count = allBookings.filter((b) => b.status === status).length;
                const pct = allBookings.length > 0 ? (count / allBookings.length) * 100 : 0;
                const s = STATUS_CONFIG[status];
                const barColor = status === 'pending' ? '#f59e0b' : status === 'confirmed' ? '#22c55e' : status === 'completed' ? '#3b82f6' : '#ef4444';
                return (
                  <div key={status} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span className={`status-badge ${s.cls}`} style={{ padding: '2px 8px' }}>{s.icon} {s.label}</span>
                      <span style={{ fontWeight: 700 }}>{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <NotificationSnackbar open={notification.open} msg={notification.msg} type={notification.type} onClose={closeNotif} />
    </div>
  );
};

export default DashboardPage;
