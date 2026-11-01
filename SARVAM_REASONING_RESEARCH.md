# SARVAM REASONING RESEARCH

## 1. Executive finding

The smoke test returned HTTP 200 with `completion_tokens=800`, `reasoning_tokens=799`, `content=null`, `finish_reason=length`. This is consistent with provider-documented behaviour: `sarvam-105b` has thinking mode ON by default (default effort ~low/medium). Reasoning tokens share the same `max_tokens` budget as visible output. With `max_tokens=800`, the model spent ~799 tokens on internal reasoning and had no budget left for visible content, so `content` is null and `finish_reason` is `length`.

Verified facts:
- Thinking mode is on by default for sarvam-105b.
- Reasoning tokens count toward `max_tokens` and are billed as completion tokens.
- `reasoning_effort` accepts "low", "medium", "high", or null (disable). JS/cURL: `reasoning_effort: null`.
- Warning in docs: low max_tokens (under a few hundred) can be consumed entirely by reasoning, yielding empty content + length.

Reasoned hypothesis: our adapter relied on provider default reasoning effort and set max_tokens=800, which is insufficient for medium reasoning + a visible answer.

Unknowns: whether `reasoning_effort: "low"` plus 800 tokens yields visible content; whether disabling reasoning (`null`) is acceptable for mentor tasks. Requires one controlled experiment.

## 2. API findings

### Reasoning controls
- Param: `reasoning_effort` (string or null).
- Values: "low", "medium", "high" (and possibly "max" for some models). Disable with `null`.
- Default: thinking on (low/medium).

### Token-limit semantics
- `max_tokens` is a shared budget covering reasoning + visible output.
- No separate visible-output limit.
- Reasoning tokens count as completion tokens (billed).

### Usage metadata
- prompt_tokens: input tokens.
- completion_tokens: total output including reasoning.
- reasoning_tokens: in completion_tokens_details.reasoning_tokens.
- cached_tokens: in prompt_tokens_details.cached_tokens.

### Finish reasons
- `length`: generation stopped due to max_tokens (truncation).
- `stop`: natural stop.

### Model-specific
- sarvam-105b: reasoning model, thinking on by default.
- sarvam-30b: 64K context, may differ in reasoning behaviour.
- For conversational/structured output, docs recommend disabling reasoning (`reasoning_effort: null`) to free the budget.

## 3. Local implementation findings

Adapter (`src/lib/model-adapter/sarvam.ts`) sent:
- model: sarvam-105b
- messages: system + user
- max_tokens: min(req.maxTokens, maxOutputTokens) = 800
- temperature: 0.7
- No `reasoning_effort` parameter → provider default (thinking on).

So the adapter relied entirely on provider defaults for reasoning. Input limit enforced (maxInputChars). Single auth strategy (Bearer).

## 4. Configuration options (not applied)

1. Increase max_tokens to a few thousand.
   - Benefit: leaves room for visible answer.
   - Risk: higher cost/latency.
   - Documented: yes.
   - Requires another paid request: yes.

2. Set reasoning_effort to "low".
   - Benefit: less reasoning budget consumed.
   - Risk: shallower reasoning.
   - Documented: yes.
   - Requires another paid request: yes.

3. Disable reasoning (reasoning_effort: null).
   - Benefit: entire budget for visible answer; recommended for conversational/structured paths.
   - Risk: loses chain-of-thought quality.
   - Documented: yes.
   - Requires another paid request: yes.

4. Handle empty visible content as a distinct result state (MODEL_RESPONSE_EMPTY).
   - Benefit: prevents blank assistant messages.
   - Risk: none (local change).
   - Documented: design only; no request needed.

## 5. Recommended next experiment

Smallest controlled experiment: one request with `reasoning_effort: "low"` and `max_tokens: 800` (or disable reasoning) on scenario 1, no retries, no fallback. Compare visible content and token breakdown. Requires founder approval (one API request).

## Empty-response handling design

Propose provider-independent result state `MODEL_RESPONSE_EMPTY` for HTTP 200 + no visible content. Distinguish:
- Network failure
- HTTP/provider error
- Invalid response schema
- Successful reasoning but empty visible content
- Intentionally empty response (if supported)

Never silently surface a blank assistant message. No automatic retries or fallback providers.

## Zero additional inference
No additional Sarvam API inference requests were made in this phase. Zero additional credits consumed.