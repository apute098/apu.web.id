export interface ModelCapability {
  vision: boolean;
  audioInput: boolean;
  videoInput: boolean;
  reasoning: boolean;
  thinkingMode: boolean;
  toolCalling: boolean;
  search: boolean;
  openWeights: boolean;
  massiveOutput?: boolean;
}

export interface ModelBenchmark {
  reasoningScore: number; // 0-100 (MATH-500 / GPQA)
  codingScore: number;    // 0-100 (SWE-bench / HumanEval)
  generalMMLU: number;    // 0-100 (MMLU-Pro)
}

export interface ModelPricing {
  inputPer1M: number;     // USD per 1M input tokens
  outputPer1M: number;    // USD per 1M output tokens
  cachedInputPer1M?: number;
  note?: string;
}

export interface AiModelSpec {
  id: string;
  name: string;
  provider: string;
  providerSlug: string;
  tag: string;
  badgeColor: string;     // Tailwind classes
  accentColor: string;    // Hex code
  description: string;
  architecture: string;   // e.g. "671B MoE (37B active per token)"
  contextWindow: number;  // Number of tokens
  contextWindowLabel: string;
  maxOutputTokens: number;
  speedTps: number;
  speedLabel: string;     // e.g. "⚡ 95 t/s"
  pricing: ModelPricing;
  benchmarks: ModelBenchmark;
  capabilities: ModelCapability;
  bestFor: string[];
  sampleQuery: {
    prompt: string;
    expectedResponse: string;
    thoughtProcess?: string;
  };
}

export type PromptCategory =
  | 'coding'
  | 'agent'
  | 'system'
  | 'writing'
  | 'reasoning'
  | 'security'
  | 'uiux'
  | 'creative';

export interface PromptVariable {
  key: string;            // e.g. "LANGUAGE", "CODE"
  label: string;          // Human-readable label
  placeholder: string;    // Placeholder
  defaultValue: string;   // Fallback value
  type: 'text' | 'textarea';
}

export interface AiPrompt {
  id: string;
  title: string;
  category: PromptCategory;
  categoryLabel: string;
  description: string;
  tags: string[];
  recommendedModels: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tokenEstimate: number;
  variables: PromptVariable[];
  promptTemplate: string;
}

export type CodeSnippetLang = 'curl' | 'typescript' | 'python' | 'go';

export interface CodeSnippetItem {
  lang: CodeSnippetLang;
  label: string;
  filename: string;
  code: string;
}
