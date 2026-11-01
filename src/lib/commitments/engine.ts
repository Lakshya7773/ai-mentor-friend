// src/lib/commitments/engine.ts
import { db } from '../memory/db'
import type { Commitment } from '../../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface CreateCommitmentInput {
  description: string
  dueAt?: number | null
  goalId?: string | null
}

export const commitmentEngine = {
  async create(input: CreateCommitmentInput): Promise<Commitment> {
    const desc = (input.description ?? '').trim()
    if (!desc) throw new Error('Commitment description cannot be empty')
    const now = Date.now()
    const c: Commitment = {
      id: newId(),
      goalId: input.goalId ?? null,
      description: desc,
      dueAt: input.dueAt ?? null,
      status: 'pending',
      missedReason: null,
      createdAt: now,
    }
    await db.commitments.add(c as any)
    return c
  },

  async get(id: string): Promise<Commitment | undefined> {
    return db.commitments.get(id) as Promise<Commitment | undefined>
  },

  async list(): Promise<Commitment[]> {
    return db.commitments.toArray() as Promise<Commitment[]>
  },

  async byGoal(goalId: string): Promise<Commitment[]> {
    return db.commitments.where('goalId').equals(goalId).toArray() as Promise<Commitment[]>
  },

  async complete(id: string): Promise<void> {
    const cur = await db.commitments.get(id) as Commitment | undefined
    if (!cur) throw new Error(`Commitment not found: ${id}`)
    if (cur.status !== 'pending') throw new Error(`Cannot complete from status: ${cur.status}`)
    await db.commitments.update(id, { status: 'done' } as any)
  },

  async miss(id: string, reason: string): Promise<void> {
    const cur = await db.commitments.get(id) as Commitment | undefined
    if (!cur) throw new Error(`Commitment not found: ${id}`)
    if (cur.status !== 'pending') throw new Error(`Cannot mark missed from status: ${cur.status}`)
    await db.commitments.update(id, { status: 'missed', missedReason: reason.trim() || null } as any)
  },

  async cancel(id: string): Promise<void> {
    const cur = await db.commitments.get(id) as Commitment | undefined
    if (!cur) throw new Error(`Commitment not found: ${id}`)
    if (cur.status !== 'pending') throw new Error(`Cannot cancel from status: ${cur.status}`)
    await db.commitments.update(id, { status: 'cancelled', missedReason: 'cancelled' } as any)
    // Note: cancelled tracked via missedReason='cancelled' for history preservation
  },

  async hardDelete(id: string): Promise<void> {
    await db.commitments.delete(id)
  },
}
