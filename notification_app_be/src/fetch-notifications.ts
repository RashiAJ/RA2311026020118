import type { AppLogger } from "campus-logging-middleware";
import { withAsyncLogging } from "campus-logging-middleware";
import { resolveAuthorizationForNotifications } from "./evaluation-auth.js";
import type { RawNotification } from "./priority.js";

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

async function fetchNotificationsRaw(logger: AppLogger): Promise<RawNotification[]> {
  const { headers, mode } = await resolveAuthorizationForNotifications(logger);

  logger.info("GET notifications", "fetch-notifications", { url: API_URL, mode });

  const res = await fetch(API_URL, { headers });

  if (!res.ok) {
    const text = await res.text();
    logger.error("Notifications API error", "fetch-notifications", {
      status: res.status,
      preview: text.slice(0, 400),
    });
    if (res.status === 401 && mode === "none") {
      logger.warn("Set NOTIFICATION_API_TOKEN or run npm run auth", "fetch-notifications");
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const body = (await res.json()) as { notifications?: RawNotification[] };
  const list = body.notifications;
  if (!Array.isArray(list)) {
    throw new Error("Invalid notifications payload");
  }

  logger.info("Fetched notifications", "fetch-notifications", { count: list.length });
  return list;
}

export function createFetchNotifications(logger: AppLogger): () => Promise<RawNotification[]> {
  return withAsyncLogging(logger, "fetchNotifications", async () => fetchNotificationsRaw(logger));
}
