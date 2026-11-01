// src/lib/memory/db.ts
import Dexie, { type Table } from 'dexie'
import type { MemoryRecord } from '../../types'

export class MentorDB extends Dexie {
  memories!: Table<MemoryRecord, string>
  conversations!: Table<{ id: string; title: string; status: string; summaryRef: string | null; createdAt: number; updatedAt: number; lastActivityAt: number }, string>
  messages!: Table<{ id: string; conversationId: string; role: string; content: string; createdAt: number; metadata: Record<string, unknown> | null }, string>
  goals!: Table<any, string>
  commitments!: Table<any, string>
  journal!: Table<any, string>
  profile!: Table<any, string>

  constructor() {
    super('ai-mentor-friend')
    this.version(1).stores({
      memories: 'id, category, createdAt, sensitivity, deleted',
      conversations: 'id, updatedAt',
      messages: 'id, conversationId, createdAt',
      goals: 'id, status',
      journal: 'id, kind, createdAt',
      profile: 'id',
    })
    this.version(2).stores({
      memories: 'id, category, createdAt, sensitivity, deleted, lastAccessedAt',
    }).upgrade(async (tx) => {
      await tx.table('memories').toCollection().modify((m: any) => {
        if (m.lastAccessedAt === undefined) m.lastAccessedAt = null
      })
    })
    this.version(3).stores({
      commitments: 'id, status, dueAt, goalId',
    })
  }
}

export const db = new MentorDB()
