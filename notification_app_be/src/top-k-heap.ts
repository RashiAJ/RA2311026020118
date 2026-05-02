import type { NormalizedNotification } from "./notification-types";
import { priorityRank } from "./priority-rank";

/**
 * Min-heap (root = lowest rank among stored items) for maintaining top-K by priorityRank.
 * Insertion per item: O(log K). Memory: O(K).
 */
export class TopKPriorityHeap {
  private readonly heap: NormalizedNotification[] = [];

  constructor(private readonly k: number) {
    if (k < 1) throw new Error("k must be >= 1");
  }

  private siftUp(i: number): void {
    const h = this.heap;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (priorityRank(h[i]) >= priorityRank(h[p])) break;
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
    }
  }

  private siftDown(i: number): void {
    const h = this.heap;
    const n = h.length;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && priorityRank(h[l]) < priorityRank(h[smallest])) smallest = l;
      if (r < n && priorityRank(h[r]) < priorityRank(h[smallest])) smallest = r;
      if (smallest === i) break;
      [h[i], h[smallest]] = [h[smallest], h[i]];
      i = smallest;
    }
  }

  /** Consider one notification (streaming). Keeps at most K highest-priority items. */
  consider(item: NormalizedNotification): void {
    const rank = priorityRank(item);
    if (this.heap.length < this.k) {
      this.heap.push(item);
      this.siftUp(this.heap.length - 1);
      return;
    }
    const root = this.heap[0];
    if (!root || rank <= priorityRank(root)) return;
    this.heap[0] = item;
    this.siftDown(0);
  }

  /** Unsorted contents of the heap (K items). */
  snapshot(): NormalizedNotification[] {
    return [...this.heap];
  }
}
