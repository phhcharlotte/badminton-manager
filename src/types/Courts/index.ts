export type CourtType = "fixed" | "casual";
export interface PriceRule {
  startTime: string;
  endTime: string;
  pricePerHourFixed: number;
  pricePerHourCasual: number;
}

export interface CourtCategory {
  _id: string;
  name: string;
  description: string;
  priceRules: PriceRule[];
  isActive: boolean;
  createdAt: string;
}

export interface Court {
  _id: string;
  name: string;
  description: string;
  category: CourtCategory;
  image: string;
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
  category: string; // id CourtCategory
  image?: string;
  isActive?: boolean;
}
