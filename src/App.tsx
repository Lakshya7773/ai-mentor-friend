import { useEffect, useState } from 'react'
import { conversationEngine } from './lib/conversation/engine'
import { runConversationTurn } from './lib/conversation/orchestrator'
import { memoryEngine } from './lib/memory/engine'
import { goalEngine } from './lib/goals/engine'
import { commitmentEngine } from './lib/commitments/engine'
import { journalEngine } from './lib/journal/engine'
import { createMockAdapter } from './lib/model-adapter/mock'
import { evaluateProactivityEvents } from './lib/proactivity/events'
import { exportAllData, deleteAllData } from './lib/privacy/export'
import type { Conversation, Goal, Commitment, JournalEntry, MemoryRecord } from './types'

const adapter = createMockAdapter()

type Tab = 'chat' | 'goals' | 'journal' | 'memory' | 'privacy'

export default function App() {
  const [tab, setTab] = useState<Tab>('chat')
  const [convs, setConvs] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<{ id: string; role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [newCommitment, setNewCommitment] = useState('')
  const [newJournal, setNewJournal] = useState('')
  const [exportData, setExportData] = useState<string | null>(null)

  async function refresh() {
    setConvs(await conversationEngine.list())
    setGoals(await goalEngine.list())
    setCommitments(await commitmentEngine.list())
    setJournals(await journalEngine.list())
    setMemories(await memoryEngine.list())
  }

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    if (activeConv) {
      conversationEngine.getMessages(activeConv).then((m) => setMsgs(m.map((x) => ({ id: x.id, role: x.role, content: x.content }))))
    } else {
      setMsgs([])
    }
  }, [activeConv])

  async function newConv() {
    const c = await conversationEngine.create({ title: 'New conversation' })
    await refresh()
    setActiveConv(c.id)
  }

  async function send() {
    if (!activeConv || !input.trim()) return
    setLoading(true)
    try {
      await runConversationTurn(activeConv, input, adapter)
      setInput('')
      const m = await conversationEngine.getMessages(activeConv)
      setMsgs(m.map((x) => ({ id: x.id, role: x.role, content: x.content })))
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  async function addGoal() {
    if (!newGoal.trim()) return
    await goalEngine.create({ title: newGoal })
    setNewGoal('')
    await refresh()
  }

  async function addCommitment() {
    if (!newCommitment.trim()) return
    await commitmentEngine.create({ description: newCommitment })
    setNewCommitment('')
    await refresh()
  }

  async function addJournal() {
    if (!newJournal.trim()) return
    await journalEngine.create({ content: newJournal })
    setNewJournal('')
    await refresh()
  }

  async function doExport() {
    const data = await exportAllData()
    setExportData(JSON.stringify(data, null, 2))
  }

  async function deleteAll() {
    if (!confirm('Permanently delete ALL local data?')) return
    await deleteAllData()
    await refresh()
    setExportData(null)
    setActiveConv(null)
  }

  const events = evaluateProactivityEvents({
    now: Date.now(),
    commitments,
    goals,
    lastActivityAt: convs.length ? convs[0].lastActivityAt : null,
  })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b px-4 py-3 flex gap-2 flex-wrap">
        {(['chat', 'goals', 'journal', 'memory', 'privacy'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </header>
      <main className="p-4 max-w-4xl mx-auto">
        {tab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <aside className="md:col-span-1">
              <button onClick={newConv} className="mb-2 w-full bg-blue-600 text-white py-1 rounded">New conversation</button>
              <ul className="space-y-1">
                {convs.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => setActiveConv(c.id)} className={`w-full text-left px-2 py-1 rounded ${activeConv === c.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            <section className="md:col-span-2 flex flex-col h-[70vh]">
              <div className="flex-1 overflow-auto border rounded p-3 bg-white space-y-2">
                {msgs.map((m) => (
                  <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <span className={`inline-block px-3 py-1 rounded ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{m.content}</span>
                  </div>
                ))}
                {loading && <div className="text-gray-500">Thinking…</div>}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="flex-1 border rounded px-2 py-1" placeholder="Type a message…" />
                <button onClick={send} disabled={loading} className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50">Send</button>
              </div>
            </section>
          </div>
        )}

        {tab === 'goals' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="New goal…" />
              <button onClick={addGoal} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
            </div>
            <ul className="space-y-2">
              {goals.map((g) => (
                <li key={g.id} className="border rounded p-3 bg-white">
                  <div className="font-semibold">{g.title}</div>
                  <div className="text-sm text-gray-600">Status: {g.status} · Progress: {Math.round(g.progress * 100)}%</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {g.status === 'active' && (
                      <>
                        <button onClick={async () => { await goalEngine.complete(g.id); await refresh() }} className="text-sm bg-green-600 text-white px-2 py-1 rounded">Complete</button>
                        <button onClick={async () => { await goalEngine.abandon(g.id); await refresh() }} className="text-sm bg-yellow-600 text-white px-2 py-1 rounded">Abandon</button>
                        <button onClick={async () => { await goalEngine.archive(g.id); await refresh() }} className="text-sm bg-gray-600 text-white px-2 py-1 rounded">Archive</button>
                      </>
                    )}
                  </div>
                  {g.milestones.length > 0 && (
                    <ul className="mt-2 text-sm list-disc pl-5">
                      {g.milestones.map((m) => (
                        <li key={m.id}>{m.title} {m.done ? '✓' : ''}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Commitments</h3>
              <div className="flex gap-2 mb-2">
                <input value={newCommitment} onChange={(e) => setNewCommitment(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="New commitment…" />
                <button onClick={addCommitment} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
              </div>
              <ul className="space-y-1">
                {commitments.map((c) => (
                  <li key={c.id} className="border rounded p-2 bg-white flex justify-between items-center">
                    <span>{c.description} <span className="text-xs text-gray-500">({c.status})</span></span>
                    {c.status === 'pending' && (
                      <span className="flex gap-1">
                        <button onClick={async () => { await commitmentEngine.complete(c.id); await refresh() }} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Done</button>
                        <button onClick={async () => { await commitmentEngine.cancel(c.id); await refresh() }} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Cancel</button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'journal' && (
          <div>
            <textarea value={newJournal} onChange={(e) => setNewJournal(e.target.value)} className="w-full border rounded p-2 mb-2" rows={3} placeholder="Write a journal entry…" />
            <button onClick={addJournal} className="bg-blue-600 text-white px-4 py-1 rounded mb-4">Save</button>
            <ul className="space-y-2">
              {journals.map((j) => (
                <li key={j.id} className="border rounded p-3 bg-white">
                  <div className="text-sm text-gray-500">{new Date(j.createdAt).toLocaleString()} {j.mood ? `· ${j.mood}` : ''}</div>
                  <div className="mt-1">{j.content}</div>
                  {j.tags.length > 0 && <div className="mt-1 text-xs text-gray-500">Tags: {j.tags.join(', ')}</div>}
                  <button onClick={async () => { await journalEngine.delete(j.id); await refresh() }} className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'memory' && (
          <div>
            <p className="mb-2 text-sm text-gray-600">Stored memories (inspectable, editable, deletable).</p>
            <ul className="space-y-2">
              {memories.map((m) => (
                <li key={m.id} className="border rounded p-3 bg-white">
                  <div className="text-xs text-gray-500">{m.category} · conf {m.confidence.toFixed(2)} · imp {m.importance.toFixed(2)}</div>
                  <div className="mt-1">{m.content}</div>
                  <button onClick={async () => { await memoryEngine.softDelete(m.id); await refresh() }} className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </li>
              ))}
            </ul>
            {events.length > 0 && (
              <div className="mt-4 p-3 border rounded bg-yellow-50">
                <div className="font-semibold text-sm">Proactivity events</div>
                <ul className="text-sm list-disc pl-5">
                  {events.map((e) => <li key={e.id}>{e.type}: {e.description}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'privacy' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Export data</h3>
              <button onClick={doExport} className="bg-blue-600 text-white px-4 py-1 rounded">Export JSON</button>
              {exportData && (
                <textarea readOnly value={exportData} className="w-full mt-2 border rounded p-2 font-mono text-xs" rows={12} />
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600">Delete all data</h3>
              <button onClick={deleteAll} className="bg-red-600 text-white px-4 py-1 rounded">Delete everything</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
