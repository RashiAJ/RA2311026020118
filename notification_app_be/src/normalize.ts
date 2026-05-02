import type { AppLogger } from "campus-logging-middleware";
import type { NormalizedNotification, NotificationTypeName, RawNotification } from "./notification-types";

const ALLOWED: readonly NotificationTypeName[] = ["Placement", "Result", "Event"];

export function normalizeNotifications(rawList: RawNotification[], logger: AppLogger): NormalizedNotification[] {
  const out: NormalizedNotification[] = [];
  for (const raw of rawList) {
    const type = raw.Type as NotificationTypeName;
    if (!ALLOWED.includes(type)) {
      logger.warn("Skipping notification with unknown Type", "normalize", {
        id: raw.ID,
        type: raw.Type,
      });
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
  logger.info(`Normalized ${out.length} notifications`, "normalize", {
    dropped: rawList.length - out.length,
  });
  return out;
}
