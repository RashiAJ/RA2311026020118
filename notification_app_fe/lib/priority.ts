import type { NormalizedNotification, NotificationTypeName, RawNotification } from "./types";

const ALLOWED: readonly NotificationTypeName[] = ["Placement", "Result", "Event"];
const WEIGHT: Record<NotificationTypeName, number> = { Placement: 3, Result: 2, Event: 1 };

export function normalizeNotifications(rawList: RawNotification[]): NormalizedNotification[] {
  const out: NormalizedNotification[] = [];
  for (const raw of rawList) {
    const type = raw.Type as NotificationTypeName;
    if (!ALLOWED.includes(type)) continue;
    const ts = Date.parse(raw.Timestamp);
    if (Number.isNaN(ts)) continue;
    out.push({
      id: raw.ID,
      type,
      message: raw.Message,
      timestampMs: ts,
      timestampIso: new Date(ts).toISOString(),
    });
  }
  return out;
}

function comparePriority(a: NormalizedNotification, b: NormalizedNotification): number {
  const dw = WEIGHT[b.type] - WEIGHT[a.type];
  if (dw !== 0) return dw;
  return b.timestampMs - a.timestampMs;
}

export function sortByPriority(items: NormalizedNotification[]): NormalizedNotification[] {
  return [...items].sort(comparePriority);
}

export function topUnreadPriority(
  items: NormalizedNotification[],
  readIds: Record<string, boolean>,
  n: number,
): NormalizedNotification[] {
  const unread = items.filter((x) => !readIds[x.id]);
  return sortByPriority(unread).slice(0, n);
}

export function chipColor(type: NotificationTypeName): "success" | "warning" | "info" {
  if (type === "Placement") return "success";
  if (type === "Result") return "warning";
  return "info";
}
