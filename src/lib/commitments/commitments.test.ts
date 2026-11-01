import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../memory/db'
import { commitmentEngine } from '../commitments/engine'

describe('CommitmentEngine', () => {
  beforeEach(async () => { await db.commitments.clear() })

  it('creates commitment', async () => {
    const c = await commitmentEngine.create({ description: 'Call father' })
    expect(c.status).toBe('pending')
  })

  it('rejects empty', async () => {
    await expect(commitmentEngine.create({ description: '   ' })).rejects.toThrow()
  })

  it('completes', async () => {
    const c = await commitmentEngine.create({ description: 'x' })
    await commitmentEngine.complete(c.id)
    const got = await commitmentEngine.get(c.id)
    expect(got?.status).toBe('done')
  })

  it('missed with reason', async () => {
    const c = await commitmentEngine.create({ description: 'x' })
    await commitmentEngine.miss(c.id, 'forgot')
    const got = await commitmentEngine.get(c.id)
    expect(got?.status).toBe('missed')
    expect(got?.missedReason).toBe('forgot')
  })

  it('cancelled', async () => {
    const c = await commitmentEngine.create({ description: 'x' })
    await commitmentEngine.cancel(c.id)
    const got = await commitmentEngine.get(c.id)
    expect(got?.status).toBe('cancelled')
  })

  it('invalid transition throws', async () => {
    const c = await commitmentEngine.create({ description: 'x' })
    await commitmentEngine.complete(c.id)
    await expect(commitmentEngine.miss(c.id, 'r')).rejects.toThrow()
  })

  it('links to goal', async () => {
    const c = await commitmentEngine.create({ description: 'x', goalId: 'g1' })
    const got = await commitmentEngine.get(c.id)
    expect(got?.goalId).toBe('g1')
  })

  it('history preserved (record remains after miss)', async () => {
    const c = await commitmentEngine.create({ description: 'x' })
    await commitmentEngine.miss(c.id, 'r')
    const got = await commitmentEngine.get(c.id)
    expect(got).toBeDefined()
  })

  it('byGoal filters', async () => {
    await commitmentEngine.create({ description: 'a', goalId: 'g1' })
    await commitmentEngine.create({ description: 'b', goalId: 'g2' })
    const res = await commitmentEngine.byGoal('g1')
    expect(res.length).toBe(1)
  })
})
