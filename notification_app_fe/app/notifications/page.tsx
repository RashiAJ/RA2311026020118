"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { NotificationList } from "@/components/NotificationList";
import { PaginationControls } from "@/components/PaginationControls";
import { formatNotificationDate } from "@/lib/format";
import type { NotificationTypeFilter } from "@/lib/types";
import { useNotifications } from "@/hooks/useNotifications";
import { useAppStore } from "@/store/useAppStore";
import { useToastStore } from "@/store/useToastStore";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationTypeFilter>("All");
  const typeForApi = filter === "All" ? null : filter;

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const { data, loading, error, refetch, hasNextPage, hasPrevPage } = useNotifications({
    page,
    limit: PAGE_SIZE,
    notificationType: typeForApi,
  });

  const readIds = useAppStore((s) => s.readIds);
  const markRead = useAppStore((s) => s.markRead);
  const markUnread = useAppStore((s) => s.markUnread);
  const showToast = useToastStore((s) => s.show);

  const listItems = useMemo(
    () =>
      data.map((row) => {
        const read = !!readIds[row.ID];
        return {
          id: row.ID,
          type: row.Type,
          message: row.Message,
          timestampLabel: formatNotificationDate(row.Timestamp),
          isRead: read,
          onCardClick: () => {
            if (!read) {
              markRead(row.ID);
              showToast("Marked as read");
            }
          },
          onMarkUnread: () => {
            markUnread(row.ID);
            showToast("Marked as unread");
          },
        };
      }),
    [data, readIds, markRead, markUnread, showToast],
  );

  return (
    <Box component="main" sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap" mb={1}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={560}>
              Paginated feed with filters. Click a card to mark it as read. State is stored in your browser.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void refetch()} disabled={loading}>
            Retry / Refresh
          </Button>
        </Box>

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
            No notifications for this filter. Try another type or refresh.
          </Typography>
        ) : null}

        {!loading && !error && listItems.length > 0 ? (
          <PaginationControls
            page={page}
            limit={PAGE_SIZE}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={setPage}
            totalLoaded={listItems.length}
          />
        ) : null}
      </Container>
    </Box>
  );
}
