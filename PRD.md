# Product Requirements Document (PRD)
## Mofa-AI — Agent + Workflow Management System

---

| Field         | Detail                                          |
|---------------|-------------------------------------------------|
| **Project**   | Agent + Workflow Management System              |
| **Author**    | Sarang — github.com/workwithsarang             |
| **Org**       | Mofa-AI                                         |
| **Version**   | 1.0.0                                           |
| **Date**      | May 2026                                        |
| **Status**    | Completed & Deployed                            |
| **Repo**      | github.com/workwithsarang/mofa-ai-workflow      |

---

## 1. Executive Summary

The **Agent + Workflow Management System** is a full-stack web application that lets users define reusable text-processing units called **Agents**, chain them into **Workflows**, and execute those workflows against any input string — seeing step-by-step results in real time.

The system is built for the Mofa-AI open-source organisation as a foundation for composable, extensible AI pipeline tooling.

---

## 2. Problem Statement

Developers and data teams frequently need to apply multi-step text transformations (normalisation, counting, reversing, trimming) in a predictable, repeatable way. Without a management layer:

- Transformations are hard-coded and not reusable.
- There is no visibility into what each step produced.
- Adding a new transformation type requires touching scattered code.
- Multi-user environments have no isolation or ownership model.

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | Allow any user to register, log in, and manage their own agents and workflows independently |
| G2 | Provide a no-code interface to create, edit, and delete agents with configurable processing types |
| G3 | Enable chaining of exactly 2 agents into a workflow where Agent A output feeds Agent B |
| G4 | Display step-by-step execution output clearly after running a workflow |
| G5 | Expose every feature via a documented REST API with Swagger UI |
| G6 | Deploy to public cloud so evaluators and users can access it without local setup |

---

## 4. Non-Goals (Out of Scope for v1.0)

- Chains longer than 2 agents
- Real-time/streaming execution
- Drag-and-drop workflow builder
- Role-based access control (admin vs user)
- Agent marketplace / sharing between users
- Billing or usage metering
- Mobile-native app

---

## 5. Users & Personas

### Persona A — Developer / Evaluator
- Wants to review the API, test endpoints via Swagger, and verify ownership rules.
- Needs: clean Swagger docs, predictable HTTP status codes, example curl commands.

### Persona B — End User / No-Code Builder
- Wants to create agents and wire them into pipelines through a simple UI.
- Needs: intuitive forms, clear status badges, step-by-step run output.

### Persona C — Open-Source Contributor
- Wants to clone the repo, understand the architecture, and add a new agent type.
- Needs: clean monorepo structure, clear code patterns, `.env.example` for quick onboarding.

---

## 6. Feature Requirements

### 6.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| F1.1 | User can register with email + password | Must Have |
| F1.2 | Password hashed with bcryptjs (salt rounds ≥ 10) | Must Have |
| F1.3 | User can log in and receive a signed JWT (7-day expiry) | Must Have |
| F1.4 | All `/agents` and `/workflows` endpoints require `Authorization: Bearer <token>` | Must Have |
| F1.5 | Missing token returns **401**; invalid/expired token returns **403** | Must Have |
| F1.6 | JWT stored in `localStorage`; Axios interceptor attaches it to every request | Must Have |
| F1.7 | Logout clears token and redirects to `/login` | Must Have |

### 6.2 Agent Management

| ID | Requirement | Priority |
|----|-------------|----------|
| F2.1 | User can create an agent with: `name`, `type`, `status`, optional `inputSchema`, optional `processingLogic` | Must Have |
| F2.2 | Agent types supported: `UPPERCASE`, `WORD_COUNT`, `REVERSE`, `TRIM` | Must Have |
| F2.3 | Agent status: `ACTIVE` or `INACTIVE` (default `ACTIVE`) | Must Have |
| F2.4 | User can list all their own agents | Must Have |
| F2.5 | User can view, update, and delete a single agent | Must Have |
| F2.6 | Ownership enforced — another user's agent returns **404** | Must Have |
| F2.7 | Status badge displayed in UI (green = ACTIVE, grey = INACTIVE) | Must Have |

### 6.3 Agent Processing Logic

| ID | Requirement | Priority |
|----|-------------|----------|
| F3.1 | `UPPERCASE` — converts input to uppercase | Must Have |
| F3.2 | `WORD_COUNT` — returns the number of words as a string | Must Have |
| F3.3 | `REVERSE` — reverses the characters of the input string | Should Have |
| F3.4 | `TRIM` — strips leading and trailing whitespace | Should Have |
| F3.5 | Processing logic centralised in a single `runAgent(agent, input)` switch-map helper — new types require adding one block | Must Have |

