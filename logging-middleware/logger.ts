import * as fs from "fs";
import * as path from "path";
import type { LogLevel, LogRecord } from "./types";

/**
 * Application logging facade. Persists structured records to disk — no console APIs.
 */
export class AppLogger {
  private readonly logFilePath: string;

  constructor(logDir: string, private readonly serviceName: string) {
    fs.mkdirSync(logDir, { recursive: true });
    this.logFilePath = path.join(logDir, `${serviceName}.log`);
  }

  private persist(record: LogRecord): void {
    const line = JSON.stringify(record) + "\n";
    fs.appendFileSync(this.logFilePath, line, "utf8");
  }

  private baseRecord(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): LogRecord {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(metadata && Object.keys(metadata).length ? { metadata } : {}),
    };
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.persist(this.baseRecord("debug", message, context, metadata));
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.persist(this.baseRecord("info", message, context, metadata));
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.persist(this.baseRecord("warn", message, context, metadata));
  }

  error(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.persist(this.baseRecord("error", message, context, metadata));
  }

  /** Human-readable report block (for screenshots / review) — still via middleware only. */
  writeReportFile(reportPath: string, title: string, bodyLines: string[]): void {
    const dir = path.dirname(reportPath);
    fs.mkdirSync(dir, { recursive: true });
    const text = [title, "=".repeat(title.length), "", ...bodyLines, ""].join("\n");
    fs.writeFileSync(reportPath, text, "utf8");
    this.info("Report file written", "logging.writeReportFile", {
      reportPath,
      lineCount: bodyLines.length,
    });
  }
}

export function createLogger(logDir: string, serviceName: string): AppLogger {
  return new AppLogger(logDir, serviceName);
}
