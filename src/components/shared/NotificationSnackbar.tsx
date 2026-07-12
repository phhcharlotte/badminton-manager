import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface Props {
  open: boolean;
  msg: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const NotificationSnackbar: React.FC<Props> = ({
  open,
  msg,
  type,
  onClose,
}) => (
  <Snackbar
    open={open}
    autoHideDuration={4000}
    onClose={onClose}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}>
    <Alert
      severity={type}
      onClose={onClose}
      variant="filled"
      sx={{ fontWeight: 600, borderRadius: 2, minWidth: 300 }}>
      {msg}
    </Alert>
  </Snackbar>
);

export default NotificationSnackbar;
