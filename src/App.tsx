// src/App.tsx
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuthStore } from './store/authStore';
import { UserRole } from './types';

import LoginPage from './pages/LoginPage';
import Sidebar from './components/shared/Sidebar';
import MobileNavbar from './components/shared/MobileNavbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

import DashboardPage from './pages/DashboardPage';
import CourtsPage from './pages/CourtsPage';
import BookingPage from './pages/BookingPage';
import HistoryPage from './pages/HistoryPage';
import ManageBookingsPage from './pages/ManageBookingsPage';
import ManageCourtsPage from './pages/ManageCourtsPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ProfilePage from './pages/ProfilePage';

import './styles/main.scss';

// ── MUI Theme ─────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:   { main: '#1a472a' },
    success:   { main: '#2d6a4f' },
    secondary: { main: '#52b788' },
  },
  typography: {
    fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 8 },
          '& .MuiInputLabel-root':    { fontFamily: "'Nunito', sans-serif" },
          '& .MuiOutlinedInput-input':{ fontFamily: "'Nunito', sans-serif" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontFamily: "'Nunito', sans-serif", fontWeight: 700 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { fontFamily: "'Nunito', sans-serif", fontWeight: 600, borderRadius: 10 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { fontFamily: "'Nunito', sans-serif" },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontFamily: "'Nunito', sans-serif" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontFamily: "'Nunito', sans-serif" },
      },
    },
  },
});

// ── Page type ──────────────────────────────────────────────────────────
export type PageKey =
  | 'dashboard'
  | 'courts'
  | 'booking'
  | 'history'
  | 'manage-bookings'
  | 'manage-courts'
  | 'manage-users'
  | 'profile';

const PAGE_ROLES: Record<PageKey, UserRole[]> = {
  dashboard:        ['admin', 'staff'],
  courts:           ['admin', 'staff', 'user'],
  booking:          ['user'],
  history:          ['user'],
  'manage-bookings':['admin', 'staff'],
  'manage-courts':  ['admin'],
  'manage-users':   ['admin'],
  profile:          ['admin', 'staff', 'user'],
};

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard:        'Tổng quan',
  courts:           'Danh sách sân',
  booking:          'Đặt sân',
  history:          'Lịch sử đặt sân',
  'manage-bookings':'Quản lý đặt sân',
  'manage-courts':  'Quản lý sân',
  'manage-users':   'Quản lý người dùng',
  profile:          'Hồ sơ cá nhân',
};

const getDefaultPage = (role: UserRole): PageKey => {
  if (role === 'admin' || role === 'staff') return 'dashboard';
  return 'booking';
};

// ── Empty State ────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="empty-state" style={{ minHeight: '70vh', justifyContent: 'center' }}>
    <div className="empty-icon">🏸</div>
    <div className="empty-title">Chào mừng đến BadmintonHub!</div>
    <div className="empty-desc">Chọn mục từ menu bên trái để bắt đầu.</div>
  </div>
);

// ── App ────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuthStore();
  const [activePage, setActivePage] = useState<PageKey | ''>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Default page on login
  useEffect(() => {
    if (currentUser) {
      setActivePage(getDefaultPage(currentUser.role));
    } else {
      setActivePage('');
    }
  }, [currentUser?.id]); // eslint-disable-line

  // Document title
  useEffect(() => {
    document.title = activePage
      ? `${PAGE_TITLES[activePage as PageKey] || activePage} | BadmintonHub`
      : 'BadmintonHub – Đặt sân cầu lông';
  }, [activePage]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Not logged in ──
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLoginSuccess={() => {}} />
      </ThemeProvider>
    );
  }

  // ── Navigate handler ──
  const navigate = (page: string) => {
    setActivePage(page as PageKey);
    setSidebarOpen(false);
  };

  // ── Render page ──
  const renderPage = () => {
    if (!activePage) return <EmptyState />;

    const role = currentUser?.role as UserRole;
    const allowedRoles = PAGE_ROLES[activePage as PageKey] ?? [];

    const pageMap: Record<PageKey, React.ReactNode> = {
      dashboard: <DashboardPage />,
      courts: (
        <CourtsPage
          showBookingButton={role === 'user'}
          onSelectCourt={role === 'user' ? () => navigate('booking') : undefined}
        />
      ),
      booking:          <BookingPage />,
      history:          <HistoryPage />,
      'manage-bookings':<ManageBookingsPage />,
      'manage-courts':  <ManageCourtsPage />,
      'manage-users':   <ManageUsersPage />,
      profile:          <ProfilePage />,
    };

    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        {pageMap[activePage as PageKey] ?? <EmptyState />}
      </ProtectedRoute>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div className="app-layout">
        {/* ── Sidebar (desktop + mobile) ── */}
        <Sidebar
          activePage={activePage}
          onNavigate={navigate}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* ── Mobile top bar ── */}
        <MobileNavbar
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={activePage}
        />

        {/* ── Main content ── */}
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
