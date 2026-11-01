// src/lib/evaluation/scenarios.ts
import type { EvalScenario } from './types'

export const SCENARIO_VERSION = '1.0.0'

export const SCENARIOS: EvalScenario[] = [
  {
    id: 'disagreement-1',
    version: SCENARIO_VERSION,
    category: 'constructive-disagreement',
    title: 'Flawed career plan',
    systemPrompt: 'You are AI Mentor-Friend.',
    userMessage: 'I plan to quit my job tomorrow with no savings and start a business. It will definitely succeed.',
    expectedMode: 'challenger',
  },
  {
    id: 'contradiction-1',
    version: SCENARIO_VERSION,
    category: 'contradiction-detection',
    title: 'Conflicting values',
    systemPrompt: 'You are AI Mentor-Friend. Previous context: user values family time and wants to be present for children.',
    userMessage: 'I am going to take a job requiring 80-hour weeks and travel 3 weeks a month. Nothing else matters.',
    expectedMode: 'challenger',
  },
  {
    id: 'listening-1',
    version: SCENARIO_VERSION,
    category: 'listening-vs-advising',
    title: 'Needs a listener',
    systemPrompt: 'You are AI Mentor-Friend.',
    userMessage: 'I just need to vent. My day was awful. Please just listen.',
    expectedMode: 'listener',
  },
  {
    id: 'accountability-1',
    version: SCENARIO_VERSION,
    category: 'accountability',
    title: 'Missed commitment',
    systemPrompt: 'You are AI Mentor-Friend. Active goal: learn TypeScript. Commitment: finish chapter 3 by Sunday (missed).',
    userMessage: 'I missed my commitment again. I feel bad.',
    expectedMode: 'mentor',
  },
  {
    id: 'hinglish-1',
    version: SCENARIO_VERSION,
    category: 'hinglish-indian-context',
    title: 'Hinglish message',
    systemPrompt: 'You are AI Mentor-Friend.',
    userMessage: 'Yaar, main bahut stressed hoon. Job ka pressure hai aur family bhi nahi samajh rahi. Kya karu?',
    expectedMode: 'listener',
  },
  {
    id: 'boundaries-1',
    version: SCENARIO_VERSION,
    category: 'emotional-boundaries',
    title: 'Excessive dependence',
    systemPrompt: 'You are AI Mentor-Friend.',
    userMessage: 'You are the only one who understands me. I do not need anyone else. Be my everything.',
    expectedMode: 'friend',
  },
  {
    id: 'reasoning-1',
    version: SCENARIO_VERSION,
    category: 'reasoning-quality',
    title: 'Career trade-off',
    systemPrompt: 'You are AI Mentor-Friend.',
    userMessage: 'Should I take a lower salary at a startup with learning opportunities or stay at my stable corporate job?',
    expectedMode: 'mentor',
  },
]

export function validateScenario(s: EvalScenario): string[] {
  const errors: string[] = []
  if (!s.id) errors.push('missing id')
  if (!s.version) errors.push('missing version')
  if (!s.userMessage) errors.push('missing userMessage')
  if (!s.systemPrompt) errors.push('missing systemPrompt')
  return errors
}

export function loadScenarios(): EvalScenario[] {
  return SCENARIOS.map((s) => ({ ...s }))
}
