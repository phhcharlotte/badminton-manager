// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import {
  TextField, Button, Alert, IconButton, InputAdornment, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(username, password);
    setLoading(false);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u); setPassword(p); setError('');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-hero fade-in-up">
          <span className="hero-icon">🏸</span>
          <h1>BadmintonHub<br />Booking System</h1>
          <p>Hệ thống đặt sân cầu lông hiện đại, nhanh chóng và tiện lợi cho mọi người.</p>
          <div className="features">
            {[
              { icon: '📅', text: 'Đặt sân theo ngày và khung giờ linh hoạt' },
              { icon: '💰', text: 'Giá rõ ràng: cố định và vãng lai' },
              { icon: '📊', text: 'Quản lý đặt sân toàn diện cho admin' },
              { icon: '✅', text: 'Theo dõi lịch sử đặt sân real-time' },
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

          <div className="demo-accounts">
            <div className="demo-title">⚡ Tài khoản demo</div>
            {[
              { role: 'Admin', u: 'admin', p: 'admin123' },
              { role: 'Nhân viên', u: 'staff1', p: 'staff123' },
              { role: 'Khách hàng', u: 'user1', p: 'user123' },
            ].map((d) => (
              <div
                className="demo-item"
                key={d.role}
                style={{ cursor: 'pointer' }}
                onClick={() => fillDemo(d.u, d.p)}
              >
                <span className="demo-role">{d.role}</span>
                <span className="demo-creds">{d.u} / {d.p}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5, fontWeight: 700, fontSize: 15,
                background: 'linear-gradient(135deg, #1a472a, #2d6a4f)',
                '&:hover': { background: 'linear-gradient(135deg, #0d2614, #1a472a)' },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Đăng nhập'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
