# Notification System Design

## Stage 1

### Problem

Students lose track of important items when notification volume is high. We need a **Priority Inbox** that always shows the top **N** most important **unread** notifications first, where **N** is configurable (e.g. 10, 15, 20).

### Priority model

- **Type weight** (strict ordering): **Placement** > **Result** > **Event**.
- **Recency**: Among notifications of the **same** type, **newer** timestamps rank higher.

Implementation compares notifications **lexicographically**: first by type weight (descending), then by `Timestamp` (descending). This matches “combination of weight and recency” without mixing units into an arbitrary linear formula.

### Unread handling

The evaluation API returns the current batch of notifications. With **no separate read/unread flag** in the payload, Stage 1 treats every item as **unread** unless its ID appears in an in-memory **read set** (empty by default). Later stages can persist read state and pass the same set into the selector.

### Algorithms

**One-shot “top N” from a batch** (used after each fetch):

1. Filter to unread IDs.
2. Sort by the comparator above — **O(U log U)** for U unread items.
3. Take the first **N** — **O(N)**.

**Streaming / incremental top-K** (for continuously arriving notifications):

- Maintain a **binary min-heap** of size at most **K** storing the current best candidates, ordered by a **scalar rank** derived from `(typeWeight, timestampMs)` so the heap root always holds the **lowest** priority among the K kept items.
- For each new notification: if the heap has fewer than K items, insert; else if the new item **beats** the root, **replace** the root and restore heap — **O(log K)** per arrival.
- After processing a stream, **sort** the K items with the same lexicographic comparator for display — **O(K log K)**.

The batch sort and the heap approach produce the **same** top-K set when the stream is finite and order-independent; the heap is appropriate when we **cannot** or **should not** store all notifications (live feed, memory cap).

### API integration

- **GET** `http://20.207.122.201/evaluation-service/notifications`
- **Protected route**: send header `Authorization: Bearer <token>` using environment variable **`NOTIFICATION_API_TOKEN`** (never committed).
- Optional **`PRIORITY_INBOX_N`**: defaults to `10`.

### Code layout

- **Logging**: `logging-middleware/` — file-based structured logs and operation wrappers (no `console` / built-in console logging in app code).
- **Stage 1 runner**: `notification_app_be/src/stage1-priority-inbox.ts` — fetches, normalizes, computes top N, writes `output/stage1-priority-notifications.txt` for review and screenshots.

### Screenshots

After a successful run, capture the generated report file and/or the structured log tail showing the priority list, and store under `screenshots/` in the repository as required by the evaluation.

### Note on filename casing

On **case-insensitive** file systems (default Windows), `notification_system_design.md` and `Notification_System_Design.md` resolve to the same path. This repository keeps **`Notification_System_Design.md`** as the canonical design document to satisfy the Stage 1 naming requirement.
