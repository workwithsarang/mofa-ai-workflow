# Mofa-AI Agent + Workflow Management System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)

**Author:** Sarang — https://github.com/workwithsarang  
**Organisation:** [Mofa-AI](https://github.com/MoFA-AI)

---

## Overview

A full-stack web application that lets users create and manage **Agents** (configurable text-processing units) and chain them into **Workflows**. Each workflow executes two agents in sequence — the output of Agent A becomes the input of Agent B — with a step-by-step result view.

### Features

- JWT-based authentication (register / login / protected routes)
- Full Agent CRUD with types: `UPPERCASE`, `WORD_COUNT`, `REVERSE`, `TRIM`
- Workflow builder — chain exactly 2 agents
- Live workflow execution with step-by-step output
- Swagger / OpenAPI UI at `/api-docs`
- Ownership enforcement — users can only access their own resources

---

## Live URLs

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `<paste after deploy>` |
| **Backend (Render)**  | `<paste after deploy>` |
| **API Docs (Swagger)**| `<backend-url>/api-docs` |

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use SQLite by changing the Prisma provider)

### 1 — Clone

```bash
git clone https://github.com/workwithsarang/mofa-ai-workflow.git
cd mofa-ai-workflow
```

### 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET in .env
npx prisma migrate dev --name init
npm run dev
```

### 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:5000 in .env.local
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | Server port (default `5000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full URL of the deployed backend |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login, returns JWT |
| `GET` | `/agents` | JWT | List all agents |
| `POST` | `/agents` | JWT | Create an agent |
| `GET` | `/agents/:id` | JWT | Get single agent |
| `PUT` | `/agents/:id` | JWT | Update agent |
| `DELETE` | `/agents/:id` | JWT | Delete agent |
| `GET` | `/workflows` | JWT | List all workflows |
| `POST` | `/workflows` | JWT | Create a workflow |
| `GET` | `/workflows/:id` | JWT | Get single workflow |
| `POST` | `/workflows/:id/run` | JWT | Execute workflow |
| `GET` | `/api-docs` | No | Swagger UI |
| `GET` | `/health` | No | Health check |

---

## Example curl Commands

### Register

```bash
curl -X POST https://<backend-url>/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

### Login

```bash
TOKEN=$(curl -s -X POST https://<backend-url>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}' \
  | jq -r '.token')
echo $TOKEN
```

### Create an Agent

```bash
curl -X POST https://<backend-url>/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Uppercase Bot","type":"UPPERCASE","status":"ACTIVE"}'
```

### Create a Workflow

```bash
curl -X POST https://<backend-url>/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Upper then Count","agentIds":["<agentAId>","<agentBId>"]}'
```

### Run a Workflow

```bash
curl -X POST https://<backend-url>/workflows/<workflowId>/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"hello world"}'
```

Expected response:

```json
{
  "steps": [
    { "index": 1, "agentId": "...", "agentName": "Uppercase Bot", "output": "HELLO WORLD" },
    { "index": 2, "agentId": "...", "agentName": "Word Counter", "output": "2" }
  ],
  "finalOutput": "2"
}
```

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on Render, connect to the GitHub repo.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Set **Start Command**: `node src/index.js`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`, `API_BASE_URL=<your-render-url>`
6. Render will provision a PostgreSQL instance (or attach your own).

### Frontend → Vercel

1. Import the GitHub repo on Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Add environment variable: `VITE_API_BASE_URL=<your-render-backend-url>`
5. Deploy.

---

## Tech Stack

- **Backend:** Node.js · Express · Prisma ORM · PostgreSQL · JWT · bcryptjs · Swagger UI
- **Frontend:** React 18 · Vite · React Router v6 · Axios
- **Deployment:** Render (backend) · Vercel (frontend)
