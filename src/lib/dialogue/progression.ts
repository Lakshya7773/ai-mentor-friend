// src/lib/dialogue/progression.ts
import type { DialogueAssessment, DialogueState } from './types'

export function nextState(current: DialogueState, a: DialogueAssessment): DialogueState {
  switch (a.intent) {
    case 'listen':
      return current === 'INITIAL' ? 'INITIAL' : current
    case 'clarify':
      return 'INSUFFICIENT_CONTEXT'
    case 'challenge':
      return 'ANALYSIS_READY'
    case 'analyze':
      return 'ANALYSIS_READY'
    case 'advise':
      return 'RECOMMENDATION_READY'
  }
}
