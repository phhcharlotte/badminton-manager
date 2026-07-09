// src/routes/routes.config.tsx
import React from "react";
import { UserRole } from "../types";

import DashboardPage from "../pages/DashboardPage";
import CourtsPage from "../pages/CourtsPage";
import BookingPage from "../pages/BookingPage";
import HistoryPage from "../pages/HistoryPage";
import ManageBookingsPage from "../pages/ManageBookingsPage";
import ManageCourtsPage from "../pages/ManageCourtsPage";
import ManageUsersPage from "../pages/ManageUsersPage";
import ProfilePage from "../pages/ProfilePage";

export type PageKey =
  | "dashboard"
  | "courts"
  | "booking"
  | "history"
  | "manage-bookings"
  | "manage-courts"
  | "manage-users"
  | "profile";

// Role nao duoc phep vao trang nao (khop dung 3 role BE tra ve: admin/manager/customer)
export const PAGE_ROLES: Record<PageKey, UserRole[]> = {
  dashboard: ["admin", "manager"],
  courts: ["admin", "manager", "customer"],
  booking: ["customer"],
  history: ["customer"],
  "manage-bookings": ["admin", "manager"],
  "manage-courts": ["admin"],
  "manage-users": ["admin"],
  profile: ["admin", "manager", "customer"],
};

export const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: "Tổng quan",
  courts: "Danh sách sân",
  booking: "Đặt sân",
  history: "Lịch sử đặt sân",
  "manage-bookings": "Quản lý đặt sân",
  "manage-courts": "Quản lý sân",
  "manage-users": "Quản lý người dùng",
  profile: "Hồ sơ cá nhân",
};

// Trang mac dinh sau khi dang nhap, theo role
export const getDefaultPage = (role: UserRole): PageKey => {
  if (role === "admin" || role === "manager") return "dashboard";
  return "booking";
};

// Ham render component cho tung trang - nhan role de tuy chinh props (giu dung logic cu cua CourtsPage)
export const renderPageComponent = (
  page: PageKey,
  role: UserRole,
  navigate: (page: string) => void,
): React.ReactNode => {
  const pageMap: Record<PageKey, React.ReactNode> = {
    dashboard: <DashboardPage />,
    courts: (
      <CourtsPage
        showBookingButton={role === "customer"}
        onSelectCourt={
          role === "customer" ? () => navigate("booking") : undefined
        }
      />
    ),
    booking: <BookingPage />,
    history: <HistoryPage />,
    "manage-bookings": <ManageBookingsPage />,
    "manage-courts": <ManageCourtsPage />,
    "manage-users": <ManageUsersPage />,
    profile: <ProfilePage />,
  };

  return pageMap[page];
};