### 6.4 Workflow Management

| ID | Requirement | Priority |
|----|-------------|----------|
| F4.1 | User can create a workflow with a name and exactly 2 agent IDs (`agentIds: [A, B]`) | Must Have |
| F4.2 | Both agents must belong to the creating user | Must Have |
| F4.3 | User can list all their workflows | Must Have |
| F4.4 | Each workflow row in the UI shows: name, Agent A → Agent B labels, Run button | Must Have |

### 6.5 Workflow Execution

| ID | Requirement | Priority |
|----|-------------|----------|
| F5.1 | `POST /workflows/:id/run` accepts `{ input: string }` | Must Have |
| F5.2 | Step 1: `runAgent(agentA, input)` → `step1Output` | Must Have |
| F5.3 | Step 2: `runAgent(agentB, step1Output)` → `step2Output` | Must Have |
| F5.4 | Response includes `steps[]` array (index, agentId, agentName, output) and `finalOutput` | Must Have |
| F5.5 | UI displays each step in a labelled card; final output in a highlighted box | Must Have |

### 6.6 API Documentation

| ID | Requirement | Priority |
|----|-------------|----------|
| F6.1 | Swagger UI mounted at `/api-docs` using `swagger-ui-express` | Must Have |
| F6.2 | Every endpoint documented with request body schema, response schema, auth requirement | Must Have |
| F6.3 | Raw OpenAPI JSON available at `/api-docs.json` | Should Have |

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│   React 18 + Vite   │   React Router v6   │   Axios    │
│                                                         │
│  /login  /register  /agents  /agents/new               │
│  /agents/:id/edit   /workflows  /workflows/new          │
│  /workflows/:id/run                                     │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS  (Bearer JWT)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       SERVER                            │
│              Node.js 18 + Express 4                     │
│                                                         │
│  /auth/*          authMiddleware (JWT verify)           │
│  /agents/*   ──►  agentController   ──►  runAgent()     │
│  /workflows/*     workflowController                    │
│  /api-docs        Swagger UI                            │
│                                                         │
│              Prisma ORM (query builder)                 │
└─────────────────────────┬───────────────────────────────┘
                          │ TCP
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                            │
│              PostgreSQL 16 (Render / Supabase)          │
│                                                         │
│   User ──< Agent                                        │
│   User ──< Workflow  (agentIds: String[])               │
└─────────────────────────────────────────────────────────┘
```

### Data Models

**User**
```
id         String   (cuid, PK)
email      String   (unique)
password   String   (bcrypt hash)
createdAt  DateTime
updatedAt  DateTime
```

**Agent**
```
id               String      (cuid, PK)
userId           String      (FK → User)
name             String
type             AgentType   (UPPERCASE | WORD_COUNT | REVERSE | TRIM)
inputSchema      String?
processingLogic  String?
status           AgentStatus (ACTIVE | INACTIVE)
createdAt        DateTime
updatedAt        DateTime
```

**Workflow**
```
id        String    (cuid, PK)
userId    String    (FK → User)
name      String
agentIds  String[]  (ordered: [agentA, agentB])
createdAt DateTime
updatedAt DateTime
```

---

## 8. API Surface

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, receive JWT |
| GET | `/agents` | JWT | List user's agents |
| POST | `/agents` | JWT | Create agent |
| GET | `/agents/:id` | JWT | Get single agent |
| PUT | `/agents/:id` | JWT | Update agent |
| DELETE | `/agents/:id` | JWT | Delete agent |
| GET | `/workflows` | JWT | List user's workflows |
| POST | `/workflows` | JWT | Create workflow |
| GET | `/workflows/:id` | JWT | Get single workflow |
| POST | `/workflows/:id/run` | JWT | Execute workflow |
| GET | `/api-docs` | No | Swagger UI |
| GET | `/health` | No | Health check |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error (bad input) |
| 401 | No token provided |
| 403 | Invalid or expired token |
| 404 | Resource not found / not owned by user |
| 409 | Conflict (e.g. duplicate email) |

---

## 9. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Passwords never stored in plain text | bcryptjs, 10 salt rounds |
| Passwords never returned in any API response | Prisma select fields exclude `password` |
| JWT signed with a strong secret | `JWT_SECRET` env var, HS256, 7d expiry |
| Ownership isolation | Every DB query filters by `userId: req.userId` |
| No resource existence leaking | Wrong-owner lookups return 404, not 403 |
| Secrets never committed | `.env` in `.gitignore`; `.env.example` provided |
| CORS enabled | `cors()` middleware on all routes |

---

## 10. Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/register` | Register | Email + password form, redirects to login on success |
| `/login` | Login | Stores JWT in localStorage, redirects to `/agents` |
| `/agents` | Agents List | Table with name, type badge, status badge, Edit/Delete |
| `/agents/new` | Agent Form | Create new agent |
| `/agents/:id/edit` | Agent Form | Pre-filled edit form |
| `/workflows` | Workflows List | Table with Agent A → B chain, Run button |
| `/workflows/new` | Workflow Builder | Name input + 2 agent dropdowns (active agents only) |
| `/workflows/:id/run` | Workflow Run | Textarea input → step cards → final output box |

All routes except `/login` and `/register` are wrapped in `<ProtectedRoute>` — unauthenticated users are redirected to `/login`.

---

## 11. Deployment Architecture

```
GitHub (workwithsarang/mofa-ai-workflow)
         │
         ├──► Vercel (Frontend)
         │     Root: /frontend
         │     Build: npm run build
         │     Env:   VITE_API_BASE_URL=<render-url>
         │
         └──► Render (Backend)
               Root: /backend
               Build: npm install && prisma generate && prisma migrate deploy
               Start: node src/index.js
               Env:   DATABASE_URL, JWT_SECRET, PORT, API_BASE_URL
                        │
                        └──► Render PostgreSQL (managed DB)
```

---

## 12. Project Structure

```
mofa/
├── backend/
│   ├── prisma/schema.prisma        # DB schema (User, Agent, Workflow)
│   ├── src/
│   │   ├── controllers/            # Business logic per resource
│   │   ├── middleware/auth.js      # JWT verification
│   │   ├── routes/                 # Express routers with Swagger JSDoc
│   │   ├── helpers/runAgent.js     # Agent processing switch-map
│   │   ├── swagger/swagger.js      # OpenAPI spec + UI setup
│   │   └── index.js                # App entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, ProtectedRoute
│   │   ├── pages/                  # One file per route/page
│   │   ├── services/api.js         # Axios instance + JWT interceptor
│   │   ├── App.jsx                 # Router + layout
│   │   └── index.css               # Global styles
│   └── .env.example
└── README.md
```

---

## 13. Success Metrics

| Metric | Target |
|--------|--------|
| All API endpoints return correct HTTP codes | 100% |
| Frontend build passes (`vite build`) with zero errors | ✅ Verified |
| Agent helper unit correctness | UPPERCASE, WORD_COUNT, REVERSE, TRIM all verified |
| Ownership isolation | Users cannot read/edit/delete/run another user's resources |
| Zero secrets in git history | `.env` excluded, `.env.example` committed |
| Public GitHub repo with full source | github.com/workwithsarang/mofa-ai-workflow |
| Swagger docs accessible at `/api-docs` | All 11 endpoints documented |

---

## 14. Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18+ |
| Web framework | Express | 4.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 16 |
| Auth | jsonwebtoken + bcryptjs | 9.x / 2.x |
| API docs | swagger-ui-express + swagger-jsdoc | 5.x / 6.x |
| Frontend | React | 18 |
| Build tool | Vite | 5.x |
| Routing | React Router | v6 |
| HTTP client | Axios | 1.x |
| Backend hosting | Render | — |
| Frontend hosting | Vercel | — |

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Render cold-start delay on free tier | High | Low | Add `/health` endpoint; note in README |
| PostgreSQL `agentIds String[]` not supported on SQLite | Medium | Medium | PRD mandates PostgreSQL; SQLite option documented as dev-only |
| JWT secret exposed via misconfigured deployment env | Low | High | `.env.example` ships with placeholder; `JWT_SECRET` marked required |
| User creates workflow with agents they don't own | Low | High | Both agents ownership-verified at workflow creation time |

---

## 16. Open-Source Contribution Guide

To add a new agent type (e.g. `TITLECASE`):

1. Add `TITLECASE` to the `AgentType` enum in [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
2. Run `npx prisma migrate dev --name add-titlecase`
3. Add one entry to the `AGENT_PROCESSORS` map in [backend/src/helpers/runAgent.js](backend/src/helpers/runAgent.js):
   ```js
   TITLECASE: (input) => input.replace(/\b\w/g, c => c.toUpperCase()),
   ```
4. Add `TITLECASE` to the `TYPES` array in [frontend/src/pages/AgentForm.jsx](frontend/src/pages/AgentForm.jsx)

No other files need to change.

---

*Document prepared for Mofa-AI open-source assignment review — May 2026*
