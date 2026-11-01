// src/lib/goals/engine.ts
import { db } from '../memory/db'
import type { Goal } from '../../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface CreateGoalInput {
  title: string
  description?: string
  targetDate?: number | null
  milestones?: { title: string; dueAt?: number | null }[]
}

const validTransitions: Record<string, string[]> = {
  active: ['completed', 'abandoned', 'archived'],
  completed: ['archived'],
  abandoned: ['archived'],
  archived: [],
}

export const goalEngine = {
  async create(input: CreateGoalInput): Promise<Goal> {
    const title = (input.title ?? '').trim()
    if (!title) throw new Error('Goal title cannot be empty')
    const now = Date.now()
    const goal: Goal = {
      id: newId(),
      title,
      description: (input.description ?? '').trim(),
      status: 'active',
      progress: 0,
      targetDate: input.targetDate ?? null,
      milestones: (input.milestones ?? []).map((m) => ({
        id: newId(),
        title: m.title.trim(),
        done: false,
        dueAt: m.dueAt ?? null,
      })),
      createdAt: now,
      updatedAt: now,
    }
    await db.goals.add(goal as any)
    return goal
  },

  async get(id: string): Promise<Goal | undefined> {
    return db.goals.get(id) as Promise<Goal | undefined>
  },

  async list(includeArchived = true): Promise<Goal[]> {
    const all = (await db.goals.toArray()) as Goal[]
    return includeArchived ? all : all.filter((g) => g.status !== 'archived')
  },

  async update(id: string, patch: Partial<Pick<Goal, 'title' | 'description' | 'targetDate' | 'progress'>>): Promise<void> {
    const now = Date.now()
    const cur = await db.goals.get(id) as Goal | undefined
    if (!cur) throw new Error(`Goal not found: ${id}`)
    const nextProgress = patch.progress !== undefined ? Math.min(1, Math.max(0, patch.progress)) : cur.progress
    await db.goals.update(id, { ...patch, progress: nextProgress, updatedAt: now } as any)
  },

  async setStatus(id: string, status: Goal['status']): Promise<void> {
    const cur = await db.goals.get(id) as Goal | undefined
    if (!cur) throw new Error(`Goal not found: ${id}`)
    if (cur.status === status) return
    if (!validTransitions[cur.status]?.includes(status)) {
      throw new Error(`Invalid transition: ${cur.status} -> ${status}`)
    }
    const now = Date.now()
    const patch: any = { status, updatedAt: now }
    if (status === 'completed') { patch.progress = 1 }
    await db.goals.update(id, patch)
  },

  async complete(id: string): Promise<void> {
    await this.setStatus(id, 'completed')
  },

  async abandon(id: string): Promise<void> {
    await this.setStatus(id, 'abandoned')
  },

  async archive(id: string): Promise<void> {
    await this.setStatus(id, 'archived')
  },

  async toggleMilestone(goalId: string, milestoneId: string, done: boolean): Promise<void> {
    const cur = await db.goals.get(goalId) as Goal | undefined
    if (!cur) throw new Error(`Goal not found: ${goalId}`)
    const milestones = cur.milestones.map((m) => m.id === milestoneId ? { ...m, done } : m)
    const doneCount = milestones.filter((m) => m.done).length
    const progress = milestones.length ? doneCount / milestones.length : cur.progress
    const now = Date.now()
    await db.goals.update(goalId, { milestones, progress, updatedAt: now } as any)
  },

  async hardDelete(id: string): Promise<void> {
    await db.goals.delete(id)
  },
}
