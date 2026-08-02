import "dotenv/config";

export type AppConfig = Readonly<{
  apiKey: string;
  endpoint: string;
  model: string;
  appTitle: string;
  appReferer: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}>;

function readPositiveNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY. Copy .env.example to .env and add your key."
    );
  }

  return {
    apiKey,
    endpoint:
      process.env.OPENROUTER_API_URL?.trim() ||
      "https://openrouter.ai/api/v1/chat/completions",
    model: process.env.OPENROUTER_MODEL?.trim() || "openrouter/free",
    appTitle:
      process.env.OPENROUTER_APP_TITLE?.trim() || "OpenRouter TypeScript CLI",
    appReferer:
      process.env.OPENROUTER_APP_REFERER?.trim() || "http://localhost",
    maxTokens: readPositiveNumber("OPENROUTER_MAX_TOKENS", 700),
    temperature: Number(process.env.OPENROUTER_TEMPERATURE ?? "0.2"),
    timeoutMs: readPositiveNumber("OPENROUTER_TIMEOUT_MS", 60_000)
  };
}
