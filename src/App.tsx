// src/App.tsx
import React, { useState, useEffect, useRef, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";

import PublicBookingLanding from "@/pages/PublicBookingLanding";

import Sidebar from "@/components/shared/Sidebar";
import Loading from "@/components/shared/Loading";
import EmptyState from "@/components/shared/EmtyState";
import MobileNavbar from "@/components/shared/MobileNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useBookingSocketEvents } from "@/hooks/useBookingSocketEvents";
import { useBookingFlowStore } from "@/store/bookingFlowStore";

import {
  PageKey,
  PAGE_ROLES,
  PAGE_TITLES,
  getDefaultPage,
  renderPageComponent,
} from "@/routes/routes.config";

import "./styles/main.scss";
import theme from "./styles";

const App: React.FC = () => {
  const { isAuthenticated, currentUser, isLoading, initAuth } = useAuthStore();
  const [activePage, setActivePage] = useState<PageKey | "">("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useBookingSocketEvents(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      useBookingFlowStore.getState().reset();
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // Default page on login
  useEffect(() => {
    if (currentUser) {
      setActivePage(getDefaultPage(currentUser.role));
    } else {
      setActivePage("");
    }
  }, [currentUser?._id]);

  // Document title
  useEffect(() => {
    document.title = activePage
      ? `${PAGE_TITLES[activePage as PageKey] || activePage} | BadmintonHub`
      : "BadmintonHub – Đặt sân cầu lông";
  }, [activePage]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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
        <Loading />
      </ThemeProvider>
    );
  }

  // ── Not logged in: trang chu cong khai -> dang nhap ──
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PublicBookingLanding />
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

  const PageLoadingFallback: React.FC = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "#1a472a",
        fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
      }}>
      Đang tải trang...
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={navigate}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {isMobile && (
          <MobileNavbar
            onMenuClick={() => setSidebarOpen(true)}
            pageTitle={activePage}
          />
        )}

        <main className="main-content">
          <Suspense fallback={<PageLoadingFallback />}>{renderPage()}</Suspense>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
