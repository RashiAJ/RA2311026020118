"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import TuneIcon from "@mui/icons-material/Tune";
import { Alert, Box, Button, Container, Paper, Slider, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { NotificationList } from "@/components/NotificationList";
import { formatNotificationDate } from "@/lib/format";
import type { NotificationTypeFilter } from "@/lib/types";
import { usePriorityNotifications } from "@/hooks/usePriorityNotifications";
import { useAppStore } from "@/store/useAppStore";
import { useToastStore } from "@/store/useToastStore";

export default function PriorityPage() {
  const [topN, setTopN] = useState(10);
  const [filter, setFilter] = useState<NotificationTypeFilter>("All");

  const { data, loading, error, refetch } = usePriorityNotifications(topN, filter);

  const readIds = useAppStore((s) => s.readIds);
  const markRead = useAppStore((s) => s.markRead);
  const markUnread = useAppStore((s) => s.markUnread);
  const showToast = useToastStore((s) => s.show);

  const listItems = useMemo(
    () =>
      data.map((row) => {
        const read = !!readIds[row.id];
        return {
          id: row.id,
          type: row.type,
          message: row.message,
          timestampLabel: formatNotificationDate(row.timestampIso),
          isRead: read,
          onCardClick: () => {
            if (!read) {
              markRead(row.id);
              showToast("Marked as read");
            }
          },
          onMarkUnread: () => {
            markUnread(row.id);
            showToast("Marked as unread");
          },
        };
      }),
    [data, readIds, markRead, markUnread, showToast],
  );

  return (
    <Box component="main" sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Priority inbox
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={560}>
              Top <strong>n</strong> unread items using the same ordering as the backend: Placement → Result → Event, then
              newest first.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void refetch()} disabled={loading}>
            Refresh
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TuneIcon fontSize="small" color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              Top N (unread only)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {topN} notifications
          </Typography>
          <Slider
            value={topN}
            onChange={(_, v) => setTopN(v as number)}
            min={1}
            max={50}
            step={1}
            marks={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 30, label: "30" },
            ]}
            valueLabelDisplay="auto"
          />
        </Paper>

        <FilterBar value={filter} onChange={setFilter} />

        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        <NotificationList loading={loading} items={listItems} />

        {!loading && !error && listItems.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4 }}>
            No unread notifications match this filter — or everything in view is already read. Mark items unread from the
            list or change filters.
          </Typography>
        ) : null}
      </Container>
    </Box>
  );
}
