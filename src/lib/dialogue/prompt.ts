// src/lib/dialogue/prompt.ts
import type { DialogueAssessment } from './types'

export function buildDialogueGuidance(a: DialogueAssessment): string {
  if (a.intent === 'clarify') {
    const gaps = a.criticalUnknowns.map((g) => `- ${g}`).join('\n')
    return [
      'CURRENT TASK: Clarify only.',
      'ALLOWED INFORMATION GAPS:',
      gaps || '(none)',
      'QUESTION SCOPE: Ask only about the allowed information gaps above. Do not introduce additional clarification questions or new information-gathering topics outside this list.',
      'QUESTION COUNT: Ask only what is necessary to address the allowed gaps.',
      'RECOMMENDATION: Do not provide a final recommendation yet.',
      'You may briefly acknowledge the user\'s situation or identify an obvious risk, but do not turn that into extra questions.',
    ].join('\n')
  }
  if (a.intent === 'advise') {
    return [
      'The available context is sufficient for a useful recommendation.',
      'Give a clear conclusion.',
      'Explain the key reasoning concisely.',
      'Challenge faulty assumptions where necessary.',
      'Do not ask unnecessary follow-up questions.',
      'ADVICE QUALITY: Base the recommendation on facts the user actually provided; do not present unknown facts as established.',
      'Calibrate certainty: a clear recommendation is allowed, but avoid presenting it as universally or unquestionably correct when material unknowns remain.',
      'Identify decision-changing conditions: explain what facts could change the recommendation.',
      'Preserve directness: do not weaken the response into vague hedging, "it depends", generic disclaimers, or excessive neutrality.',
      'Provide practical next steps.',
      'Do not expose chain-of-thought; give concise conclusions and user-facing reasoning only.',
    ].join(' ')
  }
  if (a.intent === 'challenge') {
    return 'An obvious risk is present. Challenge it honestly and directly, then ask only the most critical clarifying questions.'
  }
  if (a.intent === 'listen') {
    return 'The user needs to be heard. Listen before solving. Do not force a lecture.'
  }
  return 'Analyze the situation using available context. Identify missing information or assumptions.'
}
