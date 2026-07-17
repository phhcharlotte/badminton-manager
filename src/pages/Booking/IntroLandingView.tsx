// src/pages/booking-flow/IntroLandingView.tsx
import React, { useEffect } from "react";
import { Button, CircularProgress, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { useBookingFlowStore } from "@/store/bookingFlowStore";
import { BUSINESS_INFO } from "@/config/businessInfo";
import { formatCurrency } from "@/utils/helpers";
import { useCourtCategoryStore } from "@/store/courtCategoryStore";

const IntroLandingView: React.FC = () => {
  const { categories, isLoading, fetchCategories } = useCourtCategoryStore();
  const goToCatalog = useBookingFlowStore((s) => s.goToCatalog);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="fade-in-up">
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
          borderRadius: 20,
          padding: "48px 32px",
          textAlign: "center",
          color: "white",
          marginBottom: 28,
        }}>
        <SportsTennisIcon sx={{ fontSize: 48, mb: 1 }} />
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0" }}>
          {BUSINESS_INFO.name}
        </h1>
        <p
          style={{
            fontSize: 16,
            opacity: 0.9,
            maxWidth: 560,
            margin: "0 auto 24px",
          }}>
          {BUSINESS_INFO.slogan}
        </p>
        <Button
          variant="contained"
          size="large"
          startIcon={<EventAvailableIcon />}
          onClick={goToCatalog}
          sx={{
            background: "white",
            color: "#1a472a",
            fontWeight: 800,
            fontSize: 16,
            px: 5,
            py: 1.5,
            borderRadius: 3,
            "&:hover": { background: "#e8f5e9" },
          }}>
          Tiến hành đặt sân
        </Button>
      </div>

      {/* Thong tin co so */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">Thông tin cơ sở</div>
        <div className="card-body">
          <p style={{ fontSize: 14, color: "#4a5568", marginBottom: 16 }}>
            {BUSINESS_INFO.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}>
            {[
              {
                Icon: LocationOnIcon,
                label: "Địa chỉ",
                value: BUSINESS_INFO.address,
              },
              { Icon: PhoneIcon, label: "Hotline", value: BUSINESS_INFO.phone },
              { Icon: EmailIcon, label: "Email", value: BUSINESS_INFO.email },
              {
                Icon: AccessTimeIcon,
                label: "Giờ mở cửa",
                value: BUSINESS_INFO.openHours,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <item.Icon sx={{ color: "#1a472a", fontSize: 22, mt: 0.3 }} />
                <div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                    {item.label}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2f" }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bang gia */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">Bảng giá sân</div>
        <div className="card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
              }}>
              <CircularProgress size={28} />
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Sân</th>
                    <th>Loại sân</th>
                    <th>Bảng giá theo giờ</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((court) => {
                    return (
                      <tr key={court._id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {court.name}
                              </div>
                              <div style={{ fontSize: 12, color: "#718096" }}>
                                {court.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Chip
                            label={court?.name}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}>
                            {court?.priceRules.map((r, i) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}>
                                <span
                                  style={{ color: "#94a3b8", minWidth: 90 }}>
                                  <AccessTimeIcon
                                    sx={{
                                      fontSize: 12,
                                      verticalAlign: "middle",
                                    }}
                                  />{" "}
                                  {r.startTime}–{r.endTime}
                                </span>
                                <span
                                  style={{ color: "#b45309", fontWeight: 700 }}>
                                  <StarIcon
                                    sx={{
                                      fontSize: 12,
                                      verticalAlign: "middle",
                                    }}
                                  />{" "}
                                  {formatCurrency(r.pricePerHourFixed)}
                                </span>
                                <span
                                  style={{ color: "#1e40af", fontWeight: 700 }}>
                                  <BoltIcon
                                    sx={{
                                      fontSize: 12,
                                      verticalAlign: "middle",
                                    }}
                                  />{" "}
                                  {formatCurrency(r.pricePerHourCasual)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "#718096",
                        }}>
                        Hiện chưa có sân nào đang hoạt động
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<EventAvailableIcon />}
          onClick={goToCatalog}
          sx={{
            background: "linear-gradient(135deg,#1a472a,#2d6a4f)",
            fontWeight: 800,
            fontSize: 16,
            px: 5,
            py: 1.5,
            borderRadius: 3,
            "&:hover": { background: "#0d2614" },
          }}>
          Tiến hành đặt sân
        </Button>
      </div>
    </div>
  );
};

export default IntroLandingView;
