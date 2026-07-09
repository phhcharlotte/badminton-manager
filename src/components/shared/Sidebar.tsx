// src/components/shared/Sidebar.tsx
import React from 'react';

import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';

interface NavItem {
  icon: string;
  label: string;
  key: string;
  roles: string[];
  badge?: 'pending';
}

const NAV_ITEMS: NavItem[] = [
  { icon: '🏠', label: 'Tổng quan',         key: 'dashboard',       roles: ['admin', 'staff'] },
  { icon: '🏸', label: 'Danh sách sân',     key: 'courts',          roles: ['admin', 'staff', 'user'] },
  { icon: '📅', label: 'Đặt sân',           key: 'booking',         roles: ['user'] },
  { icon: '📋', label: 'Lịch sử đặt sân',  key: 'history',         roles: ['user'] },
  { icon: '📊', label: 'Quản lý đặt sân',  key: 'manage-bookings', roles: ['admin', 'staff'], badge: 'pending' },
  { icon: '🏟️', label: 'Quản lý sân',      key: 'manage-courts',   roles: ['admin'] },
  { icon: '👥', label: 'Quản lý người dùng',key: 'manage-users',    roles: ['admin'] },
  { icon: '👤', label: 'Hồ sơ cá nhân',    key: 'profile',         roles: ['admin', 'staff', 'user'] },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: '👑 Quản lý',
  staff: '🧑‍💼 Nhân viên',
  user:  '🙋 Khách hàng',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#fca5a5',
  staff: '#fde68a',
  user:  '#93c5fd',
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, mobileOpen, onMobileClose }) => {
  const { currentUser, logout } = useAuthStore();
  const { getAllBookings } = useBookingStore();

  const pendingCount = getAllBookings().filter((b) => b.status === 'pending').length;

  const visibleItems = NAV_ITEMS.filter(
    (item) => currentUser && item.roles.includes(currentUser.role)
  );

  const handleNav = (key: string) => {
    onNavigate(key);
    onMobileClose?.();
  };

  const sidebarContent = (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-icon">🏸</span>
        <div className="logo-title">BadmintonHub</div>
        <div className="logo-subtitle">Booking System</div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="nav-section-label">Menu chính</div>
        {visibleItems.map((item) => {
          const hasBadge = item.badge === 'pending' && pendingCount > 0;
          return (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => handleNav(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {hasBadge && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  borderRadius: 999, fontSize: 11, fontWeight: 800,
                  padding: '1px 7px', minWidth: 20, textAlign: 'center',
                }}>
                  {pendingCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* User card + logout */}
      <div className="sidebar-user">
        {currentUser && (
          <div
            className="user-card"
            onClick={() => handleNav('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="user-avatar"
              style={{ background: ROLE_COLORS[currentUser.role] || '#52b788', color: '#1a1a1a' }}
            >
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.fullName}</div>
              <div className="user-role" style={{ fontSize: 11 }}>
                {ROLE_LABELS[currentUser.role]}
              </div>
            </div>
            <span style={{ fontSize: 14, opacity: 0.5 }}>›</span>
          </div>
        )}
        <button
          className="logout-btn"
          onClick={() => { logout(); }}
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={onMobileClose}
          />
          <div className="sidebar-mobile-open">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
