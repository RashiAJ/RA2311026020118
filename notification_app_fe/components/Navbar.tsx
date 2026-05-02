"use client";

import CampaignIcon from "@mui/icons-material/Campaign";
import KeyIcon from "@mui/icons-material/Key";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const linkSx = (active: boolean) => ({
  fontWeight: active ? 700 : 500,
  borderBottom: active ? 2 : 0,
  borderColor: "primary.main",
  borderRadius: 0,
  px: 1,
  py: 0.5,
});

export function Navbar() {
  const pathname = usePathname();
  const token = useAppStore((s) => s.token);
  const setToken = useAppStore((s) => s.setToken);
  const [draft, setDraft] = useState(token);

  useEffect(() => {
    setDraft(token);
  }, [token]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (t) => t.zIndex.drawer + 1,
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar sx={{ flexWrap: "wrap", gap: 2, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mr={2}>
          <CampaignIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight={800} letterSpacing={-0.5}>
            Campus
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexGrow={1}>
          <Button
            component={Link}
            href="/priority"
            color="inherit"
            startIcon={<StarIcon />}
            sx={linkSx(pathname === "/priority")}
          >
            Priority
          </Button>
          <Button
            component={Link}
            href="/notifications"
            color="inherit"
            startIcon={<NotificationsIcon />}
            sx={linkSx(pathname === "/notifications")}
          >
            All notifications
          </Button>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          flexBasis={{ xs: "100%", md: "auto" }}
          flexGrow={{ xs: 1, md: 0 }}
          minWidth={{ xs: 0, md: 280 }}
        >
          <TextField
            size="small"
            placeholder="Bearer access_token"
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setToken(draft)} edge="end" aria-label="save token">
                    Save
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
