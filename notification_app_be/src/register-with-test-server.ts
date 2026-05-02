import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createLogger } from "campus-logging-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTER_URL = "http://20.207.122.201/evaluation-service/register";

async function main(): Promise<void> {
  const logDir = path.join(__dirname, "..", "logs");
  const outDir = path.join(__dirname, "..", "output");
  fs.mkdirSync(outDir, { recursive: true });

  const logger = createLogger(logDir, "register-with-test-server");

  const email = process.env.REGISTER_EMAIL?.trim();
  const name = process.env.REGISTER_NAME?.trim();
  const mobileNo = process.env.REGISTER_MOBILE?.trim();
  const githubUsername = process.env.REGISTER_GITHUB_USERNAME?.trim();
  const rollNo = process.env.REGISTER_ROLL_NO?.trim();
  const accessCode = process.env.REGISTER_ACCESS_CODE?.trim();

  const missing = ["REGISTER_EMAIL", "REGISTER_NAME", "REGISTER_MOBILE", "REGISTER_GITHUB_USERNAME", "REGISTER_ROLL_NO", "REGISTER_ACCESS_CODE"].filter(
    (k) => !process.env[k]?.trim(),
  );
  if (missing.length) {
    logger.error("Missing required env vars", "register", { missing });
    throw new Error(`Set: ${missing.join(", ")}`);
  }

  const body = {
    email: email!,
    name: name!,
    mobileNo: mobileNo!,
    githubUsername: githubUsername!,
    rollNo: rollNo!,
    accessCode: accessCode!,
  };

  logger.info("Posting registration to test server", "register", {
    url: REGISTER_URL,
    email,
    githubUsername,
    rollNo,
  });

  const res = await fetch(REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const outPath = path.join(outDir, "register-response.json");
  fs.writeFileSync(outPath, text, "utf8");
  logger.info("Raw response saved", "register", { path: outPath, status: res.status });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    logger.error("Response was not JSON", "register", { preview: text.slice(0, 300) });
    throw new Error("Invalid JSON from register endpoint");
  }

  if (!res.ok) {
    logger.error("Registration failed", "register", { status: res.status, bodyKeys: parsed && typeof parsed === "object" ? Object.keys(parsed as object) : [] });
    throw new Error(`HTTP ${res.status}`);
  }

  const keys = typeof parsed === "object" && parsed !== null ? Object.keys(parsed as object) : [];
  logger.info("Registration HTTP OK", "register", { responseKeys: keys });
}

main().catch((err) => {
  const logger = createLogger(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "logs"), "register-with-test-server");
  logger.error("Register script failed", "register", { error: err instanceof Error ? err.message : String(err) });
  process.exitCode = 1;
});
