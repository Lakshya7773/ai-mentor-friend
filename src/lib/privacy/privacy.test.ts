import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../memory/db'
import { exportAllData, deleteAllData } from './export'
import { memoryEngine } from '../memory/engine'
import { conversationEngine } from '../conversation/engine'
import { goalEngine } from '../goals/engine'

describe('PrivacyExportDelete', () => {
  beforeEach(async () => {
    await db.memories.clear()
    await db.conversations.clear()
    await db.messages.clear()
    await db.goals.clear()
    await db.commitments.clear()
    await db.journal.clear()
  })

  it('export includes all data', async () => {
    await memoryEngine.create({ category: 'identity', content: 'm' })
    await conversationEngine.create({ title: 'c' })
    await goalEngine.create({ title: 'g' })
    const data: any = await exportAllData()
    expect(data.memories.length).toBe(1)
    expect(data.conversations.length).toBe(1)
    expect(data.goals.length).toBe(1)
    expect(data.version).toBe('1.0')
  })

  it('deleteAll removes everything', async () => {
    await memoryEngine.create({ category: 'identity', content: 'm' })
    await conversationEngine.create({ title: 'c' })
    await goalEngine.create({ title: 'g' })
    await deleteAllData()
    expect((await memoryEngine.list(true)).length).toBe(0)
    expect((await conversationEngine.list(true)).length).toBe(0)
    expect((await goalEngine.list()).length).toBe(0)
  })
})
