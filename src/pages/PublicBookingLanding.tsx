import React, { useState } from "react";
import { Button } from "@mui/material";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import LoginIcon from "@mui/icons-material/Login";
import BookingFlowPage from "./BookingFlowPage";
import LoginPromptDialog from "@/components/auth/LoginPromptDialog";

const PublicBookingLanding: React.FC = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf9" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
          background: "white",
          boxShadow: "0 2px 8px rgba(26,71,42,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SportsTennisIcon sx={{ fontSize: 28, color: "#1a472a" }} />
          <span style={{ fontWeight: 900, fontSize: 18, color: "#1a472a" }}>
            BadmintonHub
          </span>
        </div>
        <Button
          variant="contained"
          startIcon={<LoginIcon />}
          onClick={() => setLoginOpen(true)}
          sx={{
            background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
            fontWeight: 700,
          }}>
          Đăng nhập
        </Button>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <BookingFlowPage />
      </div>

      <LoginPromptDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default PublicBookingLanding;
