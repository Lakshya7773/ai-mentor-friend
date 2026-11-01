// src/lib/dialogue/unknowns.ts
import type { DialogueContext } from './types'

export function unansweredUnknowns(ctx: DialogueContext): string[] {
  const unknowns = ctx.criticalUnknowns ?? []
  const answered = new Set(ctx.answeredUnknowns ?? [])
  return unknowns.filter((u) => !answered.has(u))
}

export function selectCriticalUnknowns(ctx: DialogueContext, max?: number): string[] {
  const limit = max ?? ctx.maxClarificationQuestions ?? 2
  const candidates = unansweredUnknowns(ctx)
  return candidates.slice(0, Math.max(0, limit))
}
