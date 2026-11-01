import { describe, it, expect } from 'vitest'
import { buildConstitutionPrompt, buildEvaluationSystemPrompt, CONSTITUTION_VERSION } from './prompt'

describe('ConstitutionPrompt', () => {
  it('includes required principles', () => {
    const p = buildConstitutionPrompt()
    expect(p).toContain('Truth over agreement')
    expect(p).toContain('Challenge before praise')
    expect(p).toContain('Adaptive directness')
    expect(p).toContain('No performative harshness')
    expect(p).toContain('Listen before solving')
    expect(p).toContain('Use context, not assumptions')
    expect(p).toContain('Friend test')
  })

  it('evaluation prompt includes constitution + scenario context', () => {
    const p = buildEvaluationSystemPrompt('Scenario X')
    expect(p).toContain('AI Mentor-Friend')
    expect(p).toContain('Scenario X')
  })

  it('version exists', () => {
    expect(CONSTITUTION_VERSION).toBeTruthy()
  })
})
