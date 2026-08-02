import type { AnswerSource, SourceAwareAnswer } from "./types.js";

const SOURCE_TYPES = new Set([
  "link",
  "institution",
  "person",
  "book",
  "paper",
  "law",
  "unknown"
]);

function isSource(value: unknown): value is AnswerSource {
  if (!value || typeof value !== "object") return false;
  const source = value as Record<string, unknown>;
  return (
    typeof source.source_type === "string" &&
    SOURCE_TYPES.has(source.source_type)
  );
}

function extractJsonObject(raw: string): string {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

export function parseSourceAwareAnswer(raw: string): SourceAwareAnswer {
  try {
    const parsed = JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;
    if (
      typeof parsed.answer === "string" &&
      Array.isArray(parsed.sources) &&
      parsed.sources.every(isSource)
    ) {
      return {
        answer: parsed.answer,
        sources: parsed.sources,
        source_warning:
          typeof parsed.source_warning === "string"
            ? parsed.source_warning
            : undefined
      };
    }
  } catch {
    // The fallback below preserves the raw answer without claiming citations.
  }

  return {
    answer: raw,
    sources: [
      {
        source_type: "unknown",
        title: "Unstructured model response",
        note: "The response did not match the requested JSON contract.",
        confidence: "low"
      }
    ],
    source_warning:
      "ไม่สามารถแยกหรือตรวจสอบแหล่งที่มาจากรูปแบบ response นี้ได้"
  };
}
