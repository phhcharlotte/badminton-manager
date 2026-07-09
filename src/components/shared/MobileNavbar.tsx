// src/components/shared/MobileNavbar.tsx
import React from 'react';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface Props {
  onMenuClick: () => void;
  pageTitle: string;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard:        '🏠 Tổng quan',
  courts:           '🏸 Danh sách sân',
  booking:          '📅 Đặt sân',
  history:          '📋 Lịch sử đặt sân',
  'manage-bookings':'📊 Quản lý đặt sân',
  'manage-courts':  '🏟️ Quản lý sân',
  'manage-users':   '👥 Quản lý người dùng',
  profile:          '👤 Hồ sơ cá nhân',
};

const MobileNavbar: React.FC<Props> = ({ onMenuClick, pageTitle }) => (
  <div className="mobile-navbar">
    <IconButton onClick={onMenuClick} sx={{ color: 'white' }}>
      <MenuIcon />
    </IconButton>
    <span className="mobile-navbar-title">
      {PAGE_TITLES[pageTitle] || 'BadmintonHub'}
    </span>
    <span style={{ width: 40 }} />
  </div>
);

export default MobileNavbar;
