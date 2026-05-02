"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Typography } from "@mui/material";

export function PaginationControls({
  page,
  limit,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  totalLoaded,
}: {
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (p: number) => void;
  totalLoaded: number;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
      mt={3}
      pt={2}
      borderTop={1}
      borderColor="divider"
    >
      <Typography variant="body2" color="text.secondary">
        Page {page} · Showing {totalLoaded} (limit {limit})
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton aria-label="previous page" disabled={!hasPrevPage} onClick={() => onPageChange(page - 1)} size="medium">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton aria-label="next page" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)} size="medium">
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
