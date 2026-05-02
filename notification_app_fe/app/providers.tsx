"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { SnackbarHost } from "@/components/SnackbarHost";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0d47a1" },
    secondary: { main: "#00695c" },
    background: {
      default: "#f0f4f8",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    h4: { fontWeight: 800, letterSpacing: -0.5 },
    h5: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 10 },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <SnackbarHost />
    </ThemeProvider>
  );
}
