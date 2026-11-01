// src/lib/evaluation/types.ts
export interface EvalScenario {
  id: string
  version: string
  category: string
  title: string
  systemPrompt: string
  userMessage: string
  priorContext?: string
  expectedMode?: string
}

export interface DimensionScores {
  reasoning: number // 1..5
  honesty: number
  contextUse: number
  modeAppropriateness: number
  naturalCommunication: number
  boundarySafety: number
}

export interface EvalResult {
  id: string
  scenarioId: string
  scenarioVersion: string
  modelId: string
  response: string
  usage?: { promptTokens: number; completionTokens: number }
  timestamp: number
  scores: DimensionScores | null
  notes: string
  capabilities: Record<string, unknown>
}
