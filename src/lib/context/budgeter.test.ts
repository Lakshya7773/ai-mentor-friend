import { describe, it, expect } from 'vitest'
import { estimateTokens, fitToBudget } from './budgeter'

describe('ContextBudgeter', () => {
  it('estimates tokens', () => {
    expect(estimateTokens('')).toBe(0)
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('a'.repeat(100))).toBe(25)
  })

  it('fits items within budget by priority', () => {
    const items = [
      { id: 'a', content: 'low', tokens: 10, priority: 0.1 },
      { id: 'b', content: 'high', tokens: 10, priority: 0.9 },
      { id: 'c', content: 'mid', tokens: 10, priority: 0.5 },
    ]
    const r = fitToBudget(items, 20)
    expect(r.included.length).toBe(2)
    expect(r.included.map((i) => i.id)).toContain('b')
    expect(r.usedTokens).toBe(20)
  })

  it('excludes items that do not fit', () => {
    const items = [{ id: 'a', content: 'big', tokens: 100, priority: 1 }]
    const r = fitToBudget(items, 10)
    expect(r.included.length).toBe(0)
    expect(r.excluded.length).toBe(1)
  })

  it('handles empty list', () => {
    const r = fitToBudget([], 10)
    expect(r.included.length).toBe(0)
    expect(r.usedTokens).toBe(0)
  })
})
