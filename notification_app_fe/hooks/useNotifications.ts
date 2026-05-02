"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllNotifications } from "@/lib/api";
import type { RawNotification } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

export type UseNotificationsParams = {
  page: number;
  limit: number;
  notificationType: "Event" | "Result" | "Placement" | null;
};

export function useNotifications(params: UseNotificationsParams) {
  const token = useAppStore((s) => s.token);
  const [allRows, setAllRows] = useState<RawNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Add your Bearer token in the header bar.");
      setAllRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAllNotifications(token);
      setAllRows(rows);
    } catch (e) {
      setAllRows([]);
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!params.notificationType) return allRows;
    return allRows.filter((r) => r.Type === params.notificationType);
  }, [allRows, params.notificationType]);

  const data = useMemo(() => {
    const start = (params.page - 1) * params.limit;
    return filtered.slice(start, start + params.limit);
  }, [filtered, params.page, params.limit]);

  const hasNextPage = params.page * params.limit < filtered.length;
  const hasPrevPage = params.page > 1;

  return { data, loading, error, refetch: load, hasNextPage, hasPrevPage };
}
