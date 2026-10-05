# Testing report (consolidation branch)

**Branch:** `cursor/consolidation-fc29`  
**Date:** 2026-10-01

## Commands run

| Command | Result |
|---------|--------|
| `npm install` (root workspaces, `.npmrc` legacy-peer-deps) | **Pass** |
| `npm run build:marketing` | **Pass** (Next 16, 8 static routes) |
| `npm run build:edu-web` | **Pass** (20 routes, edu dashboard preserved) |
| `npm run build:web` | **Pass** after CRM split fixes (20 CRM routes) |
| `npm run build:edu-api` | **Pass** (`prisma generate` + `tsc`) |
| `npm run start -w @chatpilot/api` | **Not run** — requires `FIREBASE_SERVICE_ACCOUNT` |
| `npm run start -w @chatpilot/ai-service` | **Not run** — requires Firebase service account file/env |
| Flutter `apps/mobile` tests | **Not run** — Flutter SDK not exercised in this session |
| End-to-end browser flows | **Partial** — marketing dev server smoke only |

## Integration notes

- **CRM REST** (`/api/chat`, `/api/flows`, …) is not fully present on `chatpilot-server-main` in the audited `index.js` mounts; CRM UI may return errors until those routes exist on Render or a BFF is added. URLs now target `NEXT_PUBLIC_MAIN_API_URL` instead of the edu backend.
- **Socket.io** on inbox uses configurable `NEXT_PUBLIC_SOCKET_URL`; AI server does not implement Socket.io — real-time inbox may need a follow-up on main API.
- **Widget** uses `NEXT_PUBLIC_WIDGET_SCRIPT_URL` (no localhost in production when env is set on Vercel).

## Lint

- `edu-web` / `web`: `ignoreDuringBuilds: true` in Next config (inherited). Dedicated `npm run lint` not executed.
