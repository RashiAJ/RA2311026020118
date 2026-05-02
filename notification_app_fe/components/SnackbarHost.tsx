"use client";

import { Alert, Snackbar } from "@mui/material";
import { useToastStore } from "@/store/useToastStore";

export function SnackbarHost() {
  const open = useToastStore((s) => s.open);
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  return (
    <Snackbar
      open={open}
      autoHideDuration={2800}
      onClose={hide}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      TransitionProps={{ timeout: { enter: 280, exit: 200 } }}
    >
      <Alert severity="success" onClose={hide} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
