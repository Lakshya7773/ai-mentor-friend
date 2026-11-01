import { describe, it, expect } from 'vitest'
import { createMockAdapter } from './mock'
import { ModelRegistry } from './registry'

describe('MockModelAdapter', () => {
  it('reports capabilities', () => {
    const a = createMockAdapter()
    expect(a.capabilities.textGeneration).toBe(true)
    expect(a.capabilities.structuredJson).toBe(true)
    expect(a.capabilities.toolCalling).toBe(false)
  })

  it('is available', async () => {
    const a = createMockAdapter()
    expect(await a.isAvailable()).toBe(true)
  })

  it('returns deterministic response containing input', async () => {
    const a = createMockAdapter()
    const r1 = await a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hello' }] })
    const r2 = await a.generate({ systemPrompt: 's', messages: [{ role: 'user', content: 'hello' }] })
    expect(r1.content).toBe(r2.content)
    expect(r1.content).toContain('hello')
    expect(r1.finishReason).toBe('stop')
  })

  it('handles empty messages', async () => {
    const a = createMockAdapter()
    const r = await a.generate({ systemPrompt: 's', messages: [] })
    expect(r.content).toContain('mock')
    expect(r.finishReason).toBe('stop')
  })
})
describe('ModelRegistry', () => {
  it('registers and lists adapters', () => {
    const reg = new ModelRegistry()
    const a = createMockAdapter()
    reg.register(a)
    expect(reg.list().length).toBe(1)
    expect(reg.get(a.id)).toBe(a)
  })

  it('switches active model', () => {
    const reg = new ModelRegistry()
    const a = createMockAdapter()
    reg.register(a)
    reg.setActive(a.id)
    expect(reg.getActive().id).toBe(a.id)
  })

  it('throws on unknown adapter switch', () => {
    const reg = new ModelRegistry()
    const a = createMockAdapter()
    reg.register(a)
    expect(() => reg.setActive('nope')).toThrow()
  })

  it('throws when no active adapter', () => {
    const reg = new ModelRegistry()
    expect(() => reg.getActive()).toThrow()
  })
})
