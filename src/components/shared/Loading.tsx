import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  size?: number;
}

const Loading = ({
  text = "Đang tải...",
  fullScreen = true,
  size = 48,
}: LoadingProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      sx={{
        minHeight: fullScreen ? "100vh" : "100%",
        width: "100%",
      }}>
      <CircularProgress size={size} />

      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
        }}>
        {text}
      </Typography>
    </Box>
  );
};

export default Loading;
