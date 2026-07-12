import { apiClient } from "./axiosClient";

export interface PublicCourtStats {
  totalCourts: number;
  availableNow: number;
  bookedNow: number;
  currentSlot: string;
  date: string;
}

export const getPublicCourtStatsApi = async () => {
  const { data } = await apiClient.get("/public/court-stats");
  return data.data as PublicCourtStats;
};
