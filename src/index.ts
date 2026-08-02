import { loadConfig } from "./config.js";
import { runCli } from "./cli.js";

async function main(): Promise<void> {
  const config = loadConfig();
  await runCli(config);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown fatal error";
  console.error(`\n❌ Fatal error: ${message}`);
  process.exitCode = 1;
});
