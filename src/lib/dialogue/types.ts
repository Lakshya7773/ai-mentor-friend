// src/lib/dialogue/types.ts
export type MentorResponseIntent = 'listen' | 'clarify' | 'challenge' | 'analyze' | 'advise'

export type ResponseDepth = 'brief' | 'standard' | 'deep'

export interface DialogueAssessment {
  intent: MentorResponseIntent
  responseDepth: ResponseDepth
  informationSufficient: boolean
  criticalUnknowns: string[]
  assumptionsToChallenge: string[]
  recommendationReady: boolean
}

export type DialogueState =
  | 'INITIAL'
  | 'INSUFFICIENT_CONTEXT'
  | 'CLARIFICATION_REQUESTED'
  | 'CONTEXT_GATHERED'
  | 'ANALYSIS_READY'
  | 'RECOMMENDATION_READY'

export interface DialogueContext {
  knownFacts?: string[]
  criticalUnknowns?: string[]
  answeredUnknowns?: string[]
  assumptionsToChallenge?: string[]
  hasObviousRisk?: boolean
  userWantsListening?: boolean
  maxClarificationQuestions?: number
}
