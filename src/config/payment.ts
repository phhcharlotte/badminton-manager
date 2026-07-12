// src/config/payment.ts
export const BANK_CONFIG = {
  bankId: import.meta.env.VITE_BANK_ID || "vietcombank",
  accountNo: import.meta.env.VITE_BANK_ACCOUNT_NO || "0000000000",
  accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || "BADMINTONHUB",
};

/**
 * Sinh URL anh QR chuyen khoan theo chuan VietQR (dich vu cong khai, mien phi,
 * khong can dang ky API key). Ngan hang cua nguoi dat se tu doc duoc so tien
 * va noi dung chuyen khoan khi quet ma.
 */
export const buildVietQrUrl = (amount: number, note: string): string => {
  const { bankId, accountNo, accountName } = BANK_CONFIG;
  const encodedNote = encodeURIComponent(note);
  const encodedName = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedNote}&accountName=${encodedName}`;
};
