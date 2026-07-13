// src/config/courtIcons.tsx
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import StadiumIcon from "@mui/icons-material/Stadium";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import GradeIcon from "@mui/icons-material/Grade";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";

export const COURT_ICON_OPTIONS = [
  { key: "sports_tennis", label: "Vợt cầu lông", Icon: SportsTennisIcon },
  { key: "stadium", label: "Sân vận động", Icon: StadiumIcon },
  { key: "emoji_events", label: "Cúp vô địch", Icon: EmojiEventsIcon },
  { key: "military_tech", label: "Huy chương", Icon: MilitaryTechIcon },
  {
    key: "workspace_premium",
    label: "Hạng Premium",
    Icon: WorkspacePremiumIcon,
  },
  { key: "grade", label: "Ngôi sao", Icon: GradeIcon },
  { key: "sports_score", label: "Bảng điểm", Icon: SportsScoreIcon },
  {
    key: "sports_volleyball",
    label: "Bóng chuyền",
    Icon: SportsVolleyballIcon,
  },
] as const;

export type CourtIconKey = (typeof COURT_ICON_OPTIONS)[number]["key"];

export const DEFAULT_COURT_ICON_KEY: CourtIconKey = "sports_tennis";

/** Lay component icon tuong ung voi key luu trong DB (field `image` cua Court) */
export const getCourtIcon = (key: string) => {
  return (
    COURT_ICON_OPTIONS.find((o) => o.key === key)?.Icon ?? SportsTennisIcon
  );
};
