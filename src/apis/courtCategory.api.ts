import { apiClient } from "./axiosClient";
import { CourtCategory } from "@/types/Courts";

export interface PriceRulePayload {
  startTime: string;
  endTime: string;
  pricePerHourFixed: number;
  pricePerHourCasual: number;
}

export interface CourtCategoryFormPayload {
  name: string;
  description?: string;
  priceRules: PriceRulePayload[];
  isActive?: boolean;
}

export const listCourtCategoriesApi = async () => {
  const { data } = await apiClient.get("/court-categories");
  return data.data.categories as CourtCategory[];
};

export const createCourtCategoryApi = async (
  payload: CourtCategoryFormPayload,
) => {
  const { data } = await apiClient.post("/court-categories", payload);
  return data.data.category as CourtCategory;
};

export const updateCourtCategoryApi = async (
  id: string,
  payload: Partial<CourtCategoryFormPayload>,
) => {
  const { data } = await apiClient.patch(`/court-categories/${id}`, payload);
  return data.data.category as CourtCategory;
};

export const deleteCourtCategoryApi = async (id: string) => {
  await apiClient.delete(`/court-categories/${id}`);
};
