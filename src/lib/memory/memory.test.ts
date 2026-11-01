import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { memoryEngine } from './engine'
import type { MemoryCategory } from '../../types'

const categories: MemoryCategory[] = ['identity', 'episodic', 'behavioural', 'commitment', 'relationship']

describe('MemoryEngine', () => {
  beforeEach(async () => {
    await db.memories.clear()
  })

  it('creates each of the five memory categories', async () => {
    for (const c of categories) {
      const m = await memoryEngine.create({ category: c, content: `test ${c}` })
      expect(m.category).toBe(c)
      expect(m.deleted).toBe(false)
    }
    const all = await memoryEngine.list()
    expect(all.length).toBe(5)
  })

  it('reads and searches memories', async () => {
    await memoryEngine.create({ category: 'identity', content: 'User prefers concise answers' })
    const found = await memoryEngine.search('concise')
    expect(found.length).toBe(1)
    expect(found[0].content).toContain('concise')
  })

  it('updates memories', async () => {
    const m = await memoryEngine.create({ category: 'identity', content: 'old' })
    await memoryEngine.update(m.id, { content: 'new' })
    const updated = await memoryEngine.get(m.id)
    expect(updated?.content).toBe('new')
    expect(updated?.corrected).toBe(true)
  })

  it('soft deletes', async () => {
    const m = await memoryEngine.create({ category: 'identity', content: 'x' })
    await memoryEngine.softDelete(m.id)
    const listed = await memoryEngine.list()
    expect(listed.find((r) => r.id === m.id)).toBeUndefined()
    const included = await memoryEngine.list(true)
    expect(included.find((r) => r.id === m.id)?.deleted).toBe(true)
  })

  it('hard deletes', async () => {
    const m = await memoryEngine.create({ category: 'identity', content: 'x' })
    await memoryEngine.hardDelete(m.id)
    const got = await memoryEngine.get(m.id)
    expect(got).toBeUndefined()
  })

  it('purges all', async () => {
    await memoryEngine.create({ category: 'identity', content: 'a' })
    await memoryEngine.purgeAll()
    expect((await memoryEngine.list(true)).length).toBe(0)
  })

  it('deduplicates by normalized content', async () => {
    await memoryEngine.create({ category: 'identity', content: 'Hello World' })
    const dup = await memoryEngine.findDuplicate('  hello world  ')
    expect(dup).toBeDefined()
    const none = await memoryEngine.findDuplicate('something else')
    expect(none).toBeUndefined()
  })

  it('handles invalid data gracefully (empty content trimmed)', async () => {
    const m = await memoryEngine.create({ category: 'identity', content: '   spaced   ' })
    expect(m.content).toBe('spaced')
  })

  it('records timestamps', async () => {
    const before = Date.now()
    const m = await memoryEngine.create({ category: 'identity', content: 't' })
    const after = Date.now()
    expect(m.createdAt).toBeGreaterThanOrEqual(before)
    expect(m.createdAt).toBeLessThanOrEqual(after)
    expect(m.updatedAt).toBe(m.createdAt)
  })

  it('byCategory filters correctly', async () => {
    await memoryEngine.create({ category: 'identity', content: 'i' })
    await memoryEngine.create({ category: 'episodic', content: 'e' })
    const ids = await memoryEngine.byCategory('identity')
    expect(ids.length).toBe(1)
    expect(ids[0].category).toBe('identity')
  })
})
