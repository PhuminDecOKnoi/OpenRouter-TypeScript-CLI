import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { AppConfig } from "./config.js";
import { askOpenRouter } from "./openrouter-client.js";
import { printResult } from "./output.js";

export async function runCli(config: AppConfig): Promise<void> {
  const readline = createInterface({ input: stdin, output: stdout });

  console.log("🚀 OpenRouter TypeScript CLI");
  console.log(`Model: ${config.model}`);
  console.log("พิมพ์คำถามแล้วกด Enter หรือพิมพ์ exit เพื่อจบการทำงาน\n");

  try {
    while (true) {
      const question = (await readline.question("You > ")).trim();
      if (!question) continue;
      if (["exit", "quit", ":q"].includes(question.toLowerCase())) break;

      const result = await askOpenRouter(config, question);
      printResult(result);
    }
  } finally {
    readline.close();
  }

  console.log("👋 ปิดโปรแกรมเรียบร้อยแล้ว");
}
