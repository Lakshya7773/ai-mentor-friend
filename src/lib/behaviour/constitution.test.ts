import { describe, it, expect } from 'vitest'
import { BEHAVIOUR_CONSTITUTION } from './constitution'

describe('BehaviourConstitution', () => {
  it('has a version', () => {
    expect(BEHAVIOUR_CONSTITUTION.version).toBeTruthy()
  })

  it('defines all four modes', () => {
    const modes = Object.keys(BEHAVIOUR_CONSTITUTION.modes)
    expect(modes).toContain('friend')
    expect(modes).toContain('mentor')
    expect(modes).toContain('challenger')
    expect(modes).toContain('listener')
  })

  it('selectMode is deterministic', () => {
    const ctx = { needsAdvice: true }
    expect(BEHAVIOUR_CONSTITUTION.selectMode(ctx)).toBe(BEHAVIOUR_CONSTITUTION.selectMode(ctx))
  })

  it('handles incomplete context safely', () => {
    expect(() => BEHAVIOUR_CONSTITUTION.selectMode({})).not.toThrow()
    expect(BEHAVIOUR_CONSTITUTION.selectMode({})).toBe('friend')
  })

  it('listener takes priority on distress', () => {
    expect(BEHAVIOUR_CONSTITUTION.selectMode({ userDistress: true, needsAdvice: true })).toBe('listener')
  })

  it('challenger on contradiction', () => {
    expect(BEHAVIOUR_CONSTITUTION.selectMode({ contradictionDetected: true })).toBe('challenger')
  })

  it('is inspectable without model provider', () => {
    expect(BEHAVIOUR_CONSTITUTION.principles.length).toBeGreaterThan(0)
    expect(BEHAVIOUR_CONSTITUTION.identity).toContain('friend')
  })
})
