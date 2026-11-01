// src/lib/dialogue/assessment.ts
import type { DialogueAssessment, DialogueContext } from './types'
import { selectCriticalUnknowns } from './unknowns'

export function assessDialogueState(ctx: DialogueContext): DialogueAssessment {
  const maxQ = ctx.maxClarificationQuestions ?? 2
  const selected = selectCriticalUnknowns(ctx, maxQ)
  const assumptions = ctx.assumptionsToChallenge ?? []

  if (ctx.userWantsListening) {
    return {
      intent: 'listen',
      responseDepth: 'brief',
      informationSufficient: false,
      criticalUnknowns: selected,
      assumptionsToChallenge: assumptions,
      recommendationReady: false,
    }
  }

  if (selected.length > 0) {
    return {
      intent: 'clarify',
      responseDepth: 'standard',
      informationSufficient: false,
      criticalUnknowns: selected,
      assumptionsToChallenge: assumptions,
      recommendationReady: false,
    }
  }

  if (ctx.hasObviousRisk) {
    return {
      intent: 'challenge',
      responseDepth: 'standard',
      informationSufficient: true,
      criticalUnknowns: selected,
      assumptionsToChallenge: assumptions,
      recommendationReady: false,
    }
  }

  if (assumptions.length > 0) {
    return {
      intent: 'analyze',
      responseDepth: 'standard',
      informationSufficient: true,
      criticalUnknowns: selected,
      assumptionsToChallenge: assumptions,
      recommendationReady: false,
    }
  }

  return {
    intent: 'advise',
    responseDepth: 'standard',
    informationSufficient: true,
    criticalUnknowns: selected,
    assumptionsToChallenge: assumptions,
    recommendationReady: true,
  }
}
