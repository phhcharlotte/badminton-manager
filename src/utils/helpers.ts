// src/utils/helpers.ts
import dayjs from 'dayjs';

export const formatCurrency = (amount: number): string =>
  amount.toLocaleString('vi-VN') + 'đ';

export const formatDate = (dateStr: string): string =>
  dayjs(dateStr).format('DD/MM/YYYY');

export const formatDateTime = (isoStr: string): string =>
  dayjs(isoStr).format('HH:mm DD/MM/YYYY');

export const generateId = (prefix = 'id'): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const isSlotPast = (dateStr: string, timeStr: string): boolean => {
  const now = dayjs();
  const slotTime = dayjs(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');
  return slotTime.isBefore(now);
};

export const buildTimeRange = (slots: string[]): { start: string; end: string; hours: number } => {
  if (!slots.length) return { start: '', end: '', hours: 0 };
  const sorted = [...slots].sort();
  const lastHour = parseInt(sorted[sorted.length - 1].split(':')[0]) + 1;
  return {
    start: sorted[0],
    end: `${String(lastHour).padStart(2, '0')}:00`,
    hours: sorted.length,
  };
};

export const areConsecutive = (slots: string[]): boolean => {
  if (slots.length <= 1) return true;
  const sorted = [...slots].sort();
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseInt(sorted[i - 1].split(':')[0]);
    const curr = parseInt(sorted[i].split(':')[0]);
    if (curr - prev !== 1) return false;
  }
  return true;
};
