"use client";

import FilterListIcon from "@mui/icons-material/FilterList";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { NotificationTypeFilter } from "@/lib/types";

const OPTIONS: NotificationTypeFilter[] = ["All", "Placement", "Result", "Event"];

export function FilterBar({
  value,
  onChange,
}: {
  value: NotificationTypeFilter;
  onChange: (v: NotificationTypeFilter) => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "center" }}
      gap={2}
      mb={3}
    >
      <Box display="flex" alignItems="center" gap={1} color="text.secondary">
        <FilterListIcon fontSize="small" />
        <Typography variant="body2" fontWeight={600}>
          Filter
        </Typography>
      </Box>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, v) => v && onChange(v)}
        size="small"
        sx={{
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            textTransform: "none",
            px: 1.5,
          },
        }}
      >
        {OPTIONS.map((opt) => (
          <ToggleButton key={opt} value={opt}>
            {opt}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
