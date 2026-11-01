import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { memoryEngine } from './engine'

describe('MemoryMigrationAndAccess', () => {
  beforeEach(async () => { await db.memories.clear() })

  it('new records have lastAccessedAt null', async () => {
    const m = await memoryEngine.create({ category: 'identity', content: 'x' })
    expect(m.lastAccessedAt).toBeNull()
  })

  it('get updates lastAccessedAt without changing updatedAt', async () => {
    const m = await memoryEngine.create({ category: 'identity', content: 'x' })
    const before = m.updatedAt
    await new Promise((r) => setTimeout(r, 5))
    const got = await memoryEngine.get(m.id)
    expect(got?.lastAccessedAt).not.toBeNull()
    expect(got?.updatedAt).toBe(before)
  })

  it('search updates lastAccessedAt', async () => {
    await memoryEngine.create({ category: 'identity', content: 'hello world' })
    const res = await memoryEngine.search('hello')
    expect(res[0].lastAccessedAt).not.toBeNull()
  })

  it('schema version is at least 3', () => {
    expect(db.verno).toBeGreaterThanOrEqual(3)
  })
})
