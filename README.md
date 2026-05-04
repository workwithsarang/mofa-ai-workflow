# Agent + Workflow Management System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)

Built by **Sarang** ([@workwithsarang](https://github.com/workwithsarang)) for the [Mofa-AI](https://github.com/MoFA-AI) open-source assignment.

---

## What is this?

I built this as part of the Mofa-AI open-source assignment. The idea is simple — you create **Agents** (small text processing units) and wire two of them together into a **Workflow**. When you run a workflow, it passes your input through Agent A, then feeds that output into Agent B, and shows you exactly what happened at each step.

For example: an `UPPERCASE` agent followed by a `WORD_COUNT` agent would first capitalise your text, then count the words in the uppercased version.

### Things you can do

- Register and log in (JWT-based, tokens stored in localStorage)
- Create agents with different processing types: `UPPERCASE`, `WORD_COUNT`, `REVERSE`, `TRIM`
- Mark agents active or inactive
- Build workflows by picking 2 agents in sequence
- Run a workflow with any input string and see step-by-step results
- Explore all endpoints through the Swagger UI at `/api-docs`

---

## Live Links

| | URL |
|--|-----|
| Frontend | https://frontend-nine-bay-65.vercel.app |
| Backend API | https://mofa-ai-backend.onrender.com |
| Swagger Docs | https://mofa-ai-backend.onrender.com/api-docs |

---

## Running locally

You'll need Node.js 18+ and a PostgreSQL database (local or cloud).

**Clone the repo**

```bash
git clone https://github.com/workwithsarang/mofa-ai-workflow.git
cd mofa-ai-workflow
```

**Start the backend**

```bash
cd backend
npm install
cp .env.example .env
# open .env and fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

**Start the frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
# set VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

---

## Environment variables

**backend/.env**

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=some-long-random-string
PORT=5000
```

**frontend/.env.local**

```
VITE_API_BASE_URL=http://localhost:5000
```

---

## API reference

| Method | Endpoint | Needs auth? | What it does |
|--------|----------|-------------|--------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/agents` | Yes | List your agents |
| POST | `/agents` | Yes | Create an agent |
| GET | `/agents/:id` | Yes | Get one agent |
| PUT | `/agents/:id` | Yes | Update an agent |
| DELETE | `/agents/:id` | Yes | Delete an agent |
| GET | `/workflows` | Yes | List your workflows |
| POST | `/workflows` | Yes | Create a workflow |
| GET | `/workflows/:id` | Yes | Get one workflow |
| POST | `/workflows/:id/run` | Yes | Run a workflow |
| GET | `/api-docs` | No | Swagger UI |
| GET | `/health` | No | Health check |

Auth is a `Bearer` token in the `Authorization` header. Missing token → 401, bad/expired → 403, wrong owner → 404.

---

## Quick curl examples

**Register**
```bash
curl -X POST https://mofa-ai-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```

**Login and save the token**
```bash
TOKEN=$(curl -s -X POST https://mofa-ai-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}' \
  | jq -r '.token')
```

**Create an agent**
```bash
curl -X POST https://mofa-ai-backend.onrender.com/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Uppercase Agent","type":"UPPERCASE"}'
```

**Create a workflow**
```bash
curl -X POST https://mofa-ai-backend.onrender.com/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Upper then Count","agentIds":["<agentAId>","<agentBId>"]}'
```

**Run a workflow**
```bash
curl -X POST https://mofa-ai-backend.onrender.com/workflows/<id>/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"hello world from sarang"}'
```

Response looks like:
```json
{
  "steps": [
    { "index": 1, "agentName": "My Uppercase Agent", "output": "HELLO WORLD FROM SARANG" },
    { "index": 2, "agentName": "Word Counter", "output": "4" }
  ],
  "finalOutput": "4"
}
```

---

## Deploying

**Backend on Render**

1. New Web Service → connect this repo → Root directory: `backend`
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start command: `node src/index.js`
4. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`

**Frontend on Vercel**

1. Import repo → Root directory: `frontend` → Framework: Vite
2. Set `VITE_API_BASE_URL` to your Render backend URL
3. Hit deploy

---

## Stack

- Node.js + Express + Prisma + PostgreSQL
- React 18 + Vite + React Router v6 + Axios
- JWT auth (jsonwebtoken + bcryptjs)
- Swagger UI for API docs
- Deployed on Render + Vercel
