// src/components/shared/Sidebar.tsx
import React from "react";

import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import {
  NAV_ITEMS,
  ROLE_LABELS,
  ROLE_COLORS,
  canAccessPage,
} from "@/routes/routes.config";

import SportsTennisOutlinedIcon from "@mui/icons-material/SportsTennisOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  mobileOpen,
  onMobileClose,
}) => {
  const { currentUser, logout } = useAuthStore();
  const { getAllBookings } = useBookingStore();

  const pendingCount = getAllBookings().filter(
    (b) => b.status === "pending",
  ).length;

  // Loc menu theo PAGE_ROLES trong routes.config, khong con khai bao "roles" rieng o Sidebar nua
  const visibleItems = NAV_ITEMS.filter(
    (item) => currentUser && canAccessPage(item.key, currentUser.role),
  );

  const handleNav = (key: string) => {
    onNavigate(key);
    onMobileClose?.();
  };

  const sidebarContent = (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <SportsTennisOutlinedIcon className="logo-icon" fontSize="medium" />
        <div className="logo-title">BadmintonHub</div>
        <div className="logo-subtitle">Booking System</div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="nav-section-label">Menu chính</div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const hasBadge = item.badge === "pending" && pendingCount > 0;
          return (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? "active" : ""}`}
              onClick={() => handleNav(item.key)}>
              <Icon className="nav-icon" fontSize="small" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {hasBadge && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "1px 7px",
                    minWidth: 20,
                    textAlign: "center",
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
            onClick={() => handleNav("profile")}
            style={{ cursor: "pointer" }}>
            <div
              className="user-avatar"
              style={{
                background: ROLE_COLORS[currentUser.role] || "#52b788",
                color: "#1a1a1a",
              }}>
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.fullName}</div>
              <div className="user-role" style={{ fontSize: 11 }}>
                {ROLE_LABELS[currentUser.role]}
              </div>
            </div>
            <ChevronRightIcon style={{ opacity: 0.5 }} fontSize="small" />
          </div>
        )}
        <button className="logout-btn" onClick={() => logout()}>
          <LogoutOutlinedIcon
            fontSize="small"
            style={{ marginRight: 6, verticalAlign: "middle" }}
          />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop">{sidebarContent}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="sidebar-overlay" onClick={onMobileClose} />
          <div className="sidebar-mobile-open">{sidebarContent}</div>
        </>
      )}
    </>
  );
};

export default Sidebar;
