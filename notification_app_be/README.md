notification_app_be

**Stage 1 — Priority inbox**

Fetches notifications from the evaluation API, ranks unread items by **Placement > Result > Event**, then **recency**, and writes the top **N** to disk.

**Prerequisites**

- Node.js 20+
- **Registration** on the evaluation test server (POST) using the **access code from your invitation email** — not the example code in the PDF.

**1) Register once (get credentials)**

Call **POST** `http://20.207.122.201/evaluation-service/register` with JSON:

`email`, `name`, `mobileNo`, `githubUsername`, `rollNo`, `accessCode`

Requirements from the organizers: university/college email and roll number must match; GitHub username must match what you will submit on the Google Form (often **username only**, not the full profile URL).

Helper script (writes `output/register-response.json` and log files — **do not commit secrets**):

```powershell
cd notification_app_be
npm install

$env:REGISTER_EMAIL="you@your-college.edu"
$env:REGISTER_NAME="Your Name"
$env:REGISTER_MOBILE="9999999999"
$env:REGISTER_GITHUB_USERNAME="yourGithubUsername"
$env:REGISTER_ROLL_NO="yourRollNo"
$env:REGISTER_ACCESS_CODE="<paste-from-email>"
npm run register
```

Open `output/register-response.json` and map fields into env vars for Stage 1 (exact JSON keys depend on the server — common patterns below).

**2) Auth token — POST only (`npm run auth`)**

Stage 1 **does not** call `/auth` itself. Use the same pattern as registration: **POST** once, save JSON under `output/`.

**POST** `http://20.207.122.201/evaluation-service/auth` with:

`email`, `name`, `rollNo`, `accessCode`, `clientID`, `clientSecret`

Helper script (writes **`output/auth-response.json`** — contains **`access_token`**):

```powershell
$env:EVALUATION_EMAIL="you@your-college.edu"
$env:EVALUATION_NAME="Your Name"
$env:EVALUATION_ROLL_NO="yourRollNo"
$env:EVALUATION_ACCESS_CODE="<from your email>"
npm run auth
```

Then **`npm run stage1`** reads **`access_token`** from `output/auth-response.json` automatically.

**Optional — skip the file** and paste the token from `auth-response.json`:

```powershell
$env:NOTIFICATION_API_TOKEN="eyJ..."
npm run stage1
```

**Fallback — HTTP Basic** (only if Bearer does not apply):

```powershell
$env:EVALUATION_CLIENT_ID="..."
$env:EVALUATION_CLIENT_SECRET="..."
```

**3) Run Stage 1**

```powershell
$env:PRIORITY_INBOX_N="15"
npm run stage1
```

If you get **401**, run **`npm run auth`** again (token may have expired). Override auth file path with **`AUTH_RESPONSE_PATH`** if needed.

**Outputs**

- Structured logs: `logs/stage1-priority-inbox.log` (via **logging middleware** only — no `console` usage)
- Human-readable report for screenshots: `output/stage1-priority-notifications.txt`

**Git note**

Do **not** commit secrets or generated logs containing live API payloads if policy forbids it; commit code, design docs, and screenshots as instructed.
