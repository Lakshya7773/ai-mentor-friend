# MEMORY SPEC

## Status: IMPLEMENTED + TESTED

Five categories: identity, episodic, behavioural, commitment, relationship.

Fields: id, category, content, sourceConversationId, createdAt, updatedAt, lastAccessedAt, confidence, importance, sensitivity, reviewAt, expiryAt, corrected, deleted.

Semantics:
- createdAt: when record created.
- updatedAt: when content/metadata modified.
- lastAccessedAt: when memory actually retrieved or selected for use. Updated on get/search without changing updatedAt (semantic content unchanged).

No vector DB or embeddings yet. Mock extraction only. Token estimator (chars/4) is heuristic and replaceable via estimateTokens interface.