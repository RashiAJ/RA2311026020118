import type { AppLogger } from "campus-logging-middleware";
import { withAsyncLogging } from "campus-logging-middleware";
import type { RawNotification } from "./notification-types";

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

export interface NotificationsApiBody {
  notifications: RawNotification[];
}

async function fetchNotificationsRaw(logger: Logger): Promise<RawNotification[]> {
  const token = process.env.NOTIFICATION_API_TOKEN?.trim();
  if (!token) {
    logger.error(
      "Missing NOTIFICATION_API_TOKEN environment variable (Bearer token for protected route)",
      "fetch-notifications",
    );
    throw new Error("NOTIFICATION_API_TOKEN is required");
  }

  logger.info("Requesting notifications from evaluation API", "fetch-notifications", { url: API_URL });

  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error("Notifications API non-OK response", "fetch-notifications", {
      status: res.status,
      bodyPreview: text.slice(0, 500),
    });
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const body = (await res.json()) as NotificationsApiBody;
  const list = body.notifications;
  if (!Array.isArray(list)) {
    logger.error("Invalid API shape: notifications is not an array", "fetch-notifications");
    throw new Error("Invalid notifications payload");
  }

  logger.info("Fetched notification batch", "fetch-notifications", { count: list.length });
  return list;
}

export function createFetchNotifications(logger: AppLogger): () => Promise<RawNotification[]> {
  return withAsyncLogging(logger, "fetchNotifications", async () => fetchNotificationsRaw(logger));
}
