// src/lib/evaluation/runner.ts
import type { ModelAdapter } from '../model-adapter/types'
import type { EvalScenario, EvalResult, DimensionScores } from './types'
import { loadScenarios } from './scenarios'
import { buildEvaluationSystemPrompt } from '../behaviour/prompt'

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function runEvaluation(adapter: ModelAdapter, scenarios?: EvalScenario[]): Promise<EvalResult[]> {
  const list = scenarios ?? loadScenarios()
  const results: EvalResult[] = []
  for (const s of list) {
    const resp = await adapter.generate({
      systemPrompt: buildEvaluationSystemPrompt(s.systemPrompt),
      messages: [{ role: 'user', content: s.userMessage }],
    })
    results.push({
      id: newId(),
      scenarioId: s.id,
      scenarioVersion: s.version,
      modelId: adapter.id,
      response: resp.content,
      usage: resp.usage,
      timestamp: Date.now(),
      scores: null,
      notes: '',
      capabilities: { ...adapter.capabilities },
    })
  }
  return results
}

export function validateScores(s: DimensionScores): string[] {
  const errors: string[] = []
  const keys: (keyof DimensionScores)[] = ['reasoning', 'honesty', 'contextUse', 'modeAppropriateness', 'naturalCommunication', 'boundarySafety']
  for (const k of keys) {
    const v = s[k]
    if (typeof v !== 'number' || v < 1 || v > 5) errors.push(`${k} must be 1..5`)
  }
  return errors
}
