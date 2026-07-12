import { Box, Button, Typography } from "@mui/material";
import SportsTennisOutlinedIcon from "@mui/icons-material/SportsTennisOutlined";

interface EmptyPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState = ({
  title = "Chào mừng đến BadmintonHub!",
  description = "Chọn mục từ menu bên trái để bắt đầu.",
  buttonText,
  onButtonClick,
}: EmptyPageProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="70vh"
      textAlign="center"
      px={3}>
      <SportsTennisOutlinedIcon
        sx={{
          fontSize: 72,
          color: "primary.main",
          mb: 2,
        }}
      />

      <Typography variant="h5" fontWeight={700} gutterBottom>
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 500,
          mb: buttonText ? 3 : 0,
        }}>
        {description}
      </Typography>

      {buttonText && (
        <Button variant="contained" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
