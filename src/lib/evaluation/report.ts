// src/lib/evaluation/report.ts
import type { EvalResult } from './types'

export function generateReport(results: EvalResult[]): string {
  const lines: string[] = []
  lines.push('# Model Evaluation Report')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push(`Total results: ${results.length}`)
  lines.push('')
  for (const r of results) {
    lines.push(`## ${r.scenarioId} (${r.scenarioVersion})`)
    lines.push(`- Model: ${r.modelId}`)
    lines.push(`- Timestamp: ${new Date(r.timestamp).toISOString()}`)
    lines.push('')
    lines.push('### Response')
    lines.push(r.response)
    lines.push('')
    if (r.scores) {
      lines.push('### Scores')
      for (const [k, v] of Object.entries(r.scores)) lines.push(`- ${k}: ${v}`)
    } else {
      lines.push('### Scores: not yet scored')
    }
    if (r.notes) lines.push(`Notes: ${r.notes}`)
    lines.push('')
  }
  return lines.join('\n')
}
