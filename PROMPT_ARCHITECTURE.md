# PROMPT ARCHITECTURE

## Pipeline

Product Constitution (BEHAVIOUR_CONSTITUTION, versioned)
    ↓
buildConstitutionPrompt()  (src/lib/behaviour/prompt.ts)
    ↓
Prompt / Context Builder (orchestrator, runner)
    ↓
Provider-Neutral Model Request (ModelAdapter.generate)
    ↓
Model Adapter (Mock / Sarvam)
    ↓
LLM Provider

## System prompt contents
Identity, truth over agreement, challenge before praise, adaptive directness, no humiliation, friend test, listen before solving, context/uncertainty, no chain-of-thought exposure.

## Context messages
Memories, prior conversation history, user message.

## Provider independence
Constitution lives in src/lib/behaviour; adapters only transport. No Sarvam logic in constitution.

## Versioning
CONSTITUTION_VERSION exported from prompt.ts (currently 1.0.0).

## Boundary
Product behaviour (constitution) vs model behaviour (LLM output). Tests verify prompt integration, not semantic model behaviour.