// src/lib/privacy/export.ts
import { conversationEngine } from '../conversation/engine'
import { memoryEngine } from '../memory/engine'
import { goalEngine } from '../goals/engine'
import { commitmentEngine } from '../commitments/engine'
import { journalEngine } from '../journal/engine'

export async function exportAllData(): Promise<Record<string, unknown>> {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    memories: await memoryEngine.list(true),
    conversations: await conversationEngine.list(true),
    goals: await goalEngine.list(),
    commitments: await commitmentEngine.list(),
    journal: await journalEngine.list(),
  }
}

export async function deleteAllData(): Promise<void> {
  await memoryEngine.purgeAll()
  const cs = await conversationEngine.list(true)
  for (const c of cs) await conversationEngine.hardDelete(c.id)
  const gs = await goalEngine.list()
  for (const g of gs) await goalEngine.hardDelete(g.id)
  const coms = await commitmentEngine.list()
  for (const c of coms) await commitmentEngine.hardDelete(c.id)
  const js = await journalEngine.list()
  for (const j of js) await journalEngine.delete(j.id)
}
