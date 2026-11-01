import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SarvamModelAdapter } from './sarvam'

describe('SarvamAdapter', () => {
  const origFetch = globalThis.fetch

  beforeEach(() => {
    const proc = (globalThis as any).process; if (proc?.env) delete proc.env.SARVAM_API_KEY
  })

  afterEach(() => {
    globalThis.fetch = origFetch
  })

  it('reports unavailable without key', async () => {
    const a = new SarvamModelAdapter({})
    expect(await a.isAvailable()).toBe(false)
  })

  it('throws on missing credentials', async () => {
    const a = new SarvamModelAdapter({})
    await expect(a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hi' }] })).rejects.toThrow(/credentials missing/)
  })

  it('enforces input limit', async () => {
    const a = new SarvamModelAdapter({ apiKey: 'test-key', maxInputChars: 5 })
    await expect(a.generate({ systemPrompt: 'hello world', messages: [] })).rejects.toThrow(/exceeds maxInputChars/)
  })

  it('parses successful response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hi back' }, finish_reason: 'stop' }], usage: { prompt_tokens: 5, completion_tokens: 2 } }),
      text: async () => '',
    }) as any
    const a = new SarvamModelAdapter({ apiKey: 'test-key' })
    const r = await a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hi' }] })
    expect(r.content).toBe('hi back')
    expect(r.usage?.promptTokens).toBe(5)
    expect(r.usage?.completionTokens).toBe(2)
  })

  it('handles HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
      json: async () => ({}),
    }) as any
    const a = new SarvamModelAdapter({ apiKey: 'test-key' })
    await expect(a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hi' }] })).rejects.toThrow(/401/)
  })
})

describe('SarvamReasoningEffort', () => {
  afterEach(() => { globalThis.fetch = (globalThis as any).__origFetch || globalThis.fetch })

  it('sends reasoning_effort when configured', async () => {
    const calls: any[] = []
    globalThis.fetch = (async (_u: any, init: any) => {
      calls.push(JSON.parse(init.body))
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), text: async () => '' }
    }) as any
    const a = new SarvamModelAdapter({ apiKey: 'k', reasoningEffort: 'low' })
    await a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hi' }] })
    expect(calls[0].reasoning_effort).toBe('low')
  })

  it('sends reasoning_effort: null when explicitly configured', async () => {
    const calls: any[] = []
    globalThis.fetch = (async (_u: any, init: any) => {
      calls.push(JSON.parse(init.body))
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), text: async () => '' }
    }) as any
    const a = new SarvamModelAdapter({ apiKey: 'k', reasoningEffort: null })
    await a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hi' }] })
    expect(calls[0].reasoning_effort).toBeNull()
    // also per-request null
    const calls2: any[] = []
    globalThis.fetch = (async (_u: any, init: any) => {
      calls2.push(JSON.parse(init.body))
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), text: async () => '' }
    }) as any
    const a2 = new SarvamModelAdapter({ apiKey: 'k' })
    await a2.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hi' }], reasoningEffort: null })
    expect(calls2[0].reasoning_effort).toBeNull()
  })
})
