/**
 * OpenRouter TypeScript CLI
 * ------------------------------------------------------------
 * โปรแกรม CLI สำหรับ:
 * 1. รับคำถามจากผู้ใช้
 * 2. ส่งคำถามไปยัง OpenRouter
 * 3. แสดงสถานะการตอบกลับจาก API
 * 4. แสดงแหล่งที่มาของ API / Model / Provider
 * 5. แสดงแหล่งที่มาของ "คำตอบ" เช่น link, สถาบัน, บุคคล, หนังสือ
 */

import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPENROUTER_API_KEY in .env");
}

/**
 * ค่าคงที่หลักของระบบ
 */
const OPENROUTER_CHAT_ENDPOINT =
  "https://openrouter.ai/api/v1/chat/completions";

const APP_TITLE = "TypeScript OpenRouter CLI";
const APP_REFERER = "http://localhost";
const REQUESTED_MODEL = "openrouter/free";

/**
 * Type ของ message ที่ส่งไปยัง OpenRouter
 */
type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Type ของ response จาก OpenRouter
 */
type OpenRouterResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    finish_reason?: string;
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    code?: number;
    metadata?: Record<string, unknown>;
  };
};

/**
 * Type ของแหล่งที่มาของคำตอบ
 *
 * source_type:
 * - link        = เว็บไซต์ / URL
 * - institution = หน่วยงาน / สถาบัน
 * - person      = บุคคล / ผู้กล่าว / ผู้เขียน
 * - book        = หนังสือ
 * - paper       = งานวิจัย / บทความวิชาการ
 * - law         = กฎหมาย / มาตรา / ประกาศ
 * - unknown     = ไม่พบแหล่งอ้างอิงที่ชัดเจน
 */
type AnswerSource = {
  source_type:
    | "link"
    | "institution"
    | "person"
    | "book"
    | "paper"
    | "law"
    | "unknown";
  title?: string;
  author_or_person?: string;
  institution?: string;
  url?: string;
  quoted_or_referenced_text?: string;
  note?: string;
  confidence?: "high" | "medium" | "low";
};

/**
 * Type ของคำตอบที่ AI ควรส่งกลับมา
 */
type SourceAwareAnswer = {
  answer: string;
  sources: AnswerSource[];
  source_warning?: string;
};

/**
 * พยายามดึง JSON ออกจากข้อความที่โมเดลตอบกลับ
 *
 * เหตุผลที่ต้องมีฟังก์ชันนี้:
 * - บางโมเดลอาจตอบ JSON ตรง ๆ
 * - บางโมเดลอาจครอบด้วย ```json ... ```
 * - บางโมเดลอาจมีข้อความก่อน/หลัง JSON
 */
function parseSourceAwareAnswer(rawContent: string): SourceAwareAnswer {
  const cleaned = rawContent
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as SourceAwareAnswer;

    if (typeof parsed.answer === "string" && Array.isArray(parsed.sources)) {
      return parsed;
    }
  } catch {
    // ถ้า parse JSON ไม่ได้ จะ fallback ด้านล่าง
  }

  /**
   * fallback:
   * ถ้าโมเดลไม่ตอบเป็น JSON ให้ถือว่าทั้งหมดคือ answer
   * และแจ้งว่าไม่มีแหล่งที่มาที่ตรวจสอบได้
   */
  return {
    answer: rawContent,
    sources: [
      {
        source_type: "unknown",
        title: "ไม่พบแหล่งที่มาที่แยกออกมาได้",
        note:
          "โมเดลไม่ได้ตอบกลับเป็น JSON ตามรูปแบบที่กำหนด จึงไม่สามารถแยกแหล่งที่มาได้",
        confidence: "low"
      }
    ],
    source_warning:
      "ไม่สามารถตรวจสอบแหล่งที่มาของคำตอบได้จาก response นี้"
  };
}

/**
 * แสดงสถานะ response จาก OpenRouter
 */
