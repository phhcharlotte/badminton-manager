import React, { useEffect, useState } from "react";
import { TextField, MenuItem, CircularProgress, Alert } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import StadiumIcon from "@mui/icons-material/Stadium";
import {
  getRevenueSummaryApi,
  getRevenueReportApi,
  getRevenueByCourtApi,
} from "@/apis/revenue.api";
import { useCourtStore } from "@/store/courtStore";
import { formatCurrency, formatPeriodLabel } from "@/utils/helpers";
import {
  GroupBy,
  RevenueByCourtRow,
  RevenueReport,
  RevenueSummary,
} from "@/types/Revenue";
import { GROUP_BY_OPTIONS } from "@/config/revenue";

const RevenuePage: React.FC = () => {
  const { courts, fetchCourts } = useCourtStore();

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [reportError, setReportError] = useState("");

  const [byCourt, setByCourt] = useState<RevenueByCourtRow[]>([]);
  const [loadingByCourt, setLoadingByCourt] = useState(true);

  useEffect(() => {
    fetchCourts();
    getRevenueSummaryApi()
      .then(setSummary)
      .finally(() => setLoadingSummary(false));
  }, []);

  const loadReport = async () => {
    setLoadingReport(true);
    setReportError("");
    try {
      const data = await getRevenueReportApi({
        groupBy,
        from: fromDate || undefined,
        to: toDate || undefined,
        courtId: courtFilter === "all" ? undefined : courtFilter,
      });
      setReport(data);
    } catch (err: any) {
      setReportError(
        err?.response?.data?.message || "Không tải được báo cáo doanh thu!",
      );
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [groupBy, fromDate, toDate, courtFilter]);

  useEffect(() => {
    setLoadingByCourt(true);
    getRevenueByCourtApi({
      from: fromDate || undefined,
      to: toDate || undefined,
    })
      .then(setByCourt)
      .finally(() => setLoadingByCourt(false));
  }, [fromDate, toDate]);

  const maxRevenueInReport = report?.data.length
    ? Math.max(...report.data.map((r) => r.revenue))
    : 0;
  const maxRevenueByCourt = byCourt.length
    ? Math.max(...byCourt.map((c) => c.revenue))
    : 0;

  const summaryCards = summary
    ? [
        {
          label: "Hôm nay",
          stat: summary.today,
          Icon: TodayIcon,
          bg: "#e8f5e9",
          ibg: "#c8e6c9",
          color: "#1a472a",
        },
        {
          label: "Tuần này",
          stat: summary.thisWeek,
          Icon: DateRangeIcon,
          bg: "#dbeafe",
          ibg: "#bfdbfe",
          color: "#1e40af",
        },
        {
          label: "Tháng này",
          stat: summary.thisMonth,
          Icon: CalendarMonthIcon,
          bg: "#fef3c7",
          ibg: "#fde68a",
          color: "#b45309",
        },
        {
          label: "Quý này",
          stat: summary.thisQuarter,
          Icon: EventNoteIcon,
          bg: "#f3e8ff",
          ibg: "#e9d5ff",
          color: "#7c3aed",
        },
        {
          label: "Năm nay",
          stat: summary.thisYear,
          Icon: EventAvailableIcon,
          bg: "#d1fae5",
          ibg: "#a7f3d0",
          color: "#065f46",
        },
      ]
    : [];

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">
          <AccountBalanceIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Kế toán / Doanh thu
        </div>
        <div className="page-subtitle">
          Theo dõi doanh thu theo ngày, tuần, tháng, quý và năm
        </div>
      </div>

      {/* ── Tong quan nhanh ── */}
      {loadingSummary ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <CircularProgress size={28} />
        </div>
      ) : (
        <div className="stat-cards">
          {summaryCards.map((s) => (
            <div
              className="stat-card"
              key={s.label}
              style={{ background: s.bg }}>
              <div className="stat-icon" style={{ background: s.ibg }}>
                <s.Icon sx={{ color: s.color }} />
              </div>
              <div className="stat-content">
                <div className="stat-value" style={{ fontSize: 20 }}>
                  {formatCurrency(s.stat.revenue)}
                </div>
                <div className="stat-label">
                  {s.label} • {s.stat.bookingsCount} đơn
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bo loc bao cao chi tiet ── */}
      <div className="filter-bar">
        <TextField
          select
          size="small"
          label="Nhóm theo"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          sx={{ minWidth: 150 }}>
          {GROUP_BY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Từ ngày"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          size="small"
          label="Đến ngày"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          select
          size="small"
          label="Sân"
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
          sx={{ minWidth: 180 }}>
          <MenuItem value="all">Tất cả sân</MenuItem>
          {courts.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <div style={{ flex: 1 }} />
        {report && (
          <span style={{ fontSize: 13, color: "#718096" }}>
            Tổng:{" "}
            <strong style={{ color: "#1a472a" }}>
              {formatCurrency(report.totalRevenue)}
            </strong>{" "}
            • {report.totalBookings} đơn
          </span>
        )}
      </div>

      {/* ── Bang + bieu do doanh thu theo thoi gian ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          Doanh thu{" "}
          {GROUP_BY_OPTIONS.find(
            (o) => o.value === groupBy,
          )?.label.toLowerCase()}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {reportError && (
            <Alert severity="error" sx={{ m: 2 }}>
              {reportError}
            </Alert>
          )}
          {loadingReport ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
              }}>
              <CircularProgress size={28} />
            </div>
          ) : !report || report.data.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#718096",
              }}>
              Không có dữ liệu doanh thu trong khoảng thời gian này
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Mốc thời gian</th>
                    <th>Số đơn</th>
                    <th>Doanh thu</th>
                    <th style={{ minWidth: 180 }}>Biểu đồ</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((row) => {
                    const pct =
                      maxRevenueInReport > 0
                        ? (row.revenue / maxRevenueInReport) * 100
                        : 0;
                    return (
                      <tr key={row.period}>
                        <td style={{ fontWeight: 700 }}>
                          {formatPeriodLabel(row.period, groupBy)}
                        </td>
                        <td>{row.bookingsCount}</td>
                        <td style={{ fontWeight: 700, color: "#1a472a" }}>
                          {formatCurrency(row.revenue)}
                        </td>
                        <td>
                          <div
                            style={{
                              height: 10,
                              background: "#e5e7eb",
                              borderRadius: 5,
                              overflow: "hidden",
                            }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background:
                                  "linear-gradient(90deg,#1a472a,#52b788)",
                                borderRadius: 5,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Doanh thu theo tung san ── */}
      <div className="card">
        <div className="card-header">
          <StadiumIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          Doanh thu theo sân
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loadingByCourt ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
              }}>
              <CircularProgress size={28} />
            </div>
          ) : byCourt.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#718096",
              }}>
              Chưa có dữ liệu
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Sân</th>
                    <th>Số đơn</th>
                    <th>Doanh thu</th>
                    <th style={{ minWidth: 180 }}>Biểu đồ</th>
                  </tr>
                </thead>
                <tbody>
                  {byCourt.map((c) => {
                    const pct =
                      maxRevenueByCourt > 0
                        ? (c.revenue / maxRevenueByCourt) * 100
                        : 0;
                    return (
                      <tr key={c.courtId}>
                        <td style={{ fontWeight: 700 }}>{c.courtName}</td>
                        <td>{c.bookingsCount}</td>
                        <td style={{ fontWeight: 700, color: "#1a472a" }}>
                          {formatCurrency(c.revenue)}
                        </td>
                        <td>
                          <div
                            style={{
                              height: 10,
                              background: "#e5e7eb",
                              borderRadius: 5,
                              overflow: "hidden",
                            }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background:
                                  "linear-gradient(90deg,#b45309,#f59e0b)",
                                borderRadius: 5,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
