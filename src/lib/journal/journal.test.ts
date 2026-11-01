import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../memory/db'
import { journalEngine } from './engine'

describe('JournalEngine', () => {
  beforeEach(async () => { await db.journal.clear() })

  it('creates entry', async () => {
    const e = await journalEngine.create({ content: 'Today I reflected' })
    expect(e.content).toBe('Today I reflected')
    expect(e.tags).toEqual([])
  })

  it('rejects empty', async () => {
    await expect(journalEngine.create({ content: '   ' })).rejects.toThrow()
  })

  it('updates entry', async () => {
    const e = await journalEngine.create({ content: 'x' })
    await journalEngine.update(e.id, { content: 'y', tags: ['t1'], mood: 'calm' })
    const got = await journalEngine.get(e.id)
    expect(got?.content).toBe('y')
    expect(got?.tags).toEqual(['t1'])
    expect(got?.mood).toBe('calm')
  })

  it('deletes entry', async () => {
    const e = await journalEngine.create({ content: 'x' })
    await journalEngine.delete(e.id)
    expect(await journalEngine.get(e.id)).toBeUndefined()
  })

  it('lists sorted by created desc', async () => {
    await journalEngine.create({ content: 'a' })
    await new Promise((r) => setTimeout(r, 5))
    const b = await journalEngine.create({ content: 'b' })
    const list = await journalEngine.list()
    expect(list[0].id).toBe(b.id)
  })
})
