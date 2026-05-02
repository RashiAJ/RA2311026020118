# notification_app_be

## Stage 1 — Priority inbox

Fetches notifications from the evaluation API, ranks unread items by **Placement > Result > Event**, then **recency**, and writes the top **N** to disk.

### Prerequisites

- Node.js 20+
- Bearer token for the protected notifications route (provided by your evaluation / pre-test setup)

### Setup

```powershell
cd notification_app_be
npm install
```

Copy `.env.example` to `.env` and set `NOTIFICATION_API_TOKEN`, **or** export the variable for your shell session:

```powershell
$env:NOTIFICATION_API_TOKEN="<your-token>"
$env:PRIORITY_INBOX_N="15"   # optional; default 10
npm run stage1
```

### Outputs

- Structured logs: `logs/stage1-priority-inbox.log` (via **logging middleware** only — no `console` usage)
- Human-readable report for screenshots: `output/stage1-priority-notifications.txt`

### Git note

Do **not** commit secrets or generated logs containing live API payloads if policy forbids it; commit code, design docs, and screenshots as instructed.
