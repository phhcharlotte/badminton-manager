// src/pages/booking-flow/CourtsCatalogView.tsx
import React, { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StadiumIcon from "@mui/icons-material/Stadium";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import { getCourtIcon } from "@/config/courtIcons";

import { useCourtStore } from "@/store/courtStore";
import { useBookingFlowStore } from "@/store/bookingFlowStore";
import { CourtType } from "@/types/Courts";
import { formatCurrency } from "@/utils/helpers";

const CourtsCatalogView: React.FC = () => {
  const { courts, isLoading, error } = useCourtStore();
  const selectCourt = useBookingFlowStore((s) => s.selectCourt);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CourtType>("all");

  // useEffect(() => {
  //   fetchCourts(typeFilter === "all" ? undefined : { type: typeFilter });
  // }, [typeFilter]);

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
          Chọn sân để xem lịch trống và đặt ngay
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
        <TextField
          select
          size="small"
          label="Loại sân"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | CourtType)}
          sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="fixed">
            <StarIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Cố định
          </MenuItem>
          <MenuItem value="casual">
            <BoltIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Vãng lai
          </MenuItem>
        </TextField>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#718096" }}>
          {isLoading ? "Đang tải..." : `${filtered.length} sân`}
        </span>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="court-grid">
            {filtered.map((court) => {
              const CourtIcon = getCourtIcon(court.image);
              return (
                <div
                  key={court._id}
                  className="court-card"
                  onClick={() => selectCourt(court)}
                  style={{ cursor: "pointer" }}>
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
                    <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                      <div
                        style={{
                          flex: 1,
                          background: "#fef3c7",
                          borderRadius: 8,
                          padding: "6px 10px",
                          textAlign: "center",
                        }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#b45309",
                            fontWeight: 700,
                          }}>
                          <StarIcon
                            sx={{ fontSize: 13, verticalAlign: "middle" }}
                          />{" "}
                          Cố định
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#b45309",
                          }}>
                          {formatCurrency(court.pricePerHourFixed)}
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          background: "#dbeafe",
                          borderRadius: 8,
                          padding: "6px 10px",
                          textAlign: "center",
                        }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#1e40af",
                            fontWeight: 700,
                          }}>
                          <BoltIcon
                            sx={{ fontSize: 13, verticalAlign: "middle" }}
                          />{" "}
                          Vãng lai
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#1e40af",
                          }}>
                          {formatCurrency(court.pricePerHourCasual)}
                        </div>
                      </div>
                    </div>
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
                      }}>
                      Xem lịch & đặt sân
                    </button>
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourtsCatalogView;
