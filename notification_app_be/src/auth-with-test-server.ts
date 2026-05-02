import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createLogger } from "campus-logging-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";

function readRegisterClientCredentials(outDir: string): { clientID?: string; clientSecret?: string } {
  const regPath = path.join(outDir, "register-response.json");
  if (!fs.existsSync(regPath)) return {};
  try {
    const j = JSON.parse(fs.readFileSync(regPath, "utf8")) as Record<string, unknown>;
    const id = j.clientID ?? j.clientId ?? j.ClientID;
    const sec = j.clientSecret ?? j.client_secret ?? j.ClientSecret;
    return {
      clientID: typeof id === "string" ? id : undefined,
      clientSecret: typeof sec === "string" ? sec : undefined,
    };
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const logDir = path.join(__dirname, "..", "logs");
  const outDir = path.join(__dirname, "..", "output");
  fs.mkdirSync(outDir, { recursive: true });

  const logger = createLogger(logDir, "auth-with-test-server");

  const fromReg = readRegisterClientCredentials(outDir);

  const email =
    process.env.EVALUATION_EMAIL?.trim() ?? process.env.REGISTER_EMAIL?.trim();
  const name = process.env.EVALUATION_NAME?.trim() ?? process.env.REGISTER_NAME?.trim();
  const rollNo =
    process.env.EVALUATION_ROLL_NO?.trim() ?? process.env.REGISTER_ROLL_NO?.trim();
  const accessCode =
    process.env.EVALUATION_ACCESS_CODE?.trim() ?? process.env.REGISTER_ACCESS_CODE?.trim();
  const clientID = process.env.EVALUATION_CLIENT_ID?.trim() ?? fromReg.clientID;
  const clientSecret = process.env.EVALUATION_CLIENT_SECRET?.trim() ?? fromReg.clientSecret;

  const missing: string[] = [];
  if (!email) missing.push("EVALUATION_EMAIL or REGISTER_EMAIL");
  if (!name) missing.push("EVALUATION_NAME or REGISTER_NAME");
  if (!rollNo) missing.push("EVALUATION_ROLL_NO or REGISTER_ROLL_NO");
  if (!accessCode) missing.push("EVALUATION_ACCESS_CODE or REGISTER_ACCESS_CODE");
  if (!clientID) missing.push("EVALUATION_CLIENT_ID or register-response.json client id");
  if (!clientSecret) missing.push("EVALUATION_CLIENT_SECRET or register-response.json client secret");

  if (missing.length) {
    logger.error("Missing required values for POST /auth", "auth", { missing });
    throw new Error(`Provide: ${missing.join(", ")}`);
  }

  const body = {
    email: email!,
    name: name!,
    rollNo: rollNo!,
    accessCode: accessCode!,
    clientID: clientID!,
    clientSecret: clientSecret!,
  };

  logger.info("Posting to authorization API", "auth", { url: AUTH_URL, email });

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const outPath = path.join(outDir, "auth-response.json");
  fs.writeFileSync(outPath, text, "utf8");
  logger.info("Raw response saved", "auth", { path: outPath, status: res.status });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    logger.error("Response was not JSON", "auth", { preview: text.slice(0, 300) });
    throw new Error("Invalid JSON from auth endpoint");
  }

  if (!res.ok) {
    logger.error("Authorization failed", "auth", {
      status: res.status,
      bodyKeys: parsed && typeof parsed === "object" ? Object.keys(parsed as object) : [],
    });
    throw new Error(`HTTP ${res.status}`);
  }

  const keys = typeof parsed === "object" && parsed !== null ? Object.keys(parsed as object) : [];
  logger.info("Authorization HTTP OK", "auth", { responseKeys: keys });
}

main().catch((err) => {
  const logger = createLogger(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "logs"), "auth-with-test-server");
  logger.error("Auth script failed", "auth", { error: err instanceof Error ? err.message : String(err) });
  process.exitCode = 1;
});
