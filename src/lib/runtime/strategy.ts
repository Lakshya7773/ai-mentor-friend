// src/lib/runtime/strategy.ts
import type { InteractionMode, RuntimeStrategy, RuntimeOverrides, ReasoningEffort } from './types'

const DEFAULTS: Record<InteractionMode, RuntimeStrategy> = {
  listening: { mode: 'listening', reasoningEffort: null, maxGenerationTokens: 512 },
  accountability: { mode: 'accountability', reasoningEffort: null, maxGenerationTokens: 512 },
  mentor: { mode: 'mentor', reasoningEffort: null, maxGenerationTokens: 512 },
  'deep-analysis': { mode: 'deep-analysis', reasoningEffort: 'low', maxGenerationTokens: 1200 },
}

export function defaultStrategy(mode: InteractionMode): RuntimeStrategy {
  return { ...DEFAULTS[mode] }
}

export function resolveStrategy(mode: InteractionMode, overrides: RuntimeOverrides = {}): RuntimeStrategy {
  const base = defaultStrategy(mode)
  return {
    ...base,
    reasoningEffort: overrides.reasoningEffort !== undefined ? overrides.reasoningEffort : base.reasoningEffort,
    maxGenerationTokens: overrides.maxGenerationTokens ?? base.maxGenerationTokens,
  }
}

export function resolveReasoningEffortForProvider(strategy: RuntimeStrategy): ReasoningEffort {
  return strategy.reasoningEffort
}
