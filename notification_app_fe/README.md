# notification_app_fe

Next.js 15 (App Router) + MUI + Axios + Zustand. Runs on **http://localhost:3000** (`npm run dev`). Does not change `notification_app_be`.

## Run

```powershell
cd notification_app_fe
npm install
npm run dev
```

Open **http://localhost:3000** (redirects to `/priority`, top **10** unread by default). Paste the same **Bearer** `access_token` you use for the evaluation API (e.g. from `notification_app_be/output/auth-response.json` after `npm run auth`).

## API proxy

`next.config.ts` rewrites `/evaluation-service/*` → `http://20.207.122.201/evaluation-service/*` so the browser avoids CORS. The client calls paths like `/evaluation-service/notifications`.

## Build

```powershell
npm run build
npm start
```

`npm start` also listens on port **3000**.

## Features

- `/notifications` — paginated list, type filter, read/unread (persisted in `localStorage` via Zustand `persist`).
- `/priority` — slider for top **n** unread-by-priority items, type filter, bulk fetch + client ranking.
