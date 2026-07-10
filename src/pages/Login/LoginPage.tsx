// src/pages/LoginPage.tsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuthStore } from "@/store/authStore";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-hero fade-in-up">
          <span className="hero-icon">🏸</span>
          <h1>
            BadmintonHub
            <br />
            Booking System
          </h1>
          <p>
            Hệ thống đặt sân cầu lông hiện đại, nhanh chóng và tiện lợi cho mọi
            người.
          </p>
          <div className="features">
            {[
              { icon: "📅", text: "Đặt sân theo ngày và khung giờ linh hoạt" },
              { icon: "💰", text: "Giá rõ ràng: cố định và vãng lai" },
              { icon: "📊", text: "Quản lý đặt sân toàn diện cho admin" },
              { icon: "✅", text: "Theo dõi lịch sử đặt sân real-time" },
            ].map((f, i) => (
              <div className="feature-item" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-card fade-in-up">
          <div className="login-form-header">
            <h2>Đăng nhập</h2>
            <p>Vui lòng nhập thông tin tài khoản</p>
          </div>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: 15,
                background: "linear-gradient(135deg, #1a472a, #2d6a4f)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0d2614, #1a472a)",
                },
              }}>
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
