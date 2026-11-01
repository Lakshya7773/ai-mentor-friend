# SECURITY

- API credentials must never be committed to Git.
- `.env` is ignored; `.env.example` contains placeholders only.
- No API key belongs in frontend production code.
- Sarvam adapter is for controlled local evaluation only unless requests are routed through a secure server-side component.
- Errors and logs must not reveal credentials.
- No automatic provider fallback.