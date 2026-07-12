import {
  GroupBy,
  RevenueByCourtRow,
  RevenueReport,
  RevenueSummary,
} from "@/types/Revenue";
import { apiClient } from "./axiosClient";

export const getRevenueSummaryApi = async (courtId?: string) => {
  const { data } = await apiClient.get("/bookings/revenue/summary", {
    params: { courtId },
  });
  return data.data as RevenueSummary;
};

export const getRevenueReportApi = async (params: {
  groupBy: GroupBy;
  from?: string;
  to?: string;
  courtId?: string;
}) => {
  const { data } = await apiClient.get("/bookings/revenue/report", { params });
  return data.data as RevenueReport;
};

export const getRevenueByCourtApi = async (params?: {
  from?: string;
  to?: string;
}) => {
  const { data } = await apiClient.get("/bookings/revenue/by-court", {
    params,
  });
  return data.data.data as RevenueByCourtRow[];
};
