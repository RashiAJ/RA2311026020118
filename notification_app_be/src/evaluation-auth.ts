import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AppLogger } from "campus-logging-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_AUTH_FILE = path.join(__dirname, "..", "output", "auth-response.json");

export async function resolveAuthorizationForNotifications(logger: AppLogger): Promise<{
  headers: Record<string, string>;
  mode: string;
}> {
  const envBearer =
    process.env.NOTIFICATION_API_TOKEN?.trim() ?? process.env.EVALUATION_ACCESS_TOKEN?.trim();
  if (envBearer) {
    logger.info("Auth: Bearer from environment", "evaluation-auth", {});
    return {
      headers: { Accept: "application/json", Authorization: `Bearer ${envBearer}` },
      mode: "Bearer-env",
    };
  }

  const authPath = process.env.AUTH_RESPONSE_PATH?.trim() || DEFAULT_AUTH_FILE;
  try {
    const raw = await fs.readFile(authPath, "utf8");
    const token = (JSON.parse(raw) as { access_token?: string }).access_token?.trim();
    if (token) {
      logger.info("Auth: Bearer from auth-response file", "evaluation-auth", { path: authPath });
      return {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        mode: "Bearer-file",
      };
    }
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? (e as NodeJS.ErrnoException).code : "";
    if (code !== "ENOENT") {
      logger.warn("Could not read auth file", "evaluation-auth", { path: authPath });
    }
  }

  logger.info("Auth: none", "evaluation-auth", {});
  return { headers: { Accept: "application/json" }, mode: "none" };
}
