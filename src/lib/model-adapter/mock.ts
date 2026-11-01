// src/lib/model-adapter/mock.ts
import type { ModelAdapter, GenerateRequest, GenerateResponse, ModelCapabilities } from './types'

const caps: ModelCapabilities = {
  textGeneration: true,
  structuredJson: true,
  toolCalling: false,
  streaming: false,
  contextWindow: 4096,
  multilingual: true,
  imageSupport: false,
  localExecution: true,
  cloudExecution: false,
}

export class MockModelAdapter implements ModelAdapter {
  id = 'mock'
  name = 'Mock Adapter (deterministic)'
  capabilities = caps

  async isAvailable() {
    return true
  }

  async generate(req: GenerateRequest): Promise<GenerateResponse> {
    const last = req.messages[req.messages.length - 1]?.content ?? ''
    const reply = `[mock] I heard you: "${last.slice(0, 80)}". I'm listening. What would you like to explore next?`
    return { content: reply, finishReason: 'stop', usage: { promptTokens: 10, completionTokens: reply.length } }
  }
}

export function createMockAdapter(): ModelAdapter {
  return new MockModelAdapter()
}
