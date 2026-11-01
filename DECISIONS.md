# DECISIONS

1. Modular monolith over microservices.
2. Dexie/IndexedDB for local-first storage.
3. Model-independent core; MockModelAdapter only until Phase 6 LLM selection.
4. Context budgeting by priority greedy fit, not last-N messages.
5. lastAccessedAt updated on retrieval without changing updatedAt.
6. Cancelled commitment tracked via status 'cancelled'.
7. No real LLM or paid API introduced.