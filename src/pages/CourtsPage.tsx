// src/pages/CourtsPage.tsx
import React, { useEffect, useState } from "react";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import StadiumIcon from "@mui/icons-material/Stadium";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useCourtStore } from "@/store/courtStore";
import { Court } from "@/types/Courts";
import { formatCurrency } from "@/utils/helpers";
import { getCourtIcon } from "@/config/courtIcons";

interface Props {
  onSelectCourt?: (court: Court) => void;
  showBookingButton?: boolean;
}

const CourtsPage: React.FC<Props> = ({
  onSelectCourt,
  showBookingButton = false,
}) => {
  const { courts, isLoading, error, fetchCourts } = useCourtStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourts();
  }, []); // eslint-disable-line

  const filtered = courts.filter((c) => {
    const keyword = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(keyword) ||
      c.description.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div className="page-title">
          <StadiumIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Danh sách sân cầu lông
        </div>
        <div className="page-subtitle">
          Xem tất cả sân hiện có và đặt lịch phù hợp
        </div>
      </div>

      <div className="filter-bar">
        <TextField
          size="small"
          placeholder="Tìm kiếm sân..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 220 }}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#718096" }}>
          {isLoading ? "Đang tải..." : `${filtered.length} sân khả dụng`}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
        <div
          style={{
            background: "linear-gradient(135deg,#fef3c7,#fde68a)",
            borderRadius: 12,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: 1,
            border: "1px solid #f59e0b",
          }}>
          <StarIcon sx={{ fontSize: 28, color: "#b45309" }} />
          <div>
            <div style={{ fontWeight: 800, color: "#92400e" }}>Giá cố định</div>
            <div style={{ fontSize: 13, color: "#b45309" }}>
              Áp dụng khi bạn chọn đặt kiểu "cố định" cho lượt đặt
            </div>
          </div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
            borderRadius: 12,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: 1,
            border: "1px solid #3b82f6",
          }}>
          <BoltIcon sx={{ fontSize: 28, color: "#1e40af" }} />
          <div>
            <div style={{ fontWeight: 800, color: "#1e40af" }}>
              Giá vãng lai
            </div>
            <div style={{ fontSize: 13, color: "#2563eb" }}>
              Áp dụng khi bạn chọn đặt kiểu "vãng lai" cho lượt đặt
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <CircularProgress />
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="court-grid">
            {filtered.map((court) => {
              const CourtIcon = getCourtIcon(court.image);
              return (
                <div
                  key={court._id}
                  className="court-card"
                  onClick={() => onSelectCourt && onSelectCourt(court)}
                  style={{ cursor: onSelectCourt ? "pointer" : "default" }}>
                  <div
                    className="court-card-image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <CourtIcon sx={{ fontSize: 56, color: "#1a472a" }} />
                  </div>
                  <div className="court-card-body">
                    <div className="court-name">{court.name}</div>
                    <div className="court-desc">{court.description}</div>

                    <Chip
                      label={court.category?.name || "Chưa gán loại sân"}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}>
                      {court.category?.priceRules.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#718096",
                          }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} /> {r.startTime}
                          –{r.endTime}
                          <StarIcon
                            sx={{ fontSize: 12, color: "#b45309" }}
                          />{" "}
                          {formatCurrency(r.pricePerHourFixed)}
                          <BoltIcon
                            sx={{ fontSize: 12, color: "#1e40af" }}
                          />{" "}
                          {formatCurrency(r.pricePerHourCasual)}
                        </div>
                      ))}
                    </div>

                    {showBookingButton && (
                      <button
                        style={{
                          marginTop: 14,
                          width: "100%",
                          padding: "11px",
                          background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}>
                        <EventNoteIcon fontSize="small" /> Đặt ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
              }}>
              <SearchOffIcon sx={{ fontSize: 48, mb: 2, color: "#cbd5e1" }} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                Không tìm thấy sân nào
              </div>
              <div style={{ fontSize: 14 }}>Thử thay đổi từ khoá tìm kiếm</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourtsPage;
