export type CourtType = "fixed" | "casual";

export interface Court {
  _id: string;
  name: string;
  description: string;
  pricePerHourFixed: number;
  pricePerHourCasual: number;
  image: string; // key icon MUI, xem src/config/courtIcons.tsx
  isActive: boolean;
  createdAt: string;
}

export interface ListCourtsParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean; // chi admin/manager dung duoc field nay
}

// Cac ham duoi day danh cho trang "Quan ly san" (admin) - dung sau nay o ManageCourtsPage
export interface CourtFormPayload {
  name: string;
  description?: string;
  pricePerHourFixed: number;
  pricePerHourCasual: number;
  image?: string;
  isActive?: boolean;
}
