import type { AskResult } from "./types.js";

export function printResult(result: AskResult): void {
  const { metadata, data } = result;

  console.log("\n📊 OpenRouter Response");
  console.log("----------------------------------------");
  console.log(`HTTP Status    : ${metadata.status} ${metadata.statusText}`);
  console.log(`Success        : ${metadata.ok ? "YES ✅" : "NO ❌"}`);
  console.log(`Response Time  : ${metadata.responseTimeMs} ms`);
  console.log(`Generation ID  : ${metadata.generationId ?? "N/A"}`);
  console.log(`Requested Model: ${metadata.requestedModel}`);
  console.log(`Response Model : ${metadata.responseModel ?? "N/A"}`);
  console.log(`Finish Reason  : ${metadata.finishReason ?? "N/A"}`);

  if (metadata.usage) {
    console.log(
      `Token Usage    : prompt=${metadata.usage.prompt_tokens ?? "N/A"}, ` +
        `completion=${metadata.usage.completion_tokens ?? "N/A"}, ` +
        `total=${metadata.usage.total_tokens ?? "N/A"}`
    );
  }

  console.log("\n🤖 Answer");
  console.log("----------------------------------------");
  console.log(data.answer);

  console.log("\n📚 Sources");
  console.log("----------------------------------------");
  if (data.source_warning) console.log(`⚠️ ${data.source_warning}`);

  data.sources.forEach((source, index) => {
    console.log(`\n#${index + 1} [${source.source_type}]`);
    console.log(`Title       : ${source.title ?? "N/A"}`);
    console.log(`Author      : ${source.author_or_person ?? "N/A"}`);
    console.log(`Institution : ${source.institution ?? "N/A"}`);
    console.log(`URL         : ${source.url ?? "N/A"}`);
    console.log(`Confidence  : ${source.confidence ?? "N/A"}`);
    if (source.note) console.log(`Note        : ${source.note}`);
  });
  console.log();
}
