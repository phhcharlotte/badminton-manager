// src/pages/CourtsPage.tsx
import React, { useState } from 'react';
import { TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCourtStore } from '../store/courtStore';
import { Court } from '../types';
import { formatCurrency } from '../utils/helpers';

interface Props {
  onSelectCourt?: (court: Court) => void;
  showBookingButton?: boolean;
}

const CourtsPage: React.FC<Props> = ({ onSelectCourt, showBookingButton = false }) => {
  const { courts } = useCourtStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'casual'>('all');

  const filtered = courts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchSearch && matchType && c.isActive;
  });

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">🏟️ Danh sách sân cầu lông</div>
        <div className="page-subtitle">Xem tất cả sân hiện có và đặt lịch phù hợp</div>
      </div>
      <div className="filter-bar">
        <TextField
          size="small" placeholder="Tìm kiếm sân..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select size="small" label="Loại sân"
          value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="fixed">⭐ Cố định</MenuItem>
          <MenuItem value="casual">🎯 Vãng lai</MenuItem>
        </TextField>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#718096' }}>{filtered.length} sân khả dụng</span>
      </div>

      {/* Price info banner */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#fef3c7,#fde68a)', borderRadius: 12,
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: 1,
          border: '1px solid #f59e0b',
        }}>
          <span style={{ fontSize: 28 }}>⭐</span>
          <div>
            <div style={{ fontWeight: 800, color: '#92400e' }}>Sân cố định (Thuê dài hạn)</div>
            <div style={{ fontSize: 13, color: '#b45309' }}>Giá ưu đãi cho khách đặt cố định hàng tuần</div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', borderRadius: 12,
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: 1,
          border: '1px solid #3b82f6',
        }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <div>
            <div style={{ fontWeight: 800, color: '#1e40af' }}>Sân vãng lai (Đặt từng lần)</div>
            <div style={{ fontSize: 13, color: '#2563eb' }}>Linh hoạt, phù hợp mọi đối tượng</div>
          </div>
        </div>
      </div>

      <div className="court-grid">
        {filtered.map((court) => (
          <div
            key={court.id}
            className="court-card"
            onClick={() => onSelectCourt && onSelectCourt(court)}
          >
            <div className="court-card-image">
              {court.image}
              <div className={`court-type-badge ${court.type}`}>
                {court.type === 'fixed' ? '⭐ Cố định' : '🎯 Vãng lai'}
              </div>
            </div>
            <div className="court-card-body">
              <div className="court-name">{court.name}</div>
              <div className="court-desc">{court.description}</div>
              <div className="court-price">
                {formatCurrency(court.pricePerHour)}
                <span className="price-label">/ giờ</span>
              </div>
              {showBookingButton && (
                <button style={{
                  marginTop: 14, width: '100%', padding: '11px',
                  background: 'linear-gradient(135deg,#1a472a,#2d6a4f)',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>
                  📅 Đặt ngay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Không tìm thấy sân nào</div>
          <div style={{ fontSize: 14 }}>Thử thay đổi bộ lọc tìm kiếm</div>
        </div>
      )}
    </div>
  );
};

export default CourtsPage;
