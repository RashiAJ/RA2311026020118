import type { AppLogger } from "campus-logging-middleware";

export type NotificationTypeName = "Placement" | "Result" | "Event";

export interface RawNotification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export interface NormalizedNotification {
  id: string;
  type: NotificationTypeName;
  message: string;
  timestampMs: number;
  timestampIso: string;
}

const ALLOWED: readonly NotificationTypeName[] = ["Placement", "Result", "Event"];
const WEIGHT: Record<NotificationTypeName, number> = { Placement: 3, Result: 2, Event: 1 };

export function normalize(rawList: RawNotification[], logger: AppLogger): NormalizedNotification[] {
  const out: NormalizedNotification[] = [];
  for (const raw of rawList) {
    const type = raw.Type as NotificationTypeName;
    if (!ALLOWED.includes(type)) {
      logger.warn("Skipping notification with unknown Type", "normalize", { id: raw.ID, type: raw.Type });
      continue;
    }
    const ts = Date.parse(raw.Timestamp);
    if (Number.isNaN(ts)) {
      logger.warn("Skipping notification with invalid Timestamp", "normalize", { id: raw.ID });
      continue;
    }
    out.push({
      id: raw.ID,
      type,
      message: raw.Message,
      timestampMs: ts,
      timestampIso: new Date(ts).toISOString(),
    });
  }
  logger.info(`Normalized ${out.length} notifications`, "normalize", { dropped: rawList.length - out.length });
  return out;
}

function comparePriority(a: NormalizedNotification, b: NormalizedNotification): number {
  const dw = WEIGHT[b.type] - WEIGHT[a.type];
  if (dw !== 0) return dw;
  return b.timestampMs - a.timestampMs;
}

export function topPriority(notifications: NormalizedNotification[], n: number): NormalizedNotification[] {
  return [...notifications].sort(comparePriority).slice(0, n);
}
