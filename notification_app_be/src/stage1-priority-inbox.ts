import path from "node:path";
import { fileURLToPath } from "node:url";

import { createLogger, withAsyncLogging } from "campus-logging-middleware";
import { createFetchNotifications } from "./fetch-notifications.js";
import { normalize, topPriority } from "./priority.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const logDir = path.join(__dirname, "..", "logs");
  const reportDir = path.join(__dirname, "..", "output");
  const logger = createLogger(logDir, "stage1-priority-inbox");

  const n = Math.max(1, parseInt(process.env.PRIORITY_INBOX_N ?? "10", 10) || 10);

  logger.info("Stage 1 start", "main", { node: process.version, n });

  const run = withAsyncLogging(logger, "stage1", async () => {
    const fetchNotifications = createFetchNotifications(logger);
    const raw = await fetchNotifications();
    const items = normalize(raw, logger);
    const top = topPriority(items, n);

    const lines: string[] = [
      `N = ${n}`,
      "",
      "Top notifications (Placement > Result > Event, then newest):",
      "",
    ];

    top.forEach((item, i) => {
      lines.push(`${String(i + 1).padStart(2, " ")}. [${item.type}] ${item.timestampIso} — ${item.message}`);
      lines.push(`     ID: ${item.id}`);
      lines.push("");
    });

    logger.info("Done", "main", { count: top.length });

    logger.writeReportFile(
      path.join(reportDir, "stage1-priority-notifications.txt"),
      "Campus Notifications — Stage 1 Priority Inbox (Top N)",
      lines,
    );

    return top;
  });

  await run();
}

main().catch((err) => {
  const log = createLogger(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "logs"), "stage1-priority-inbox");
  log.error("Fatal", "main", { error: err instanceof Error ? err.message : String(err) });
  process.exitCode = 1;
});
