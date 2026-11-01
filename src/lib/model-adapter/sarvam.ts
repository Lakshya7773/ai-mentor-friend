// src/lib/model-adapter/sarvam.ts
import type { ModelAdapter, GenerateRequest, GenerateResponse, ModelCapabilities } from './types'

export interface SarvamAdapterOptions {
  apiKey?: string
  model?: string
  baseUrl?: string
  maxInputChars?: number
  maxOutputTokens?: number
  reasoningEffort?: 'low' | 'medium' | 'high' | null
}

const DEFAULT_MODEL = 'sarvam-105b'
const DEFAULT_BASE = 'https://api.sarvam.ai'

export class SarvamModelAdapter implements ModelAdapter {
  readonly id: string
  readonly name: string
  readonly capabilities: ModelCapabilities
  private apiKey: string
  private model: string
  private baseUrl: string
  private maxInputChars: number
  private maxOutputTokens: number
  private reasoningEffort: 'low'|'medium'|'high'|null|undefined

  constructor(opts: SarvamAdapterOptions = {}) {
    const env = (globalThis as any)?.process?.env ?? {}
    this.apiKey = opts.apiKey ?? env.SARVAM_API_KEY ?? env.SARVAM_API_SUBSCRIPTION_KEY ?? ''
    this.model = opts.model ?? env.SARVAM_MODEL ?? DEFAULT_MODEL
    this.baseUrl = (opts.baseUrl ?? env.SARVAM_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, '')
    this.maxInputChars = opts.maxInputChars ?? Number(env.SARVAM_MAX_INPUT_CHARS ?? 12000)
    this.maxOutputTokens = opts.maxOutputTokens ?? Number(env.SARVAM_MAX_OUTPUT_TOKENS ?? 1024)
    this.reasoningEffort = opts.reasoningEffort !== undefined ? opts.reasoningEffort : (env.SARVAM_REASONING_EFFORT as any)
    this.id = `sarvam:${this.model}`
    this.name = `Sarvam ${this.model}`
    this.capabilities = {
      textGeneration: true,
      structuredJson: true,
      toolCalling: false,
      streaming: false,
      contextWindow: this.model === 'sarvam-105b-conversations' ? 32768 : 131072,
      multilingual: true,
      imageSupport: false,
      localExecution: false,
      cloudExecution: true,
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0
  }

  async generate(req: GenerateRequest): Promise<GenerateResponse> {
    if (!this.apiKey) {
      throw new Error('Sarvam credentials missing: set SARVAM_API_KEY (or SARVAM_API_SUBSCRIPTION_KEY)')
    }
    const inputText = req.systemPrompt + '\n' + req.messages.map((m) => m.content).join('\n')
    if (inputText.length > this.maxInputChars) {
      throw new Error(`Sarvam input exceeds maxInputChars (${this.maxInputChars})`)
    }
    const messages = [{ role: 'system', content: req.systemPrompt }, ...req.messages]
    const body: any = {
      model: this.model,
      messages,
      max_tokens: Math.min(req.maxTokens ?? this.maxOutputTokens, this.maxOutputTokens),
      temperature: req.temperature ?? 0.7,
    }
    const re = req.reasoningEffort !== undefined ? req.reasoningEffort : this.reasoningEffort
    if (re !== undefined) {
      body.reasoning_effort = re
    }

    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Sarvam request failed: ${res.status} ${text.slice(0, 200)}`)
    }
    const json: any = await res.json()
    const content = json?.choices?.[0]?.message?.content ?? ''
    const usage = json?.usage
    return {
      content,
      finishReason: json?.choices?.[0]?.finish_reason === 'length' ? 'length' : 'stop',
      usage: usage
        ? { promptTokens: usage.prompt_tokens ?? 0, completionTokens: usage.completion_tokens ?? 0 }
        : undefined,
    }
  }
}
