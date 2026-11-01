import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../memory/db'
import { goalEngine } from './engine'

describe('GoalEngine', () => {
  beforeEach(async () => { await db.goals.clear() })

  it('creates a goal', async () => {
    const g = await goalEngine.create({ title: 'Learn TS', milestones: [{ title: 'Read docs' }] })
    expect(g.status).toBe('active')
    expect(g.milestones.length).toBe(1)
  })

  it('rejects empty title', async () => {
    await expect(goalEngine.create({ title: '   ' })).rejects.toThrow()
  })

  it('updates metadata', async () => {
    const g = await goalEngine.create({ title: 'G' })
    await goalEngine.update(g.id, { title: 'G2', progress: 0.5 })
    const got = await goalEngine.get(g.id)
    expect(got?.title).toBe('G2')
    expect(got?.progress).toBe(0.5)
  })

  it('completes goal sets progress 1', async () => {
    const g = await goalEngine.create({ title: 'G' })
    await goalEngine.complete(g.id)
    const got = await goalEngine.get(g.id)
    expect(got?.status).toBe('completed')
    expect(got?.progress).toBe(1)
  })

  it('invalid transition throws', async () => {
    const g = await goalEngine.create({ title: 'G' })
    await goalEngine.complete(g.id)
    await expect(goalEngine.abandon(g.id)).rejects.toThrow()
  })

  it('toggles milestone updates progress', async () => {
    const g = await goalEngine.create({ title: 'G', milestones: [{ title: 'm1' }, { title: 'm2' }] })
    await goalEngine.toggleMilestone(g.id, g.milestones[0].id, true)
    const got = await goalEngine.get(g.id)
    expect(got?.progress).toBe(0.5)
  })

  it('archives and abandons', async () => {
    const g = await goalEngine.create({ title: 'G' })
    await goalEngine.abandon(g.id)
    let got = await goalEngine.get(g.id)
    expect(got?.status).toBe('abandoned')
    // abandoned -> archived allowed
    await goalEngine.archive(g.id)
    got = await goalEngine.get(g.id)
    expect(got?.status).toBe('archived')
  })

  it('hard delete', async () => {
    const g = await goalEngine.create({ title: 'G' })
    await goalEngine.hardDelete(g.id)
    expect(await goalEngine.get(g.id)).toBeUndefined()
  })

  it('isolation between goals', async () => {
    const a = await goalEngine.create({ title: 'A' })
    const b = await goalEngine.create({ title: 'B' })
    await goalEngine.hardDelete(a.id)
    expect(await goalEngine.get(b.id)).toBeDefined()
  })
})
