export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = Readonly<{
  role: ChatRole;
  content: string;
}>;

export type TokenUsage = Readonly<{
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}>;

export type OpenRouterError = Readonly<{
  message?: string;
  code?: number | string;
  metadata?: Record<string, unknown>;
}>;

export type OpenRouterResponse = Readonly<{
  id?: string;
  model?: string;
  choices?: ReadonlyArray<{
    finish_reason?: string;
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  usage?: TokenUsage;
  error?: OpenRouterError;
}>;

export type AnswerSourceType =
  | "link"
  | "institution"
  | "person"
  | "book"
  | "paper"
  | "law"
  | "unknown";

export type AnswerSource = Readonly<{
  source_type: AnswerSourceType;
  title?: string;
  author_or_person?: string;
  institution?: string;
  url?: string;
  quoted_or_referenced_text?: string;
  note?: string;
  confidence?: "high" | "medium" | "low";
}>;

export type SourceAwareAnswer = Readonly<{
  answer: string;
  sources: ReadonlyArray<AnswerSource>;
  source_warning?: string;
}>;

export type RequestMetadata = Readonly<{
  status: number;
  statusText: string;
  ok: boolean;
  responseTimeMs: number;
  generationId?: string;
  requestedModel: string;
  responseModel?: string;
  finishReason?: string;
  usage?: TokenUsage;
}>;

export type AskResult = Readonly<{
  data: SourceAwareAnswer;
  metadata: RequestMetadata;
}>;
