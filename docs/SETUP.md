# ChatPilot WhatsApp CRM — setup

## Prerequisites

- Node.js 20+
- npm workspaces
- Firebase project (Auth + Firestore) for CRM tenants

## Install

```bash
npm install
```

## Environment

| App | File | Port |
|-----|------|------|
| CRM web | `apps/web/.env.local` from `.env.example` | 3003 |
| Main API | `apps/api/.env` from `.env.example` | 3002 |
| AI service | `apps/ai-service/.env` | 4000 |
| Marketing (optional) | `apps/marketing/.env.local` | 3010 |

Set **`CRM_COMPANY_UID`** on the main API to your Firestore company document id.

## Development

```bash
npm run dev:api
npm run dev:ai
npm run dev
```

CRM: http://localhost:3003

Edu ChatPilot is maintained separately and is **not** part of this repository.
