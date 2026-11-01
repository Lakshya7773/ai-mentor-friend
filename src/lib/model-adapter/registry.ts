// src/lib/model-adapter/registry.ts
import type { ModelAdapter } from './types'

export class ModelRegistry {
  private adapters = new Map<string, ModelAdapter>()
  private activeId: string | null = null

  register(adapter: ModelAdapter) {
    this.adapters.set(adapter.id, adapter)
    if (!this.activeId) this.activeId = adapter.id
  }

  get(id: string): ModelAdapter | undefined {
    return this.adapters.get(id)
  }

  list(): ModelAdapter[] {
    return [...this.adapters.values()]
  }

  setActive(id: string) {
    if (!this.adapters.has(id)) throw new Error(`Unknown adapter: ${id}`)
    this.activeId = id
  }

  getActive(): ModelAdapter {
    if (!this.activeId) throw new Error('No active model adapter')
    const a = this.adapters.get(this.activeId)
    if (!a) throw new Error('Active adapter missing')
    return a
  }
}
