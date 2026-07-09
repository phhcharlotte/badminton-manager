// src/pages/BookingPage.tsx
import React, { useState, useMemo } from 'react';
import { Button, TextField, Alert, Chip } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { useCourtStore } from '../store/courtStore';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { Court, TIME_SLOTS } from '../types';
import { formatCurrency, areConsecutive, buildTimeRange } from '../utils/helpers';
import NotificationSnackbar from '../components/shared/NotificationSnackbar';
import { useNotification } from '../hooks/useNotification';

type Step = 1 | 2 | 3;

const BookingPage: React.FC = () => {
  const { courts } = useCourtStore();
  const { addBooking, getBookedTimeSlots } = useBookingStore();
  const { currentUser } = useAuthStore();
  const { notification, notify, close: closeNotif } = useNotification();

  const activeCourts = courts.filter((c) => c.isActive);
  const [step, setStep] = useState<Step>(1);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [courtTypeFilter, setCourtTypeFilter] = useState<'all' | 'fixed' | 'casual'>('all');
  const [notes, setNotes] = useState('');

  const dateStr = selectedDate.format('YYYY-MM-DD');
  const todayStr = dayjs().format('YYYY-MM-DD');
  const currentHour = dayjs().hour();

  const bookedSlots = useMemo(
    () => (selectedCourt ? getBookedTimeSlots(selectedCourt.id, dateStr) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCourt?.id, dateStr]
  );

  const isPastSlot = (time: string): boolean => {
    if (dateStr > todayStr) return false;
    if (dateStr < todayStr) return true;
    return parseInt(time.split(':')[0]) <= currentHour;
  };

  const getSlotState = (time: string) => {
    if (bookedSlots.includes(time)) return 'booked';
    if (isPastSlot(time)) return 'past';
    if (selectedSlots.includes(time)) return 'selected';
    return 'available';
  };

  const toggleSlot = (time: string) => {
    const state = getSlotState(time);
    if (state === 'booked' || state === 'past') return;
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((s) => s !== time) : [...prev, time].sort()
    );
  };

  const { start: startTime, end: endTime, hours } = buildTimeRange(selectedSlots);
  const isContiguous = areConsecutive(selectedSlots);
  const totalPrice = selectedCourt ? hours * selectedCourt.pricePerHour : 0;

  const filteredCourts = activeCourts.filter(
    (c) => courtTypeFilter === 'all' || c.type === courtTypeFilter
  );

  const handleSelectCourt = (court: Court) => {
    setSelectedCourt(court);
    setSelectedSlots([]);
    setStep(2);
  };

  const handleDateChange = (val: Dayjs | null) => {
    if (val) { setSelectedDate(val); setSelectedSlots([]); }
  };

  const handleBook = () => {
    if (!selectedCourt || !currentUser || !selectedSlots.length || !isContiguous) return;
    addBooking({
      userId: currentUser.id,
      userName: currentUser.fullName,
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      date: dateStr,
      startTime,
      endTime,
      hours,
      totalPrice,
      status: 'pending',
      courtType: selectedCourt.type,
      pricePerHour: selectedCourt.pricePerHour,
      notes,
    });
    notify('🎉 Đặt sân thành công! Nhân viên sẽ xác nhận trong 30 phút.', 'success');
    setSelectedSlots([]);
    setNotes('');
    setStep(1);
    setSelectedCourt(null);
  };

  const steps = [
    { n: 1, label: 'Chọn sân', icon: '🏸' },
    { n: 2, label: 'Chọn ngày & giờ', icon: '📅' },
    { n: 3, label: 'Xác nhận đặt', icon: '✅' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <div className="fade-in-up">
        <div className="page-header">
          <div className="page-title">📅 Đặt sân cầu lông</div>
          <div className="page-subtitle">Thực hiện theo từng bước để hoàn tất đặt sân</div>
        </div>

        {/* ── Step progress bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'white', borderRadius: 16, padding: '16px 24px',
          boxShadow: '0 2px 8px rgba(26,71,42,0.08)', border: '1px solid #c8e6c9',
          marginBottom: 24,
        }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: s.n < step ? 'pointer' : 'default' }}
                onClick={() => { if (s.n < step) setStep(s.n as Step); }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: step >= s.n ? 'linear-gradient(135deg,#1a472a,#2d6a4f)' : '#e5e7eb',
                  color: step >= s.n ? 'white' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15, flexShrink: 0,
                  boxShadow: step === s.n ? '0 4px 14px rgba(26,71,42,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Bước {s.n}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: step === s.n ? 800 : 600,
                    color: step >= s.n ? '#1a472a' : '#9ca3af',
                  }}>
                    {s.icon} {s.label}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 3,
                  background: step > s.n ? 'linear-gradient(90deg,#1a472a,#2d6a4f)' : '#e5e7eb',
                  margin: '0 16px', borderRadius: 2, transition: 'background 0.4s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ══ STEP 1: Select Court ══ */}
        {step === 1 && (
          <div className="slide-in-right">
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['all', 'fixed', 'casual'] as const).map((t) => (
                <Chip
                  key={t}
                  label={t === 'all' ? '🏟️ Tất cả' : t === 'fixed' ? '⭐ Cố định' : '🎯 Vãng lai'}
                  variant={courtTypeFilter === t ? 'filled' : 'outlined'}
                  color={courtTypeFilter === t ? 'success' : 'default'}
                  onClick={() => setCourtTypeFilter(t)}
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                />
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 13, color: '#718096' }}>{filteredCourts.length} sân khả dụng</span>
            </div>

            <div className="court-grid">
              {filteredCourts.map((court) => (
                <div key={court.id} className="court-card" onClick={() => handleSelectCourt(court)}>
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
                    <button style={{
                      marginTop: 14, width: '100%', padding: '11px',
                      background: 'linear-gradient(135deg,#1a472a,#2d6a4f)',
                      color: 'white', border: 'none', borderRadius: 10,
                      fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}>
                      📅 Chọn sân này
                    </button>
                  </div>
                </div>
              ))}
              {filteredCourts.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Không tìm thấy sân phù hợp</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ STEP 2: Calendar + Time Slots ══ */}
        {step === 2 && selectedCourt && (
          <div className="slide-in-right">
            {/* Court summary strip */}
            <div style={{
              background: 'white', borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 2px 8px rgba(26,71,42,0.08)', border: '2px solid #52b788',
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 36 }}>{selectedCourt.image}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#1a472a' }}>{selectedCourt.name}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selectedCourt.description}</div>
                <div style={{ fontWeight: 700, color: '#2d6a4f', fontSize: 13, marginTop: 2 }}>
                  {selectedCourt.type === 'fixed' ? '⭐ Cố định' : '🎯 Vãng lai'} •{' '}
                  {formatCurrency(selectedCourt.pricePerHour)}/giờ
                </div>
              </div>
              <Button
                variant="outlined" size="small"
                onClick={() => { setStep(1); setSelectedSlots([]); }}
                sx={{ borderColor: '#52b788', color: '#1a472a', fontWeight: 700 }}
              >
                Đổi sân
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
              {/* Calendar */}
              <div className="card">
                <div className="card-header">📆 Chọn ngày</div>
                <div style={{ padding: '0 4px 8px' }}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    minDate={dayjs()}
                    maxDate={dayjs().add(30, 'day')}
                    sx={{
                      width: '100%',
                      '& .MuiPickersDay-root.Mui-selected': {
                        background: 'linear-gradient(135deg,#1a472a,#2d6a4f) !important',
                      },
                    }}
                  />
                </div>
                <div style={{
                  margin: '0 16px 16px', padding: '10px 14px',
                  background: '#e8f5e9', borderRadius: 10, fontSize: 13,
                  color: '#1a472a', fontWeight: 700, textAlign: 'center',
                }}>
                  {selectedDate.format('dddd, DD/MM/YYYY')}
                </div>
              </div>

              {/* Time Slots */}
              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⏰ Khung giờ</span>
                    {selectedSlots.length > 0 && (
                      <Chip
                        label={`${selectedSlots.length} giờ đã chọn`}
                        color="success" size="small"
                        onDelete={() => setSelectedSlots([])}
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <div className="slots-legend" style={{ marginBottom: 16 }}>
                    {[
                      { cls: 'available', label: 'Còn trống' },
                      { cls: 'booked', label: 'Đã đặt' },
                      { cls: 'selected', label: 'Đang chọn' },
                      { cls: 'past', label: 'Đã qua' },
                    ].map((l) => (
                      <div className="legend-item" key={l.cls}>
                        <div className={`legend-dot ${l.cls}`} />
                        <span>{l.label}</span>
                      </div>
                    ))}
                  </div>

                  {!isContiguous && selectedSlots.length > 1 && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                      ⚠️ Vui lòng chọn các khung giờ <strong>liên tiếp nhau</strong>!
                    </Alert>
                  )}

                  <div className="slots-grid">
                    {TIME_SLOTS.map((time) => {
                      const state = getSlotState(time);
                      const endH = parseInt(time.split(':')[0]) + 1;
                      return (
                        <button
                          key={time}
                          className={`time-slot-btn ${state}`}
                          onClick={() => toggleSlot(time)}
                        >
                          <span className="slot-time">
                            {time}–{String(endH).padStart(2, '0')}:00
                          </span>
                          <span className="slot-price">
                            {state === 'booked' ? '🔒 Đã đặt'
                              : state === 'past' ? '⏰ Đã qua'
                              : formatCurrency(selectedCourt.pricePerHour)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 20, gap: 16, flexWrap: 'wrap',
            }}>
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                sx={{ borderColor: '#c8e6c9', color: '#1a472a', fontWeight: 700 }}
              >
                ← Quay lại
              </Button>
              <div style={{ flex: 1 }} />
              {selectedSlots.length > 0 && isContiguous && (
                <div style={{
                  background: 'white', borderRadius: 12, padding: '12px 20px',
                  border: '2px solid #52b788', display: 'flex', gap: 24, alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(26,71,42,0.08)',
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#718096' }}>Thời gian</div>
                    <div style={{ fontWeight: 700, color: '#1a472a' }}>{startTime} – {endTime} ({hours}h)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#718096' }}>Tổng tiền</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#1a472a' }}>
                      {formatCurrency(totalPrice)}
                    </div>
                  </div>
                </div>
              )}
              <Button
                variant="contained"
                disabled={selectedSlots.length === 0 || !isContiguous}
                onClick={() => setStep(3)}
                sx={{
                  background: 'linear-gradient(135deg,#1a472a,#2d6a4f)',
                  fontWeight: 700, px: 3, py: 1.3,
                  '&:hover': { background: '#0d2614' },
                  '&:disabled': { background: '#e5e7eb' },
                }}
              >
                Tiếp theo →
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Confirm ══ */}
        {step === 3 && selectedCourt && (
          <div className="slide-in-right">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <div className="card">
                <div className="card-header">✅ Xác nhận thông tin đặt sân</div>
                <div className="card-body">
                  {/* Court banner */}
                  <div style={{
                    background: 'linear-gradient(135deg,#1a472a,#2d6a4f)',
                    borderRadius: 12, padding: '18px 22px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    color: 'white', marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 44 }}>{selectedCourt.image}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 21 }}>{selectedCourt.name}</div>
                      <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>
                        {selectedCourt.type === 'fixed' ? '⭐ Sân cố định' : '🎯 Sân vãng lai'}
                      </div>
                    </div>
                  </div>

                  {/* Summary rows */}
                  <div className="booking-summary" style={{ marginBottom: 20 }}>
                    {[
                      { label: '📆 Ngày đặt', value: selectedDate.format('dddd, DD/MM/YYYY') },
                      { label: '⏰ Khung giờ', value: `${startTime} – ${endTime}` },
                      { label: '🕐 Số giờ', value: `${hours} giờ` },
                      { label: '💰 Đơn giá', value: `${formatCurrency(selectedCourt.pricePerHour)}/giờ` },
                      { label: '👤 Đặt bởi', value: currentUser?.fullName || '' },
                    ].map((r) => (
                      <div className="summary-row" key={r.label}>
                        <span className="summary-label">{r.label}</span>
                        <span className="summary-value">{r.value}</span>
                      </div>
                    ))}
                    <div className="summary-row total">
                      <span className="summary-label">💵 Tổng thanh toán</span>
                      <span className="summary-value">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  <TextField
                    fullWidth label="Ghi chú (tuỳ chọn)"
                    placeholder="VD: Cần thêm vợt, yêu cầu đặc biệt..."
                    multiline rows={2} value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    size="small" sx={{ mb: 2 }}
                  />

                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    Sau khi đặt, nhân viên sẽ xác nhận trong <strong>30 phút</strong>. Theo dõi tại trang <strong>Lịch sử đặt sân</strong>.
                  </Alert>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button
                      fullWidth variant="outlined"
                      onClick={() => setStep(2)}
                      sx={{ borderColor: '#c8e6c9', color: '#1a472a', fontWeight: 700 }}
                    >
                      ← Quay lại
                    </Button>
                    <Button
                      fullWidth variant="contained"
                      onClick={handleBook}
                      sx={{
                        background: 'linear-gradient(135deg,#1a472a,#2d6a4f)',
                        fontWeight: 800, py: 1.5, fontSize: 15,
                        '&:hover': { background: '#0d2614' },
                      }}
                    >
                      🏸 Xác nhận đặt sân
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NotificationSnackbar
        open={notification.open} msg={notification.msg}
        type={notification.type} onClose={closeNotif}
      />
    </LocalizationProvider>
  );
};

export default BookingPage;
