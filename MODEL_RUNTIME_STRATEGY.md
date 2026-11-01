# MODEL RUNTIME STRATEGY

## Phase 6B findings
sarvam-105b produced strong disagreement/contradiction responses but empty/truncated listening/accountability/reasoning responses due to reasoning consuming shared output budget.

## Interaction modes
- listening: reasoning disabled (hypothesis), 512 tokens
- accountability: reasoning disabled (hypothesis), 512 tokens
- mentor: reasoning low, 800 tokens
- deep-analysis: reasoning low, 1200 tokens (configurable)

## Empty-response protection
Orchestrator checks trimmed content; if empty, status='empty', no assistant message persisted. Errors return status='error'.

## Provider separation
Runtime types/strategy in src/lib/runtime. ReasoningEffort flows through GenerateRequest; adapter decides how to send. No Sarvam logic in product code.

## Verified vs hypothesis
Verified: adapter supports reasoningEffort null/low/medium/high, maxTokens configurable, finishReason exposed, empty response represented as ''.
Hypothesis (needs live validation): which reasoning level per mode eliminates empty/truncated responses.
## Phase 6L Consolidation

### Verified by live evidence
- listening -> null reasoning / 512 tokens (Phase 6D)
- accountability -> null reasoning / 512 tokens (Phase 6D)
- clarification -> null reasoning / 512 tokens (Phase 6I)
- mentor advice (multi-turn) -> null reasoning / 512 tokens (Phase 6K)

### Not yet validated
- deep-analysis runtime (remains low reasoning / 1200 tokens, experimental)

### Runtime strategy (consolidated)
| Mode | Reasoning | Max Tokens | Evidence Status |
|---|---|---:|---|
| listening | null | 512 | Supported |
| accountability | null | 512 | Supported |
| mentor | null | 512 | Supported for tested advice path |
| deep-analysis | low (experimental) | 1200 (configurable) | Not validated |

### Advice quality guardrail
Integrated into dialogue prompt (advise intent): evidence-based, calibrated certainty, decision-changing conditions, directness preserved, no chain-of-thought exposure.
