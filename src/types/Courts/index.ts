export type CourtType = "fixed" | "casual";

export interface Court {
  _id: string;
  name: string;
  description: string;
  type: CourtType;
  pricePerHour: number;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export interface ListCourtsParams {
  type?: CourtType;
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean; // chi admin/manager dung duoc field nay
}

// Cac ham duoi day danh cho trang "Quan ly san" (admin) - dung sau nay o ManageCourtsPage
export interface CourtFormPayload {
  name: string;
  description?: string;
  type: CourtType;
  pricePerHour: number;
  image?: string;
  isActive?: boolean;
}
