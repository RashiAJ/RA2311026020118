"use client";

import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Fade,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { NotificationTypeName } from "@/lib/types";
import { chipColor } from "@/lib/priority";

export type NotificationCardProps = {
  id: string;
  type: NotificationTypeName | string;
  message: string;
  timestampLabel: string;
  isRead: boolean;
  onCardClick: () => void;
  onMarkUnread: () => void;
  index?: number;
};

export function NotificationCard({
  type,
  message,
  timestampLabel,
  isRead,
  onCardClick,
  onMarkUnread,
  index = 0,
}: NotificationCardProps) {
  const t = type as NotificationTypeName;
  const validType = t === "Placement" || t === "Result" || t === "Event" ? t : "Event";

  return (
    <Fade in timeout={280 + Math.min(index * 40, 200)}>
      <Card
        elevation={isRead ? 0 : 2}
        sx={{
          mb: 2,
          border: 1,
          borderColor: isRead ? "divider" : "primary.light",
          bgcolor: isRead ? "action.hover" : "background.paper",
          opacity: isRead ? 0.72 : 1,
          transition: "opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardActionArea onClick={onCardClick} sx={{ alignItems: "stretch" }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                  <Chip label={validType} size="small" color={chipColor(validType)} variant={isRead ? "outlined" : "filled"} />
                </Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={isRead ? 400 : 700}
                  color="text.primary"
                  sx={{ wordBreak: "break-word" }}
                >
                  {message}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  {timestampLabel}
                </Typography>
              </Box>
              <Tooltip title={isRead ? "Mark unread" : "Mark read on card click"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isRead) onMarkUnread();
                    }}
                    disabled={!isRead}
                    aria-label="mark unread"
                  >
                    {isRead ? <MarkEmailUnreadIcon fontSize="small" /> : <MarkEmailReadIcon fontSize="small" color="disabled" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Fade>
  );
}
