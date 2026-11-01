// src/lib/conversation/orchestrator.ts
import { conversationEngine } from './engine'
import { buildConstitutionPrompt } from '../behaviour/prompt'
import { memoryEngine } from '../memory/engine'
import { estimateTokens, fitToBudget } from '../context/budgeter'
import type { ModelAdapter, GenerateRequest, GenerateResponse } from '../model-adapter/types'
import type { Message } from '../../types'
import { resolveStrategy } from '../runtime/strategy'
import type { InteractionMode } from '../runtime/types'
import type { TurnStatus } from '../runtime/types'

export interface ConversationTurnResult {
  userMessage: Message
  assistantMessage?: Message
  assistantContent: string
  status: TurnStatus
}

const SYSTEM_PROMPT = buildConstitutionPrompt()

export async function runConversationTurn(
  conversationId: string,
  userContent: string,
  adapter: ModelAdapter,
  mode: InteractionMode = 'mentor',
): Promise<ConversationTurnResult> {
  const content = userContent.trim()
  if (!content) throw new Error('User message cannot be empty')

  const strategy = resolveStrategy(mode)
  // Prior history before this turn
  const prior = await conversationEngine.getMessages(conversationId)

  // Persist user message
  const userMessage = await conversationEngine.addMessage({
    conversationId,
    role: 'user',
    content,
  })

  // Memories as context items
  const memories = await memoryEngine.list()
  const memoryItems = memories.map((m) => ({
    id: m.id,
    content: `[${m.category}] ${m.content}`,
    tokens: estimateTokens(m.content) + 4,
    priority: m.importance,
  }))

  // History items (prior messages only)
  const historyItems = prior.map((m) => ({
    id: m.id,
    content: m.content,
    tokens: estimateTokens(m.content) + 4,
    priority: 0.5,
  }))

  const memResult = fitToBudget(memoryItems, 768)
  const histResult = fitToBudget(historyItems, 1536)

  const messages: GenerateRequest['messages'] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...memResult.included.map((i) => ({ role: 'system' as const, content: `Memory: ${i.content}` })),
    ...histResult.included.map((i) => {
      // map back to original role by index in prior; simpler: alternate not reliable; use prior lookup
      const orig = prior.find((p) => p.id === i.id)
      return { role: (orig?.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant', content: i.content }
    }),
    { role: 'user', content },
  ]

  let resp: GenerateResponse
  try {
    resp = await adapter.generate({
      systemPrompt: SYSTEM_PROMPT,
      messages,
      maxTokens: strategy.maxGenerationTokens,
      reasoningEffort: strategy.reasoningEffort,
    })
  } catch {
    return { userMessage, assistantMessage: undefined, assistantContent: '', status: 'error' }
  }

  // Empty-response protection: never persist a blank assistant message
  if (!resp.content || !resp.content.trim()) {
    return { userMessage, assistantMessage: undefined, assistantContent: '', status: 'empty' }
  }

  const assistantMessage = await conversationEngine.addMessage({
    conversationId,
    role: 'assistant',
    content: resp.content,
    metadata: { finishReason: resp.finishReason, usage: resp.usage ?? null },
  })

  return { userMessage, assistantMessage, assistantContent: resp.content, status: 'success' }
}
