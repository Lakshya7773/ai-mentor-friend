// src/lib/model-adapter/types.ts
export interface ModelCapabilities {
  textGeneration: boolean
  structuredJson: boolean
  toolCalling: boolean
  streaming: boolean
  contextWindow: number
  multilingual: boolean
  imageSupport: boolean
  localExecution: boolean
  cloudExecution: boolean
}

export interface GenerateRequest {
  systemPrompt: string
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  temperature?: number
  maxTokens?: number
  reasoningEffort?: 'low' | 'medium' | 'high' | null
}

export interface GenerateResponse {
  content: string
  finishReason: 'stop' | 'length' | 'error'
  usage?: { promptTokens: number; completionTokens: number }
}

export interface ModelAdapter {
  id: string
  name: string
  capabilities: ModelCapabilities
  generate(req: GenerateRequest): Promise<GenerateResponse>
  isAvailable(): Promise<boolean>
}
