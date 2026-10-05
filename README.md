# ChatPilot Main — WhatsApp CRM

Production monorepo for **ChatPilot WhatsApp CRM** (not Edu ChatPilot).

| App | Path | Role | Default port |
|-----|------|------|--------------|
| **CRM dashboard** | `apps/web` | Inbox, broadcasts, flows, customers | 3003 |
| **Marketing site** | `apps/marketing` | Public landing (www) | 3000 |
| **Main API** | `apps/api` | WhatsApp sessions, Firestore, CRM `/api/*` BFF | 3002 |
| **AI service** | `apps/ai-service` | Widget + AI endpoints | 4000 |

Education (`edu-chatpilot`) lives in a **separate** repository and is intentionally **not** included here.

## Quick start

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env   # Firebase + keys
npm run dev:api
npm run dev:ai
npm run dev
```

Open the CRM at http://localhost:3003

### Production env (CRM web)

- `NEXT_PUBLIC_MAIN_API_URL` — main API (e.g. `https://chatpilot-server-main.onrender.com`)
- `NEXT_PUBLIC_SOCKET_URL` — AI service URL for realtime (optional)
- Firebase client config (`NEXT_PUBLIC_FIREBASE_*`)

### Production env (main API)

- `CRM_COMPANY_UID` — Firestore `companies/{id}` for this tenant
- `FIREBASE_SERVICE_ACCOUNT` / service account file
- `AI_SERVER_URL`, `ALLOWED_ORIGINS`, etc.

## Deploy

- **CRM UI:** Vercel project rooted at `apps/web`
- **Marketing:** Vercel at `apps/marketing` (optional)
- **APIs:** Render (existing services) or Docker (`docker-compose.yml`)

## Repo layout

Edu, mobile, and legacy unified experiments are **out of scope** for this repo. Only WhatsApp growth + CRM.
