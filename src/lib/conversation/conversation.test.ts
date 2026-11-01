import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../memory/db'
import { conversationEngine } from './engine'

describe('ConversationEngine', () => {
  beforeEach(async () => {
    await db.messages.clear()
    await db.conversations.clear()
  })

  it('creates and retrieves a conversation', async () => {
    const c = await conversationEngine.create({ title: 'Test' })
    expect(c.title).toBe('Test')
    const got = await conversationEngine.get(c.id)
    expect(got?.id).toBe(c.id)
  })

  it('lists conversations excluding deleted', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await conversationEngine.softDelete(c.id)
    const list = await conversationEngine.list()
    expect(list.find((x) => x.id === c.id)).toBeUndefined()
    const all = await conversationEngine.list(true)
    expect(all.find((x) => x.id === c.id)?.status).toBe('deleted')
  })

  it('updates metadata', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await conversationEngine.updateMetadata(c.id, { title: 'B' })
    const got = await conversationEngine.get(c.id)
    expect(got?.title).toBe('B')
  })

  it('archives', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await conversationEngine.archive(c.id)
    const got = await conversationEngine.get(c.id)
    expect(got?.status).toBe('archived')
  })

  it('adds messages and orders them', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await conversationEngine.addMessage({ conversationId: c.id, role: 'user', content: 'hi' })
    await conversationEngine.addMessage({ conversationId: c.id, role: 'assistant', content: 'hello' })
    const msgs = await conversationEngine.getMessages(c.id)
    expect(msgs.length).toBe(2)
    expect(msgs[0].role).toBe('user')
    expect(msgs[1].role).toBe('assistant')
  })

  it('rejects empty message content', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await expect(conversationEngine.addMessage({ conversationId: c.id, role: 'user', content: '   ' })).rejects.toThrow()
  })

  it('rejects message for unknown conversation', async () => {
    await expect(conversationEngine.addMessage({ conversationId: 'nope', role: 'user', content: 'hi' })).rejects.toThrow()
  })

  it('hard delete removes messages', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await conversationEngine.addMessage({ conversationId: c.id, role: 'user', content: 'hi' })
    await conversationEngine.hardDelete(c.id)
    const got = await conversationEngine.get(c.id)
    expect(got).toBeUndefined()
    const msgs = await conversationEngine.getMessages(c.id)
    expect(msgs.length).toBe(0)
  })

  it('does not affect other conversations on delete', async () => {
    const a = await conversationEngine.create({ title: 'A' })
    const b = await conversationEngine.create({ title: 'B' })
    await conversationEngine.addMessage({ conversationId: a.id, role: 'user', content: 'a-msg' })
    await conversationEngine.addMessage({ conversationId: b.id, role: 'user', content: 'b-msg' })
    await conversationEngine.hardDelete(a.id)
    const bMsgs = await conversationEngine.getMessages(b.id)
    expect(bMsgs.length).toBe(1)
    expect(bMsgs[0].content).toBe('b-msg')
  })

  it('soft delete keeps messages', async () => {
    const c = await conversationEngine.create({ title: 'A' })
    await conversationEngine.addMessage({ conversationId: c.id, role: 'user', content: 'hi' })
    await conversationEngine.softDelete(c.id)
    const msgs = await conversationEngine.getMessages(c.id)
    expect(msgs.length).toBe(1)
  })
})
