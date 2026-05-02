import axios, { type AxiosError } from "axios";
import type { NotificationsApiResponse, RawNotification } from "./types";

const BASE = "/evaluation-service/notifications";

function parseResponse(data: unknown): RawNotification[] {
  if (data && typeof data === "object" && "notifications" in data) {
    const n = (data as NotificationsApiResponse).notifications;
    if (Array.isArray(n)) return n;
  }
  if (Array.isArray(data)) return data as RawNotification[];
  throw new Error("Unexpected notifications response shape");
}

function formatAxiosError(err: unknown): Error {
  const ax = err as AxiosError<unknown>;
  const status = ax.response?.status;
  const d = ax.response?.data;
  let detail = ax.message;
  if (typeof d === "string" && d.trim()) detail = d.slice(0, 240);
  else if (d && typeof d === "object" && "message" in d && typeof (d as { message: unknown }).message === "string") {
    detail = (d as { message: string }).message;
  }
  if (status) return new Error(`Request failed (${status})${detail ? `: ${detail}` : ""}`);
  return new Error(detail || "Request failed");
}

/**
 * Evaluation GET returns the full list with Bearer auth only.
 * Query params (page, limit, notification_type) are not sent — the remote API returns 400 with them.
 */
export async function fetchAllNotifications(accessToken: string): Promise<RawNotification[]> {
  try {
    const { data } = await axios.get<unknown>(BASE, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    return parseResponse(data);
  } catch (err) {
    throw formatAxiosError(err);
  }
}
