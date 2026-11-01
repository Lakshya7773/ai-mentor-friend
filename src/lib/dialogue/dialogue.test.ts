import { describe, it, expect } from 'vitest'
import { assessDialogueState } from './assessment'
import { selectCriticalUnknowns } from './unknowns'
import { nextState } from './progression'
import { buildDialogueGuidance } from './prompt'

describe('Dialogue', () => {
  it('insufficient context -> clarify, not ready', () => {
    const a = assessDialogueState({ criticalUnknowns: ['salary diff', 'runway', 'stage'] })
    expect(a.intent).toBe('clarify')
    expect(a.informationSufficient).toBe(false)
    expect(a.recommendationReady).toBe(false)
    expect(a.criticalUnknowns.length).toBe(2)
  })

  it('context sufficient -> advise ready', () => {
    const a = assessDialogueState({ criticalUnknowns: [], knownFacts: ['x'] })
    expect(a.intent).toBe('advise')
    expect(a.recommendationReady).toBe(true)
  })

  it('no repeated questions', () => {
    const ctx = { criticalUnknowns: ['a', 'b'], answeredUnknowns: ['a'] }
    expect(selectCriticalUnknowns(ctx)).toEqual(['b'])
  })

  it('immediate challenge supported', () => {
    const a = assessDialogueState({ criticalUnknowns: [], hasObviousRisk: true })
    expect(a.intent).toBe('challenge')
  })

  it('listening separate', () => {
    const a = assessDialogueState({ userWantsListening: true, criticalUnknowns: ['x'] })
    expect(a.intent).toBe('listen')
  })

  it('clarify guidance includes selected scope and boundary', () => {
    const a = assessDialogueState({ criticalUnknowns: ['salary difference', 'financial runway'] })
    const g = buildDialogueGuidance(a)
    expect(g).toContain('salary difference')
    expect(g).toContain('financial runway')
    expect(g).toContain('Do not introduce additional clarification questions')
    expect(g).toContain('Do not provide a final recommendation yet')
  })

  it('other intents lack clarify scope language', () => {
    const listen = buildDialogueGuidance(assessDialogueState({ userWantsListening: true, criticalUnknowns: ['x'] }))
    const challenge = buildDialogueGuidance(assessDialogueState({ criticalUnknowns: [], hasObviousRisk: true }))
    const advise = buildDialogueGuidance(assessDialogueState({ criticalUnknowns: [] }))
    for (const g of [listen, challenge, advise]) {
      expect(g).not.toContain('ALLOWED INFORMATION GAPS')
    }
  })

  it('advise guidance includes quality guardrails', () => {
    const a = assessDialogueState({ criticalUnknowns: [] })
    const g = buildDialogueGuidance(a)
    expect(g).toContain('Base the recommendation on facts')
    expect(g).toContain('Calibrate certainty')
    expect(g).toContain('Identify decision-changing conditions')
    expect(g).toContain('Preserve directness')
    expect(g).toContain('Do not expose chain-of-thought')
  })

  it('progression', () => {
    const a = assessDialogueState({ criticalUnknowns: ['x'] })
    expect(nextState('INITIAL', a)).toBe('INSUFFICIENT_CONTEXT')
  })
})
