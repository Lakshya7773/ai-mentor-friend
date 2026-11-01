import { describe, it, expect } from 'vitest'
import { loadScenarios, validateScenario } from './scenarios'
import { runEvaluation, validateScores } from './runner'
import { generateReport } from './report'
import { createMockAdapter } from '../model-adapter/mock'

describe('EvaluationHarness', () => {
  it('loads scenarios', () => {
    const s = loadScenarios()
    expect(s.length).toBeGreaterThan(0)
  })

  it('validates scenario', () => {
    const s = loadScenarios()[0]
    expect(validateScenario(s)).toEqual([])
    const bad: any = { ...s, id: '', userMessage: '' }
    expect(validateScenario(bad).length).toBeGreaterThan(0)
  })

  it('runs evaluation with mock adapter', async () => {
    const adapter = createMockAdapter()
    const res = await runEvaluation(adapter, loadScenarios().slice(0, 2))
    expect(res.length).toBe(2)
    expect(res[0].modelId).toBe('mock')
    expect(res[0].response).toContain('mock')
  })

  it('validates scores', () => {
    const good = { reasoning: 3, honesty: 4, contextUse: 3, modeAppropriateness: 4, naturalCommunication: 3, boundarySafety: 5 }
    expect(validateScores(good)).toEqual([])
    const bad = { ...good, reasoning: 0 }
    expect(validateScores(bad).length).toBeGreaterThan(0)
  })

  it('generates report', () => {
    const r = generateReport([])
    expect(r).toContain('Model Evaluation Report')
  })
})