function printOpenRouterStatus(options: {
  status: number;
  statusText: string;
  ok: boolean;
  responseTimeMs: number;
  generationId?: string;
  responseModel?: string;
  finishReason?: string;
  usage?: OpenRouterResponse["usage"];
}): void {
  console.log("📊 OpenRouter Response Status");
  console.log("----------------------------------------");
  console.log(`HTTP Status     : ${options.status} ${options.statusText}`);
  console.log(`Success         : ${options.ok ? "YES ✅" : "NO ❌"}`);
  console.log(`Response Time   : ${options.responseTimeMs} ms`);
  console.log(`Generation ID   : ${options.generationId ?? "N/A"}`);
  console.log(`Response Model  : ${options.responseModel ?? "N/A"}`);
  console.log(`Finish Reason   : ${options.finishReason ?? "N/A"}`);

  if (options.usage) {
    console.log("Token Usage     :");
    console.log(`  - Prompt      : ${options.usage.prompt_tokens ?? "N/A"}`);
    console.log(`  - Completion  : ${options.usage.completion_tokens ?? "N/A"}`);
    console.log(`  - Total       : ${options.usage.total_tokens ?? "N/A"}`);
  } else {
    console.log("Token Usage     : N/A");
  }

  console.log("----------------------------------------\n");
}

/**
 * แสดงแหล่งที่มาของ API / Model
 */
function printApiSource(options: {
  apiSource: string;
  requestedModel: string;
  responseModel?: string;
  generationId?: string;
  appTitle: string;
  appReferer: string;
}): void {
  console.log("🧭 API Source / แหล่งที่มาระดับระบบ");
  console.log("----------------------------------------");
  console.log(`API Source      : ${options.apiSource}`);
  console.log(`Requested Model : ${options.requestedModel}`);
  console.log(`Response Model  : ${options.responseModel ?? "N/A"}`);
  console.log(`Generation ID   : ${options.generationId ?? "N/A"}`);
  console.log(`App Title       : ${options.appTitle}`);
  console.log(`App Referer     : ${options.appReferer}`);
  console.log("----------------------------------------\n");
}

/**
 * แสดงแหล่งที่มาของคำตอบ
 */
function printAnswerSources(sources: AnswerSource[], warning?: string): void {
  console.log("📚 Answer Sources / แหล่งที่มาของคำตอบ");
  console.log("----------------------------------------");

  if (warning) {
    console.log(`⚠️ Warning        : ${warning}`);
  }

  if (!sources.length) {
    console.log("ไม่พบแหล่งที่มาของคำตอบ");
    console.log("----------------------------------------\n");
    return;
  }

  sources.forEach((source, index) => {
    console.log(`#${index + 1}`);
    console.log(`Type            : ${source.source_type}`);
    console.log(`Title           : ${source.title ?? "N/A"}`);
    console.log(`Person/Author   : ${source.author_or_person ?? "N/A"}`);
    console.log(`Institution     : ${source.institution ?? "N/A"}`);
    console.log(`URL             : ${source.url ?? "N/A"}`);
    console.log(
      `Referenced Text : ${source.quoted_or_referenced_text ?? "N/A"}`
    );
    console.log(`Note            : ${source.note ?? "N/A"}`);
    console.log(`Confidence      : ${source.confidence ?? "N/A"}`);

    if (index < sources.length - 1) {
      console.log("----------------------------------------");
    }
  });

  console.log("----------------------------------------\n");
}

/**
 * สร้าง system prompt เพื่อบังคับให้ AI ตอบพร้อมแหล่งที่มา
 */
function buildSystemPrompt(): string {
  return `
You are a helpful TypeScript assistant.

Answer in Thai.

You must return ONLY valid JSON, with no markdown, no code fences, and no extra text.

JSON schema:
{
  "answer": "คำตอบหลักเป็นภาษาไทย",
  "sources": [
    {
      "source_type": "link | institution | person | book | paper | law | unknown",
      "title": "ชื่อแหล่งข้อมูล ถ้ามี",
      "author_or_person": "ชื่อบุคคล ผู้เขียน หรือผู้กล่าว ถ้ามี",
      "institution": "ชื่อสถาบันหรือหน่วยงาน ถ้ามี",
      "url": "URL ถ้ามี",
      "quoted_or_referenced_text": "ข้อความหรือแนวคิดที่อ้างถึงแบบสั้น",
      "note": "หมายเหตุ เช่น เป็นความรู้ทั่วไป หรือเป็นข้อมูลที่ควรตรวจสอบเพิ่มเติม",
      "confidence": "high | medium | low"
    }
  ],
  "source_warning": "คำเตือนเกี่ยวกับข้อจำกัดของแหล่งอ้างอิง ถ้ามี"
}

Important source rules:
1. Do not invent fake URLs.
2. Do not invent fake books, authors, institutions, or quotes.
3. If you are not sure about a source, use source_type "unknown" and confidence "low".
4. If the answer is based on general programming knowledge, say so in sources.
5. If the question asks for current facts, say that live web search or verified documents are needed.
6. Keep the answer concise but useful.
`.trim();
}

