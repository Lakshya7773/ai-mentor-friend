import { describe, it, expect } from 'vitest'
import { runConversationTurn } from './orchestrator'
import { MockModelAdapter } from '../model-adapter/mock'
import { conversationEngine } from './engine'

describe('Orchestrator empty-response protection', () => {
  it('does not persist blank assistant message', async () => {
    const conv = await conversationEngine.create({})
    const adapter = new MockModelAdapter()
    // force empty by monkeypatching generate
    adapter.generate = async () => ({ content: '', finishReason: 'length' as const, usage: { promptTokens: 1, completionTokens: 0 } })
    const res = await runConversationTurn(conv.id, 'hello', adapter as any)
    expect(res.status).toBe('empty')
    expect(res.assistantMessage).toBeUndefined()
    const msgs = await conversationEngine.getMessages(conv.id)
    // only user message persisted
    expect(msgs.filter(m => m.role === 'assistant').length).toBe(0)
  })

  it('persists successful response', async () => {
    const conv = await conversationEngine.create({})
    const adapter = new MockModelAdapter()
    const res = await runConversationTurn(conv.id, 'hello', adapter as any)
    expect(res.status).toBe('success')
    expect(res.assistantMessage).toBeDefined()
  })
})
