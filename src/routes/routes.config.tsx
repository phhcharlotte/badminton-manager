// src/routes/routes.config.tsx
import React from "react";
import { UserRole } from "@/types";

import DashboardPage from "@/pages/DashboardPage";
import CourtsPage from "@/pages/CourtsPage";
import BookingFlowPage from "@/pages/BookingFlowPage";
import HistoryPage from "@/pages/HistoryPage";
import ManageBookingsPage from "@/pages/ManageBookingsPage";
import ManageCourtsPage from "@/pages/ManageCourtsPage";
import ManageUsersPage from "@/pages/ManageUsersPage";
import ProfilePage from "@/pages/ProfilePage";
import RevenuePage from "@/pages/RevenuePage";

import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import SportsTennisIcon from "@mui/icons-material/SportsTennisOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import StadiumIcon from "@mui/icons-material/StadiumOutlined";
import PeopleAltIcon from "@mui/icons-material/PeopleAltOutlined";
import PaidIcon from "@mui/icons-material/PaidOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import { SvgIconComponent } from "@mui/icons-material";

export type PageKey =
  | "dashboard"
  | "courts"
  | "booking"
  | "history"
  | "manage-bookings"
  | "manage-courts"
  | "manage-users"
  | "revenue"
  | "profile";

// Nguon su that DUY NHAT cho phan quyen theo trang.
// Sidebar va ProtectedRoute deu doc tu day, khong tu khai bao rieng nua.
export const PAGE_ROLES: Record<PageKey, UserRole[]> = {
  dashboard: ["admin", "manager"],
  courts: ["admin", "manager", "customer"],
  booking: ["customer"],
  history: ["customer"],
  "manage-bookings": ["admin", "manager"],
  "manage-courts": ["admin"],
  "manage-users": ["admin"],
  revenue: ["admin", "manager"],
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
  revenue: "Kế toán / Doanh thu",
  profile: "Hồ sơ cá nhân",
};

export interface NavItem {
  // Truoc day la emoji string, gio la component icon cua MUI.
  // Render trong Sidebar bang <item.icon fontSize="small" /> thay vi {item.icon}
  icon: SvgIconComponent;
  label: string;
  key: PageKey;
  badge?: "pending";
}

// Danh sach menu sidebar - KHONG khai bao rieng "roles" o day nua,
// quyen hien thi luon lay tu PAGE_ROLES[item.key] de tranh 2 nguon du lieu bi lech nhau.
export const NAV_ITEMS: NavItem[] = [
  { icon: DashboardIcon, label: "Tổng quan", key: "dashboard" },
  { icon: SportsTennisIcon, label: "Danh sách sân", key: "courts" },
  { icon: EventAvailableIcon, label: "Đặt sân", key: "booking" },
  { icon: HistoryIcon, label: "Lịch sử đặt sân", key: "history" },
  {
    icon: AssignmentIcon,
    label: "Quản lý đặt sân",
    key: "manage-bookings",
    badge: "pending",
  },
  { icon: StadiumIcon, label: "Quản lý sân", key: "manage-courts" },
  {
    icon: PeopleAltIcon,
    label: "Quản lý người dùng",
    key: "manage-users",
  },
  { icon: PaidIcon, label: "Kế toán / Doanh thu", key: "revenue" },
  { icon: PersonOutlineIcon, label: "Hồ sơ cá nhân", key: "profile" },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: " Admin",
  manager: " Quản lý",
  customer: " Khách hàng",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "#fca5a5",
  manager: "#fde68a",
  customer: "#93c5fd",
};

// Trang mac dinh sau khi dang nhap, theo role
export const getDefaultPage = (role: UserRole): PageKey => {
  if (role === "admin" || role === "manager") return "dashboard";
  return "booking";
};

// Kiem tra 1 role co duoc phep vao 1 trang khong - dung chung cho Sidebar + ProtectedRoute
export const canAccessPage = (page: PageKey, role: UserRole): boolean => {
  return PAGE_ROLES[page]?.includes(role) ?? false;
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
    booking: <BookingFlowPage />,
    history: <HistoryPage />,
    "manage-bookings": <ManageBookingsPage />,
    "manage-courts": <ManageCourtsPage />,
    "manage-users": <ManageUsersPage />,
    revenue: <RevenuePage />,
    profile: <ProfilePage />,
  };

  return pageMap[page];
};
