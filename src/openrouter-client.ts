import type { AppConfig } from "./config.js";
import { parseSourceAwareAnswer } from "./parser.js";
import { buildSystemPrompt } from "./prompts.js";
import type {
  AskResult,
  ChatMessage,
  OpenRouterResponse,
  SourceAwareAnswer
} from "./types.js";

function errorAnswer(message: string): SourceAwareAnswer {
  return {
    answer: `OpenRouter API Error: ${message}`,
    sources: [
      {
        source_type: "unknown",
        title: "OpenRouter API Error",
        note: message,
        confidence: "high"
      }
    ],
    source_warning: "คำขอ API ไม่สำเร็จ จึงไม่มีคำตอบจากโมเดล"
  };
}

async function readResponse(response: Response): Promise<OpenRouterResponse> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as OpenRouterResponse;
  } catch {
    return {
      error: {
        message: `OpenRouter returned a non-JSON response: ${text.slice(0, 300)}`
      }
    };
  }
}

export async function askOpenRouter(
  config: AppConfig,
  userInput: string
): Promise<AskResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: userInput }
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.appReferer,
        "X-OpenRouter-Title": config.appTitle
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages
      })
    });

    const payload = await readResponse(response);
    const metadata = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      responseTimeMs: Math.round(performance.now() - startedAt),
      generationId: payload.id,
      requestedModel: config.model,
      responseModel: payload.model,
      finishReason: payload.choices?.[0]?.finish_reason,
      usage: payload.usage
    };

    if (!response.ok) {
      return {
        data: errorAnswer(payload.error?.message ?? response.statusText),
        metadata
      };
    }

    const content = payload.choices?.[0]?.message?.content;
    return {
      data: content
        ? parseSourceAwareAnswer(content)
        : errorAnswer("The API returned no message content."),
      metadata
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? `Request timed out after ${config.timeoutMs} ms.`
        : error instanceof Error
          ? error.message
          : "Unknown network error";

    return {
      data: errorAnswer(message),
      metadata: {
        status: 0,
        statusText: "NETWORK_ERROR",
        ok: false,
        responseTimeMs: Math.round(performance.now() - startedAt),
        requestedModel: config.model
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}
