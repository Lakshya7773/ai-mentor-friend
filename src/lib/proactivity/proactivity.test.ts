import { describe, it, expect } from 'vitest'
import { evaluateProactivityEvents } from './events'
import type { Commitment, Goal } from '../../types'

describe('ProactivityEvents', () => {
  const now = 1000000

  it('detects due commitment', () => {
    const commitments: Commitment[] = [{ id: 'c1', description: 'x', dueAt: now - 1, status: 'pending', goalId: null, missedReason: null, createdAt: now - 100 }]
    const ev = evaluateProactivityEvents({ now, commitments, goals: [], lastActivityAt: now })
    expect(ev.some((e) => e.type === 'commitment_due')).toBe(true)
  })

  it('no duplicate commitment events', () => {
    const commitments: Commitment[] = [{ id: 'c1', description: 'x', dueAt: now - 1, status: 'pending', goalId: null, missedReason: null, createdAt: now - 100 }]
    const ev = evaluateProactivityEvents({ now, commitments, goals: [], lastActivityAt: now })
    const due = ev.filter((e) => e.type === 'commitment_due')
    expect(due.length).toBe(1)
  })

  it('detects inactivity', () => {
    const ev = evaluateProactivityEvents({ now, commitments: [], goals: [], lastActivityAt: now - 10 * 24 * 60 * 60 * 1000 })
    expect(ev.some((e) => e.type === 'inactivity_checkin')).toBe(true)
  })

  it('no inactivity when recent', () => {
    const ev = evaluateProactivityEvents({ now, commitments: [], goals: [], lastActivityAt: now - 1000 })
    expect(ev.some((e) => e.type === 'inactivity_checkin')).toBe(false)
  })

  it('detects goal checkin for active goal with pending milestone', () => {
    const goals: Goal[] = [{ id: 'g1', title: 'G', description: '', status: 'active', progress: 0, targetDate: null, milestones: [{ id: 'm1', title: 'm', done: false, dueAt: null }], createdAt: now, updatedAt: now }]
    const ev = evaluateProactivityEvents({ now, commitments: [], goals, lastActivityAt: now })
    expect(ev.some((e) => e.type === 'goal_checkin')).toBe(true)
  })

  it('skips completed goals', () => {
    const goals: Goal[] = [{ id: 'g1', title: 'G', description: '', status: 'completed', progress: 1, targetDate: null, milestones: [], createdAt: now, updatedAt: now }]
    const ev = evaluateProactivityEvents({ now, commitments: [], goals, lastActivityAt: now })
    expect(ev.some((e) => e.type === 'goal_checkin')).toBe(false)
  })
})