/**
 * ส่งคำถามไปยัง OpenRouter
 */
async function askOpenRouter(userInput: string): Promise<SourceAwareAnswer> {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    {
      role: "user",
      content: userInput
    }
  ];

  const startedAt = Date.now();

  const response = await fetch(OPENROUTER_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": APP_REFERER,
      "X-OpenRouter-Title": APP_TITLE
    },
    body: JSON.stringify({
      model: REQUESTED_MODEL,
      max_tokens: 700,
      temperature: 0.2,
      messages
    })
  });

  const responseTimeMs = Date.now() - startedAt;
  const data = (await response.json()) as OpenRouterResponse;

  const generationId = data.id ?? "N/A";
  const responseModel = data.model ?? "N/A";
  const finishReason = data.choices?.[0]?.finish_reason ?? "N/A";

  printOpenRouterStatus({
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    responseTimeMs,
    generationId,
    responseModel,
    finishReason,
    usage: data.usage
  });

  printApiSource({
    apiSource: OPENROUTER_CHAT_ENDPOINT,
    requestedModel: REQUESTED_MODEL,
    responseModel,
    generationId,
    appTitle: APP_TITLE,
    appReferer: APP_REFERER
  });

  if (!response.ok) {
    return {
      answer: `OpenRouter API Error: ${data.error?.message ?? response.statusText}`,
      sources: [
        {
          source_type: "unknown",
          title: "OpenRouter API Error",
          note: data.error?.message ?? response.statusText,
          confidence: "high"
        }
      ],
      source_warning:
        "API request ไม่สำเร็จ จึงไม่มีคำตอบจากโมเดลให้ตรวจสอบแหล่งที่มา"
    };
  }

  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    return {
      answer: "ไม่พบคำตอบจากโมเดล",
      sources: [
        {
          source_type: "unknown",
          title: "Empty model response",
          note: "OpenRouter ตอบกลับสำเร็จ แต่ไม่มี message.content",
          confidence: "high"
        }
      ],
      source_warning: "ไม่มี content สำหรับแยกแหล่งที่มาของคำตอบ"
    };
  }

  return parseSourceAwareAnswer(rawContent);
}

/**
 * main loop สำหรับรับ input จากผู้ใช้
 */
async function main(): Promise<void> {
  console.log("🚀 OpenRouter TypeScript CLI พร้อมใช้งานแล้ว");
  console.log("พิมพ์คำถาม แล้วกด Enter");
  console.log("พิมพ์ exit หรือ quit เพื่อออกจากโปรแกรม\n");

  const rl = createInterface({ input, output });

  while (true) {
    const userInput = await rl.question("💬 พิมพ์คำถามของคุณ: ");
    const trimmedInput = userInput.trim();

    if (!trimmedInput) {
      console.log("⚠️ กรุณาพิมพ์คำถามก่อนครับ\n");
      continue;
    }

    const command = trimmedInput.toLowerCase();

    if (command === "exit" || command === "quit") {
      console.log("\n👋 ปิดโปรแกรมแล้วครับ");
      break;
    }

    console.log("\n📡 กำลังส่งคำถามไปยัง OpenRouter...\n");

    const result = await askOpenRouter(trimmedInput);

    console.log("✅ คำตอบ:");
    console.log(result.answer);
    console.log("");

    printAnswerSources(result.sources, result.source_warning);

    console.log("----------------------------------------\n");
  }

  rl.close();
}

void main().catch((error: unknown) => {
  console.error("❌ Runtime error:");
  console.error(error);
  process.exitCode = 1;
});
