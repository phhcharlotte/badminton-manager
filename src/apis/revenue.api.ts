import { apiClient } from "./axiosClient";

export interface RevenuePeriodStat {
  revenue: number;
  bookingsCount: number;
}

export interface RevenueSummary {
  today: RevenuePeriodStat;
  thisWeek: RevenuePeriodStat;
  thisMonth: RevenuePeriodStat;
  thisQuarter: RevenuePeriodStat;
  thisYear: RevenuePeriodStat;
}

export const getRevenueSummaryApi = async (courtId?: string) => {
  const { data } = await apiClient.get("/bookings/revenue/summary", {
    params: { courtId },
  });
  return data.data as RevenueSummary;
};

export type GroupBy = "day" | "week" | "month" | "quarter" | "year";

export interface RevenueReportRow {
  period: string;
  revenue: number;
  bookingsCount: number;
}

export interface RevenueReport {
  groupBy: GroupBy;
  data: RevenueReportRow[];
  totalRevenue: number;
  totalBookings: number;
}

export const getRevenueReportApi = async (params: {
  groupBy: GroupBy;
  from?: string;
  to?: string;
  courtId?: string;
}) => {
  const { data } = await apiClient.get("/bookings/revenue/report", { params });
  return data.data as RevenueReport;
};

export interface RevenueByCourtRow {
  courtId: string;
  courtName: string;
  revenue: number;
  bookingsCount: number;
}

export const getRevenueByCourtApi = async (params?: {
  from?: string;
  to?: string;
}) => {
  const { data } = await apiClient.get("/bookings/revenue/by-court", {
    params,
  });
  return data.data.data as RevenueByCourtRow[];
};
