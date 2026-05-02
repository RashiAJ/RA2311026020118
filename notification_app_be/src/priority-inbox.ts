import type { AppLogger } from "campus-logging-middleware";
import type { NormalizedNotification } from "./notification-types";
import { comparePriority } from "./priority-rank";
import { TopKPriorityHeap } from "./top-k-heap";

/** Sort-descending by priority (Placement > Result > Event, then recency). */
export function sortByPriority(items: NormalizedNotification[]): NormalizedNotification[] {
  return [...items].sort(comparePriority);
}

/** Unread = not in readIds. Returns top N by priority (batch / full sort path). O(U log U). */
export function selectTopUnread(
  notifications: NormalizedNotification[],
  readIds: ReadonlySet<string>,
  n: number,
): NormalizedNotification[] {
  const unread = notifications.filter((x) => !readIds.has(x.id));
  const sorted = sortByPriority(unread);
  return sorted.slice(0, n);
}

/**
 * Streaming maintenance of top-K: O(log K) per arriving notification.
 * Simulates "new notifications keep coming" without storing full history in memory beyond K.
 */
export function maintainTopKStream(
  stream: Iterable<NormalizedNotification>,
  readIds: ReadonlySet<string>,
  k: number,
  logger: AppLogger,
): NormalizedNotification[] {
  const heap = new TopKPriorityHeap(k);
  let seen = 0;
  for (const item of stream) {
    seen++;
    if (readIds.has(item.id)) continue;
    heap.consider(item);
  }
  logger.info("Streaming top-K heap updated", "maintainTopKStream", { itemsSeen: seen, k });
  return sortByPriority(heap.snapshot());
}
