/**
 * Stage 1: Priority inbox — top N unread notifications by type weight + recency.
 * Uses campus-logging-middleware only (no console / built-in loggers).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createLogger, withAsyncLogging } from "campus-logging-middleware";
import { createFetchNotifications } from "./fetch-notifications";
import { normalizeNotifications } from "./normalize";
import { maintainTopKStream, selectTopUnread } from "./priority-inbox";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const logDir = path.join(__dirname, "..", "logs");
  const reportDir = path.join(__dirname, "..", "output");

  const logger = createLogger(logDir, "stage1-priority-inbox");

  logger.info("Stage 1 priority inbox job starting", "main", {
    node: process.version,
    priorityInboxN: process.env.PRIORITY_INBOX_N ?? "10 (default)",
  });

  const n = Math.max(1, parseInt(process.env.PRIORITY_INBOX_N ?? "10", 10) || 10);

  const run = withAsyncLogging(logger, "stage1Pipeline", async () => {
    const fetchNotifications = createFetchNotifications(logger);
    const raw = await fetchNotifications();
    const normalized = normalizeNotifications(raw, logger);

    const readIds = new Set<string>();
    const topBatch = selectTopUnread(normalized, readIds, n);
    const topStream = maintainTopKStream(normalized, readIds, n, logger);

    logger.info("Validated batch vs streaming heap results", "main", {
      batchTopIds: topBatch.map((x) => x.id),
      streamTopIds: topStream.map((x) => x.id),
      match:
        topBatch.length === topStream.length &&
        topBatch.every((b, i) => b.id === topStream[i]?.id),
    });

    const lines: string[] = [
      `Configured N = ${n}`,
      "",
      "Top priority unread notifications (ordering: Placement > Result > Event, then newest):",
      "",
    ];

    topBatch.forEach((item, i) => {
      lines.push(
        `${String(i + 1).padStart(2, " ")}. [${item.type}] ${item.timestampIso} — ${item.message}`,
      );
      lines.push(`     ID: ${item.id}`);
      lines.push("");
    });

    logger.info("Priority inbox selection complete", "main", {
      count: topBatch.length,
      types: topBatch.reduce<Record<string, number>>((acc, x) => {
        acc[x.type] = (acc[x.type] ?? 0) + 1;
        return acc;
      }, {}),
    });

    const reportPath = path.join(reportDir, "stage1-priority-notifications.txt");
    logger.writeReportFile(
      reportPath,
      "Campus Notifications — Stage 1 Priority Inbox (Top N)",
      lines,
    );

    return topBatch;
  });

  await run();
}

main().catch((err) => {
  const fallbackLog = createLogger(path.join(__dirname, "..", "logs"), "stage1-priority-inbox");
  fallbackLog.error("Stage 1 fatal exit", "main", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exitCode = 1;
});
