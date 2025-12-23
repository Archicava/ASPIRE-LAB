# AGENTS.md

Purpose: This file is the living memory for this repo. Keep it short, factual, and updated.

Update rules:
- After each non-trivial task, add a bullet to Progress Log.
- When you learn or change an architectural or integration detail, add it under the relevant notes.
- When you ask the user a question or need follow-up, add it to Open Questions and remove/mark resolved once answered.
- Do not record secrets or sensitive data.

## Project Snapshot
- Next.js App Router prototype for Ratio1 Case Inference Studio.
- Mock mode is default; live mode uses Ratio1 Edge Node services.

## Architecture Notes
- Mock mode uses `lib/mock-store.ts`; live mode uses `lib/data-platform.ts` + Ratio1 SDK calls.
- Ratio1 Edge SDK client is created in `lib/ratio1-client.ts` (CStore/R1FS + peers).
- Data keys: `platformConfig.casesHKey` and `platformConfig.jobsHKey`.

## Auth & Security Notes
- Mock auth uses demo credentials (`platformConfig.demoCredentials`, default `demo/demo`).
- Live auth uses `@ratio1/cstore-auth-ts` in `lib/auth/cstore.ts` (`simple.init()` + `simple.authenticate()`).
- Session cookie is signed (HMAC) in `r1-session` (see `lib/auth/session.ts`); set `AUTH_SESSION_SECRET` in prod.
- Authenticated pages call `requireSession()` on the server; API routes enforce session checks.

## Env Vars
- `NEXT_PUBLIC_RATIO1_USE_MOCKS` / `RATIO1_USE_MOCKS` toggle mock mode.
- `EE_CHAINSTORE_API_URL` / `EE_R1FS_API_URL` set endpoints; `EE_CHAINSTORE_PEERS` optional.
- `EE_CSTORE_AUTH_HKEY`, `EE_CSTORE_AUTH_SECRET`, `EE_CSTORE_BOOTSTRAP_ADMIN_PASS` for CStore auth.
- `AUTH_SESSION_SECRET` is required in production for signed sessions.
- `AUTH_SESSION_COOKIE`, `AUTH_SESSION_TTL_SECONDS` override session cookie settings.

## Progress Log
- 2025-12-23: Initial project review and created AGENTS.md with auth + architecture notes.
- 2025-12-23: Added signed session cookies, server-side auth checks, and updated docs/login copy.

## Open Questions
- (add new questions here)
