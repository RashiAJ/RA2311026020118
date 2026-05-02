Notification System Design

**Stage 1**

**Problem**

Students lose track of important items when notification volume is high. We need a **Priority Inbox** that always shows the top **N** most important **unread** notifications first, where **N** is configurable (e.g. 10, 15, 20).

**Priority model**

- **Type weight** (strict ordering): **Placement** > **Result** > **Event**.
- **Recency**: Among notifications of the **same** type, **newer** timestamps rank higher.

Implementation compares notifications **lexicographically**: first by type weight (descending), then by `Timestamp` (descending). This matches “combination of weight and recency” without mixing units into an arbitrary linear formula.

**Unread handling**

The API payload has no read/unread flag; Stage 1 treats all normalized notifications as eligible for ranking.

**Algorithms**

After fetch: normalize types/timestamps, sort by type weight then recency (**O(U log U)**), take first **N** (**O(N)**). For a live stream without storing the full list, a min-heap of size **N** could update in **O(log N)** per item; the shipped Stage 1 code uses the batch path only.

**API integration**

- **POST** `http://20.207.122.201/evaluation-service/register` — obtain **client id / secret** (saved via `npm run register` → `output/register-response.json`).
- **POST** `http://20.207.122.201/evaluation-service/auth` — request body includes **email**, **name**, **rollNo**, **accessCode**, **clientID**, **clientSecret**; response includes **`access_token`**. Run **`npm run auth`** (same POST-only pattern as register) → **`output/auth-response.json`**.
- **GET** `http://20.207.122.201/evaluation-service/notifications` — **protected**; **`Authorization: Bearer <access_token>`**. Stage 1 reads the token from **`output/auth-response.json`** or from **`NOTIFICATION_API_TOKEN`** / **`EVALUATION_ACCESS_TOKEN`** — it does not POST to `/auth` at runtime.
- Optional **`PRIORITY_INBOX_N`**: defaults to `10`.

**Code layout**

- **Logging**: `logging-middleware/` — file-based structured logs and operation wrappers (no `console` / built-in console logging in app code).
- **Stage 1**: `notification_app_be/src/stage1-priority-inbox.ts` plus `priority.ts` (normalize + sort), `fetch-notifications.ts`, `evaluation-auth.ts`.

**Screenshots**

After a successful run, capture the generated report file and/or the structured log tail showing the priority list, and store under `screenshots/` in the repository as required by the evaluation.

**Note on filename casing**

On **case-insensitive** file systems (default Windows), `notification_system_design.md` and `Notification_System_Design.md` resolve to the same path. This repository keeps **`Notification_System_Design.md`** as the canonical design document to satisfy the Stage 1 naming requirement.
