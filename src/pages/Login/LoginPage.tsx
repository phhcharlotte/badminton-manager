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
import {
  Visibility,
  VisibilityOff,
  SportsTennis,
  ArrowBack,
  CalendarMonth,
  Payments,
  AdminPanelSettings,
  History,
} from "@mui/icons-material";
import { useAuthStore } from "@/store/authStore";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type ViewMode = "login" | "register";

interface RegisterFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const initialRegisterForm: RegisterFormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<ViewMode>("login");

  // ----- Login state -----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  // ----- Register state (1 object duy nhất) -----
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(initialRegisterForm);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const registerCustomer = useAuthStore((s) => s.registerCustomer);

  const handleRegisterFieldChange =
    (field: keyof RegisterFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    const {
      fullName,
      email: regEmail,
      phone,
      password: regPassword,
      confirmPassword,
    } = registerForm;

    if (!fullName || !regEmail || !phone || !regPassword) {
      setRegError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setRegError("Số điện thoại không hợp lệ.");
      return;
    }

    if (regPassword !== confirmPassword) {
      setRegError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setRegLoading(true);
    try {
      const result = await registerCustomer({
        fullName,
        email: regEmail,
        password: regPassword,
        phone,
      });
      setRegLoading(false);
      if (result.success) {
        setRegSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          setView("login");
          setRegSuccess("");
          setRegisterForm(initialRegisterForm);
        }, 1200);
      } else {
        setRegError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setRegLoading(false);
      setRegError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Icon filled + màu riêng cho từng feature để phần hero sinh động hơn
  const features = [
    {
      icon: <CalendarMonth sx={{ fontSize: 20 }} />,
      text: "Đặt sân theo ngày và khung giờ linh hoạt",
      color: "#2d6a4f",
      bg: "rgba(82, 183, 136, 0.18)",
    },
    {
      icon: <Payments sx={{ fontSize: 20 }} />,
      text: "Giá rõ ràng: cố định và vãng lai",
      color: "#b45309",
      bg: "rgba(251, 191, 36, 0.2)",
    },
    {
      icon: <AdminPanelSettings sx={{ fontSize: 20 }} />,
      text: "Quản lý đặt sân toàn diện cho admin",
      color: "#1d4ed8",
      bg: "rgba(96, 165, 250, 0.2)",
    },
    {
      icon: <History sx={{ fontSize: 20 }} />,
      text: "Theo dõi lịch sử đặt sân real-time",
      color: "#be185d",
      bg: "rgba(244, 114, 182, 0.2)",
    },
  ];

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-hero fade-in-up">
          <span
            className="hero-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
            }}>
            <SportsTennis sx={{ fontSize: 32 }} />
          </span>
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
            {features.map((f, i) => (
              <div className="feature-item" key={i}>
                <div
                  className="feature-icon"
                  style={{
                    color: f.color,
                    backgroundColor: f.bg,
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {f.icon}
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        {view === "login" ? (
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
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          size="small">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
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

              <div style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
                Chưa có tài khoản?{" "}
                <span
                  onClick={() => {
                    setError("");
                    setView("register");
                  }}
                  style={{
                    color: "#2d6a4f",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}>
                  Đăng ký ngay
                </span>
              </div>
            </form>
          </div>
        ) : (
          <div className="login-form-card fade-in-up">
            <div
              className="login-form-header"
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconButton
                onClick={() => {
                  setRegError("");
                  setRegSuccess("");
                  setView("login");
                }}
                size="small"
                aria-label="Quay lại đăng nhập">
                <ArrowBack />
              </IconButton>
              <div>
                <h2>Đăng ký</h2>
                <p>Tạo tài khoản mới để bắt đầu đặt sân</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={registerForm.fullName}
                onChange={handleRegisterFieldChange("fullName")}
                required
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={handleRegisterFieldChange("email")}
                required
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                type="tel"
                value={registerForm.phone}
                onChange={handleRegisterFieldChange("phone")}
                required
                variant="outlined"
                size="small"
                placeholder="0912345678"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                type={showRegPassword ? "text" : "password"}
                value={registerForm.password}
                onChange={handleRegisterFieldChange("password")}
                required
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          size="small">
                          {showRegPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                type={showRegPassword ? "text" : "password"}
                value={registerForm.confirmPassword}
                onChange={handleRegisterFieldChange("confirmPassword")}
                required
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />

              {regError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {regError}
                </Alert>
              )}
              {regSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {regSuccess}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={regLoading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: 15,
                  background: "linear-gradient(135deg, #1a472a, #2d6a4f)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0d2614, #1a472a)",
                  },
                }}>
                {regLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Hoàn tất đăng ký"
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
