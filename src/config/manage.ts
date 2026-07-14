import { UserRole } from "@/types";

export const AVATAR_COLORS: Record<UserRole, { bg: string; color: string }> = {
  admin: { bg: "#fee2e2", color: "#dc2626" },
  manager: { bg: "#fef3c7", color: "#d97706" },
  customer: { bg: "#dbeafe", color: "#2563eb" },
};
