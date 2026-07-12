// src/components/auth/LoginPromptDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";
import { useAuthStore } from "@/store/authStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Mode = "login" | "register";

const LoginPromptDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { login, registerCustomer } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result =
      mode === "login"
        ? await login(email, password)
        : await registerCustomer({
            fullName,
            email,
            password,
            phone: phone || undefined,
          });
    setLoading(false);
    if (result.success) {
      resetForm();
      onSuccess?.();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
        <LoginIcon />{" "}
        {mode === "login"
          ? "Đăng nhập để tiếp tục"
          : "Tạo tài khoản khách hàng"}
      </DialogTitle>
      <Tabs
        value={mode}
        onChange={(_e, v) => {
          setMode(v);
          setError("");
        }}
        variant="fullWidth"
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab value="login" label="Đăng nhập" />
        <Tab value="register" label="Đăng ký" />
      </Tabs>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Lựa chọn sân/giờ của bạn sẽ được giữ nguyên sau khi{" "}
            {mode === "login" ? "đăng nhập" : "đăng ký"}.
          </Alert>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {mode === "register" && (
            <TextField
              fullWidth
              label="Họ tên đầy đủ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              size="small"
              sx={{ mb: 2 }}
            />
          )}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
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
            size="small"
            sx={{ mb: mode === "register" ? 2 : 0 }}
            helperText={
              mode === "register"
                ? "Tối thiểu 8 ký tự, có hoa/thường/số/ký tự đặc biệt"
                : undefined
            }
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
          {mode === "register" && (
            <TextField
              fullWidth
              label="Số điện thoại (tuỳ chọn)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              size="small"
              placeholder="0912345678"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Huỷ
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
              fontWeight: 700,
            }}>
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : mode === "login" ? (
              "Đăng nhập"
            ) : (
              "Đăng ký"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoginPromptDialog;
