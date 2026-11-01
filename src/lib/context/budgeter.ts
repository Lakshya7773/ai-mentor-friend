// src/lib/context/budgeter.ts
export interface ContextBudgetConfig {
  totalTokens: number
  systemPromptTokens: number
  memoryTokens: number
  historyTokens: number
  userMessageTokens: number
  responseReserveTokens: number
}

export const defaultBudgetConfig: ContextBudgetConfig = {
  totalTokens: 4096,
  systemPromptTokens: 512,
  memoryTokens: 768,
  historyTokens: 1536,
  userMessageTokens: 512,
  responseReserveTokens: 768,
}

export function estimateTokens(text: string): number {
  // Rough heuristic: ~4 chars per token for English; conservative.
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

export interface ContextItem {
  id: string
  content: string
  tokens: number
  priority: number // higher = more important
}

export interface BudgetResult {
  included: ContextItem[]
  excluded: ContextItem[]
  usedTokens: number
  budgetTokens: number
}

export function fitToBudget(items: ContextItem[], budgetTokens: number): BudgetResult {
  // Sort by priority desc, then include greedily until budget exhausted.
  const sorted = [...items].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
  const included: ContextItem[] = []
  const excluded: ContextItem[] = []
  let used = 0
  for (const item of sorted) {
    if (used + item.tokens <= budgetTokens) {
      included.push(item)
      used += item.tokens
    } else {
      excluded.push(item)
    }
  }
  return { included, excluded, usedTokens: used, budgetTokens }
}

export interface AssembledContext {
  systemPrompt: string
  memories: string[]
  history: { role: 'user' | 'assistant' | 'system'; content: string }[]
  userMessage: string
  estimatedTokens: number
}

export function assembleContext(opts: {
  systemPrompt: string
  memoryItems: ContextItem[]
  historyItems: ContextItem[]
  userMessage: string
  config?: Partial<ContextBudgetConfig>
}): AssembledContext {
  const cfg = { ...defaultBudgetConfig, ...opts.config }
  const memResult = fitToBudget(opts.memoryItems, cfg.memoryTokens)
  const histResult = fitToBudget(opts.historyItems, cfg.historyTokens)
  const memories = memResult.included.map((i) => i.content)
  const history = histResult.included
    .map((i) => ({ role: 'user' as const, content: i.content }))
  // Note: history role assignment is caller's responsibility in practice; here we keep simple.
  const estimated =
    estimateTokens(opts.systemPrompt) +
    memResult.usedTokens +
    histResult.usedTokens +
    estimateTokens(opts.userMessage)
  return {
    systemPrompt: opts.systemPrompt,
    memories,
    history,
    userMessage: opts.userMessage,
    estimatedTokens: estimated,
  }
}
