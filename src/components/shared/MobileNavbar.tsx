import React from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SportsTennisOutlinedIcon from "@mui/icons-material/SportsTennisOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import BookOnlineOutlinedIcon from "@mui/icons-material/BookOnlineOutlined";
import StadiumOutlinedIcon from "@mui/icons-material/StadiumOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

interface Props {
  onMenuClick: () => void;
  pageTitle: string;
}

const PAGE_CONFIG: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
  }
> = {
  dashboard: {
    title: "Tổng quan",
    icon: <DashboardOutlinedIcon fontSize="small" />,
  },
  courts: {
    title: "Danh sách sân",
    icon: <SportsTennisOutlinedIcon fontSize="small" />,
  },
  booking: {
    title: "Đặt sân",
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
  },
  history: {
    title: "Lịch sử đặt sân",
    icon: <HistoryOutlinedIcon fontSize="small" />,
  },
  "manage-bookings": {
    title: "Quản lý đặt sân",
    icon: <BookOnlineOutlinedIcon fontSize="small" />,
  },
  "manage-courts": {
    title: "Quản lý sân",
    icon: <StadiumOutlinedIcon fontSize="small" />,
  },
  "manage-users": {
    title: "Quản lý người dùng",
    icon: <GroupOutlinedIcon fontSize="small" />,
  },
  profile: {
    title: "Hồ sơ cá nhân",
    icon: <PersonOutlineOutlinedIcon fontSize="small" />,
  },
};

const MobileNavbar: React.FC<Props> = ({ onMenuClick, pageTitle }) => {
  const page = PAGE_CONFIG[pageTitle];

  return (
    <Box
      className="mobile-navbar"
      display="flex"
      alignItems="center"
      justifyContent="space-between">
      <IconButton onClick={onMenuClick} sx={{ color: "white" }}>
        <MenuIcon />
      </IconButton>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ color: "white" }}>
        {page?.icon}
        <Typography fontWeight={600}>
          {page?.title ?? "BadmintonHub"}
        </Typography>
      </Stack>

      <Box width={40} />
    </Box>
  );
};

export default MobileNavbar;
