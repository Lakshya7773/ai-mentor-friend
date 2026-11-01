import { describe, it, expect } from 'vitest'
import { resolveStrategy, defaultStrategy } from './strategy'
import type { InteractionMode } from './types'

describe('RuntimeStrategy', () => {
  const modes: InteractionMode[] = ['listening', 'accountability', 'mentor', 'deep-analysis']
  it('each mode resolves to explicit strategy', () => {
    for (const m of modes) {
      const s = resolveStrategy(m)
      expect(s.mode).toBe(m)
      expect(typeof s.maxGenerationTokens).toBe('number')
    }
  })
  it('listening disables reasoning (hypothesis)', () => {
    expect(resolveStrategy('listening').reasoningEffort).toBeNull()
  })
  it('mentor uses null reasoning (evidence-based)', () => {
    expect(resolveStrategy('mentor').reasoningEffort).toBeNull()
    expect(resolveStrategy('mentor').maxGenerationTokens).toBe(512)
  })
  it('overrides apply', () => {
    const s = resolveStrategy('mentor', { maxGenerationTokens: 100, reasoningEffort: 'high' })
    expect(s.maxGenerationTokens).toBe(100)
    expect(s.reasoningEffort).toBe('high')
  })
  it('defaultStrategy immutable-ish copy', () => {
    const a = defaultStrategy('mentor')
    const b = defaultStrategy('mentor')
    expect(a).not.toBe(b)
  })
})
