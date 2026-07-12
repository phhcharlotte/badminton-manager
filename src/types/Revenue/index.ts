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

export interface RevenueByCourtRow {
  courtId: string;
  courtName: string;
  revenue: number;
  bookingsCount: number;
}
