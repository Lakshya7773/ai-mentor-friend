# SARVAM ADAPTER

## Provider
- Endpoint: POST https://api.sarvam.ai/v1/chat/completions
- Models: sarvam-30b (64K context), sarvam-105b (128K context)
- Auth strategy: Bearer token only (Authorization: Bearer <key>)

## Request/Response
- OpenAI-compatible messages array.
- max_tokens, temperature.
- Response: choices[0].message.content, usage.prompt_tokens/completion_tokens.

## Configurable limits
- maxInputChars (default 12000)
- maxOutputTokens (default 1024)

## Known limitations
- Evaluation candidate only; no production model selected.
- Browser exposure of key prohibited for production; use server-side proxy.
- No streaming support in adapter yet.