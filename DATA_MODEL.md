# DATA MODEL

## Dexie Schema Version History

- v1: memories, conversations, messages, goals, journal, profile.
- v2: memories add lastAccessedAt (upgrade: default null). Existing records preserved.
- v3: commitments table added. Unrelated tables unaffected.

## Migration rules
- Historical versions never renumbered.
- Upgrades are deterministic and idempotent.
- Missing new fields default safely.
- Existing data never overwritten.