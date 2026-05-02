import type { NormalizedNotification, NotificationTypeName } from "./notification-types";

/** Placement > Result > Event */
const TYPE_WEIGHT: Record<NotificationTypeName, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function typeWeight(t: NotificationTypeName): number {
  return TYPE_WEIGHT[t];
}

/**
 * Lexicographic: higher type weight first, then newer timestamp.
 * Returns negative if a should sort before b (a is higher priority).
 */
export function comparePriority(a: NormalizedNotification, b: NormalizedNotification): number {
  const dw = typeWeight(b.type) - typeWeight(a.type);
  if (dw !== 0) return dw;
  return b.timestampMs - a.timestampMs;
}

/**
 * Scalar rank for heap ordering (larger = more important).
 * Safe given ms timestamps ~ 1e12 and weight gap 1e15.
 */
export function priorityRank(n: NormalizedNotification): number {
  return typeWeight(n.type) * 1_000_000_000_000_000 + n.timestampMs;
}
