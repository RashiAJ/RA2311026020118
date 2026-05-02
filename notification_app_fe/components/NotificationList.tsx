"use client";

import { Box, Skeleton, Stack } from "@mui/material";
import { NotificationCard } from "./NotificationCard";
import type { NotificationCardProps } from "./NotificationCard";

type Item = Omit<NotificationCardProps, "onCardClick" | "onMarkUnread" | "index"> & {
  onCardClick: () => void;
  onMarkUnread: () => void;
};

export function NotificationList({ loading, items }: { loading: boolean; items: Item[] }) {
  if (loading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={108} sx={{ borderRadius: 2 }} animation="wave" />
        ))}
      </Stack>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Box>
      {items.map((item, index) => (
        <NotificationCard key={item.id} {...item} index={index} />
      ))}
    </Box>
  );
}
