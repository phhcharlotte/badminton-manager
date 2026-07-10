// src/api/court.api.ts
import { apiClient } from "./axiosClient";
import { Court, CourtType } from "@/types/Courts/index";

export interface ListCourtsParams {
  type?: CourtType;
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean; // chi admin/manager dung duoc field nay
}

export const listCourtsApi = async (params?: ListCourtsParams) => {
  const { data } = await apiClient.get("/courts", { params });
  return data.data as {
    courts: Court[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export const getCourtApi = async (id: string) => {
  const { data } = await apiClient.get(`/courts/${id}`);
  return data.data.court as Court;
};

// Cac ham duoi day danh cho trang "Quan ly san" (admin) - dung sau nay o ManageCourtsPage
export interface CourtFormPayload {
  name: string;
  description?: string;
  type: CourtType;
  pricePerHour: number;
  image?: string;
  isActive?: boolean;
}

export const createCourtApi = async (payload: CourtFormPayload) => {
  const { data } = await apiClient.post("/courts", payload);
  return data.data.court as Court;
};

export const updateCourtApi = async (
  id: string,
  payload: Partial<CourtFormPayload>,
) => {
  const { data } = await apiClient.patch(`/courts/${id}`, payload);
  return data.data.court as Court;
};

export const deleteCourtApi = async (id: string) => {
  await apiClient.delete(`/courts/${id}`);
};
