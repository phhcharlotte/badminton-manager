// src/App.tsx
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuthStore } from "./store/authStore";
import { UserRole } from "./types";

import LoginPage from "./pages/Login/LoginPage";
import Sidebar from "./components/shared/Sidebar";
import MobileNavbar from "./components/shared/MobileNavbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import {
  PageKey,
  PAGE_ROLES,
  PAGE_TITLES,
  getDefaultPage,
  renderPageComponent,
} from "./routes/routes.config";

import "./styles/main.scss";

// ── MUI Theme ─────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#1a472a" },
    success: { main: "#2d6a4f" },
    secondary: { main: "#52b788" },
  },
  typography: {
    fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": { borderRadius: 8 },
          "& .MuiInputLabel-root": { fontFamily: "'Nunito', sans-serif" },
          "& .MuiOutlinedInput-input": { fontFamily: "'Nunito', sans-serif" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'Nunito', sans-serif", fontWeight: 700 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          borderRadius: 10,
        },
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

// ── Empty State ────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div
    className="empty-state"
    style={{ minHeight: "70vh", justifyContent: "center" }}>
    <div className="empty-icon">🏸</div>
    <div className="empty-title">Chào mừng đến BadmintonHub!</div>
    <div className="empty-desc">Chọn mục từ menu bên trái để bắt đầu.</div>
  </div>
);

// ── Loading toan man hinh (luc khoi phuc phien dang nhap) ──────────────
const FullScreenLoading: React.FC = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
      color: "#1a472a",
      fontWeight: 700,
    }}>
    Đang tải...
  </div>
);

// ── App ────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const { isAuthenticated, currentUser, isLoading, initAuth } = useAuthStore();
  const [activePage, setActivePage] = useState<PageKey | "">("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Khoi phuc phien dang nhap khi app vua load (F5, mo tab moi)
  // Access token trong bo nho da mat, nhung refreshToken (httpOnly cookie) van con
  // -> goi initAuth() de lay lai access token + thong tin user ma khong can dang nhap lai
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Default page on login
  useEffect(() => {
    if (currentUser) {
      setActivePage(getDefaultPage(currentUser.role));
    } else {
      setActivePage("");
    }
  }, [currentUser?._id]); // eslint-disable-line

  // Document title
  useEffect(() => {
    document.title = activePage
      ? `${PAGE_TITLES[activePage as PageKey] || activePage} | BadmintonHub`
      : "BadmintonHub – Đặt sân cầu lông";
  }, [activePage]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Dang khoi phuc phien dang nhap ──
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullScreenLoading />
      </ThemeProvider>
    );
  }

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

    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        {renderPageComponent(activePage as PageKey, role, navigate) ?? (
          <EmptyState />
        )}
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
        <main className="main-content">{renderPage()}</main>
      </div>
    </ThemeProvider>
  );
};

export default App;
