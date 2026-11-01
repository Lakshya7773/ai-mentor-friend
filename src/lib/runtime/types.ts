// src/lib/runtime/types.ts
export type InteractionMode = 'listening' | 'accountability' | 'mentor' | 'deep-analysis'

export type ReasoningEffort = 'low' | 'medium' | 'high' | null

export interface RuntimeStrategy {
  mode: InteractionMode
  reasoningEffort: ReasoningEffort
  maxGenerationTokens: number
}

export type TurnStatus = 'success' | 'empty' | 'error'

export interface RuntimeOverrides {
  reasoningEffort?: ReasoningEffort
  maxGenerationTokens?: number
}
