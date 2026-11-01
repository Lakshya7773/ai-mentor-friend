// src/lib/journal/engine.ts
import { db } from '../memory/db'
import type { JournalEntry } from '../../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface CreateJournalInput {
  kind?: JournalEntry['kind']
  content: string
  tags?: string[]
  mood?: string | null
}

export const journalEngine = {
  async create(input: CreateJournalInput): Promise<JournalEntry> {
    const content = (input.content ?? '').trim()
    if (!content) throw new Error('Journal content cannot be empty')
    const now = Date.now()
    const entry: JournalEntry = {
      id: newId(),
      kind: input.kind ?? 'freeform',
      content,
      tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
      mood: input.mood ?? null,
      createdAt: now,
      updatedAt: now,
    }
    await db.journal.add(entry as any)
    return entry
  },

  async get(id: string): Promise<JournalEntry | undefined> {
    return db.journal.get(id) as Promise<JournalEntry | undefined>
  },

  async list(): Promise<JournalEntry[]> {
    const all = (await db.journal.toArray()) as JournalEntry[]
    return all.sort((a, b) => b.createdAt - a.createdAt)
  },

  async update(id: string, patch: Partial<Pick<JournalEntry, 'content' | 'tags' | 'mood' | 'kind'>>): Promise<void> {
    const cur = await db.journal.get(id) as JournalEntry | undefined
    if (!cur) throw new Error(`Journal entry not found: ${id}`)
    const now = Date.now()
    const next: any = { updatedAt: now }
    if (patch.content !== undefined) next.content = patch.content.trim()
    if (patch.tags !== undefined) next.tags = patch.tags.map((t) => t.trim()).filter(Boolean)
    if (patch.mood !== undefined) next.mood = patch.mood
    if (patch.kind !== undefined) next.kind = patch.kind
    await db.journal.update(id, next)
  },

  async delete(id: string): Promise<void> {
    await db.journal.delete(id)
  },
}
