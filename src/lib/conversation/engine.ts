// src/lib/conversation/engine.ts
import { db } from '../memory/db'
import type { Conversation, Message } from '../../types'

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface CreateConversationInput {
  title?: string
}

export interface AddMessageInput {
  conversationId: string
  role: Message['role']
  content: string
  metadata?: Record<string, unknown> | null
}

export const conversationEngine = {
  async create(input: CreateConversationInput = {}): Promise<Conversation> {
    const now = Date.now()
    const conv: Conversation = {
      id: newId(),
      title: (input.title ?? 'New conversation').trim() || 'New conversation',
      status: 'active',
      summaryRef: null,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    }
    await db.conversations.add(conv as any)
    return conv
  },

  async get(id: string): Promise<Conversation | undefined> {
    const c = await db.conversations.get(id)
    return c as Conversation | undefined
  },

  async list(includeDeleted = false): Promise<Conversation[]> {
    const all = (await db.conversations.toArray()) as Conversation[]
    return includeDeleted ? all : all.filter((c) => c.status !== 'deleted')
  },

  async updateMetadata(id: string, patch: Partial<Pick<Conversation, 'title' | 'summaryRef'>>): Promise<void> {
    const now = Date.now()
    await db.conversations.update(id, { ...patch, updatedAt: now } as any)
  },

  async touch(id: string): Promise<void> {
    const now = Date.now()
    await db.conversations.update(id, { updatedAt: now, lastActivityAt: now } as any)
  },

  async archive(id: string): Promise<void> {
    const now = Date.now()
    await db.conversations.update(id, { status: 'archived', updatedAt: now } as any)
  },

  async softDelete(id: string): Promise<void> {
    const now = Date.now()
    await db.conversations.update(id, { status: 'deleted', updatedAt: now } as any)
  },

  async hardDelete(id: string): Promise<void> {
    await db.messages.where('conversationId').equals(id).delete()
    await db.conversations.delete(id)
  },

  async addMessage(input: AddMessageInput): Promise<Message> {
    const conv = await db.conversations.get(input.conversationId)
    if (!conv) throw new Error(`Conversation not found: ${input.conversationId}`)
    const content = (input.content ?? '').trim()
    if (!content) throw new Error('Message content cannot be empty')
    const now = Date.now()
    const msg: Message = {
      id: newId(),
      conversationId: input.conversationId,
      role: input.role,
      content,
      createdAt: now,
      metadata: input.metadata ?? null,
    }
    await db.messages.add(msg as any)
    await this.touch(input.conversationId)
    return msg
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const msgs = (await db.messages.where('conversationId').equals(conversationId).toArray()) as Message[]
    // stable chronological ordering; tie-break by id
    return msgs.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  },

  async messageCount(conversationId: string): Promise<number> {
    return db.messages.where('conversationId').equals(conversationId).count()
  },
}
