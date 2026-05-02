import type { AppLogger } from "./logger";

type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;
type SyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => TResult;

export function withAsyncLogging<TArgs extends unknown[], TResult>(
  logger: AppLogger,
  operationName: string,
  fn: AsyncFn<TArgs, TResult>,
  meta?: Record<string, unknown>,
): AsyncFn<TArgs, TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    logger.info(`Begin ${operationName}`, operationName, { ...meta, phase: "start" });
    const started = Date.now();
    try {
      const result = await fn(...args);
      logger.info(`Complete ${operationName}`, operationName, {
        ...meta,
        phase: "success",
        durationMs: Date.now() - started,
      });
      return result;
    } catch (err) {
      logger.error(`Failed ${operationName}`, operationName, {
        ...meta,
        phase: "error",
        durationMs: Date.now() - started,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  };
}

export function withSyncLogging<TArgs extends unknown[], TResult>(
  logger: AppLogger,
  operationName: string,
  fn: SyncFn<TArgs, TResult>,
  meta?: Record<string, unknown>,
): SyncFn<TArgs, TResult> {
  return (...args: TArgs): TResult => {
    logger.info(`Begin ${operationName}`, operationName, { ...meta, phase: "start" });
    const started = Date.now();
    try {
      const result = fn(...args);
      logger.info(`Complete ${operationName}`, operationName, {
        ...meta,
        phase: "success",
        durationMs: Date.now() - started,
      });
      return result;
    } catch (err) {
      logger.error(`Failed ${operationName}`, operationName, {
        ...meta,
        phase: "error",
        durationMs: Date.now() - started,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  };
}
