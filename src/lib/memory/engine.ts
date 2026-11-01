// src/lib/memory/engine.ts
import { db } from './db'
import type { MemoryRecord, MemoryCategory, Sensitivity } from '../../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface CreateMemoryInput {
  category: MemoryCategory
  content: string
  sourceConversationId?: string | null
  confidence?: number
  importance?: number
  sensitivity?: Sensitivity
  reviewAt?: number | null
  expiryAt?: number | null
}

export const memoryEngine = {
  async create(input: CreateMemoryInput): Promise<MemoryRecord> {
    const now = Date.now()
    const rec: MemoryRecord = {
      id: newId(),
      category: input.category,
      content: input.content.trim(),
      sourceConversationId: input.sourceConversationId ?? null,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: null,
      confidence: input.confidence ?? 0.7,
      importance: input.importance ?? 0.5,
      sensitivity: input.sensitivity ?? 'low',
      reviewAt: input.reviewAt ?? null,
      expiryAt: input.expiryAt ?? null,
      corrected: false,
      deleted: false,
    }
    await db.memories.add(rec)
    return rec
  },

  async get(id: string): Promise<MemoryRecord | undefined> {
    const rec = await db.memories.get(id)
    if (rec && !rec.deleted) {
      const now = Date.now()
      await db.memories.update(id, { lastAccessedAt: now })
      rec.lastAccessedAt = now
    }
    return rec
  },

  async list(includeDeleted = false): Promise<MemoryRecord[]> {
    const all = await db.memories.toArray()
    return includeDeleted ? all : all.filter((m) => !m.deleted)
  },

  async byCategory(category: MemoryCategory): Promise<MemoryRecord[]> {
    return db.memories.where('category').equals(category).and((m) => !m.deleted).toArray()
  },

  async update(id: string, patch: Partial<MemoryRecord>): Promise<void> {
    await db.memories.update(id, { ...patch, updatedAt: Date.now(), corrected: true })
  },

  async softDelete(id: string): Promise<void> {
    await db.memories.update(id, { deleted: true, updatedAt: Date.now() })
  },

  async hardDelete(id: string): Promise<void> {
    await db.memories.delete(id)
  },

  async purgeAll(): Promise<void> {
    await db.memories.clear()
  },

  async search(query: string): Promise<MemoryRecord[]> {
    const q = query.toLowerCase()
    const all = await db.memories.filter((m) => !m.deleted).toArray()
    const res = all.filter((m) => m.content.toLowerCase().includes(q))
    const now = Date.now()
    await Promise.all(res.map((m) => db.memories.update(m.id, { lastAccessedAt: now })))
    return res.map((m) => ({ ...m, lastAccessedAt: now }))
  },

  // Dedup: simple normalized-content equality check
  async findDuplicate(content: string): Promise<MemoryRecord | undefined> {
    const norm = content.trim().toLowerCase()
    const all = await db.memories.filter((m) => !m.deleted).toArray()
    return all.find((m) => m.content.trim().toLowerCase() === norm)
  },
}
