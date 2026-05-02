"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllNotifications } from "@/lib/api";
import { normalizeNotifications, topUnreadPriority } from "@/lib/priority";
import type { NotificationTypeName, RawNotification } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

export function usePriorityNotifications(topN: number, typeFilter: "All" | NotificationTypeName) {
  const token = useAppStore((s) => s.token);
  const readIds = useAppStore((s) => s.readIds);
  const [rawList, setRawList] = useState<RawNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Add your Bearer token in the header bar.");
      setRawList([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAllNotifications(token);
      setRawList(raw);
    } catch (e) {
      setRawList([]);
      setError(e instanceof Error ? e.message : "Failed to load priority inbox");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRaw = useMemo(() => {
    if (typeFilter === "All") return rawList;
    return rawList.filter((r) => r.Type === typeFilter);
  }, [rawList, typeFilter]);

  const data = useMemo(() => {
    const normalized = normalizeNotifications(filteredRaw);
    return topUnreadPriority(normalized, readIds, topN);
  }, [filteredRaw, readIds, topN]);

  return { data, loading, error, refetch: load };
}
