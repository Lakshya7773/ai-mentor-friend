// src/lib/proactivity/events.ts
import type { Commitment, Goal } from '../../types'

export type ProactivityEventType =
  | 'commitment_due'
  | 'goal_checkin'
  | 'user_reminder'
  | 'inactivity_checkin'
  | 'weekly_reflection'

export interface ProactivityEvent {
  id: string
  type: ProactivityEventType
  title: string
  description: string
  dueAt: number
  relatedId: string | null
}

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface EvaluationContext {
  now: number
  commitments: Commitment[]
  goals: Goal[]
  lastActivityAt: number | null
  inactivityThresholdMs?: number
  weeklyReflectionDay?: number // 0..6
}

const INACTIVITY_DEFAULT = 7 * 24 * 60 * 60 * 1000

export function evaluateProactivityEvents(ctx: EvaluationContext): ProactivityEvent[] {
  const events: ProactivityEvent[] = []
  const seen = new Set<string>()

  // Commitment due (pending and due <= now)
  for (const c of ctx.commitments) {
    if (c.status !== 'pending') continue
    if (c.dueAt === null) continue
    if (c.dueAt <= ctx.now) {
      const key = `commitment_due:${c.id}`
      if (seen.has(key)) continue
      seen.add(key)
      events.push({
        id: newId(),
        type: 'commitment_due',
        title: 'Commitment due',
        description: c.description,
        dueAt: c.dueAt,
        relatedId: c.id,
      })
    }
  }

  // Goal check-in: active goals with targetDate passed or milestones pending
  for (const g of ctx.goals) {
    if (g.status !== 'active') continue
    const due = g.targetDate !== null && g.targetDate <= ctx.now
    const hasPendingMilestones = g.milestones.some((m) => !m.done)
    if (due || (g.progress < 1 && hasPendingMilestones)) {
      const key = `goal_checkin:${g.id}`
      if (seen.has(key)) continue
      seen.add(key)
      events.push({
        id: newId(),
        type: 'goal_checkin',
        title: 'Goal check-in',
        description: g.title,
        dueAt: ctx.now,
        relatedId: g.id,
      })
    }
  }

  // Inactivity check-in
  const threshold = ctx.inactivityThresholdMs ?? INACTIVITY_DEFAULT
  if (ctx.lastActivityAt !== null && ctx.now - ctx.lastActivityAt >= threshold) {
    const key = 'inactivity_checkin'
    if (!seen.has(key)) {
      seen.add(key)
      events.push({
        id: newId(),
        type: 'inactivity_checkin',
        title: 'Inactivity check-in',
        description: 'It has been a while. How are things going?',
        dueAt: ctx.now,
        relatedId: null,
      })
    }
  }

  // Weekly reflection: if now's day matches configured day
  const day = new Date(ctx.now).getDay()
  if (ctx.weeklyReflectionDay !== undefined && day === ctx.weeklyReflectionDay) {
    const key = `weekly_reflection:${new Date(ctx.now).toISOString().slice(0, 10)}`
    if (!seen.has(key)) {
      seen.add(key)
      events.push({
        id: newId(),
        type: 'weekly_reflection',
        title: 'Weekly reflection',
        description: 'Time for your weekly review.',
        dueAt: ctx.now,
        relatedId: null,
      })
    }
  }

  return events
}
