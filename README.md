# Ticketmaster

A small ticket management app: create, search, edit, delete. The CRUD itself is simple on purpose. What this repo is really meant to show is everything sitting around that CRUD: a clean layered backend, validation and error handling done properly, search kept in sync automatically, and a modular Angular SSR frontend that mirrors the same care.

Think of it less as a demo app and more as a portfolio of practices.

---

## Stack

| Layer      | Tech                                                        |
|------------|--------------------------------------------------------------|
| Frontend   | Angular 19 (standalone components, SSR), TailwindCSS, RxJS    |
| Backend    | Node.js, Express, TypeScript                                  |
| Data       | MongoDB (Mongoose), Elasticsearch (search)                    |
| Docs       | Swagger / OpenAPI                                              |
| Infra      | Docker, Docker Compose                                         |

---

## Highlights

- **A properly layered backend.** Routes only wire paths to controllers, controllers only orchestrate, and models own their own persistence side effects. Cross-cutting concerns like validation, logging, and configuration each live in their own folder instead of being scattered through business logic.
- **Errors handled in one place.** Every route is wrapped so a thrown or rejected error always lands in a single error handler, with a typed `ApiError` carrying the right status code. No repeated try/catch blocks anywhere in the codebase.
- **Validation and configuration both schema-driven.** Zod checks incoming request bodies and the app's own environment variables at startup, so bad input and missing config both fail fast with a clear message instead of a confusing crash somewhere downstream.
- **Search that never drifts from the source of truth.** Mongoose lifecycle hooks index, update, and remove documents in Elasticsearch automatically whenever a ticket is written, no matter which part of the app made the change.
- **Real logging, not console output.** Structured, leveled logs with request tracing, and third-party client errors summarized into something readable instead of dumping raw internals.
- **Security considered by default.** Standard security headers, an explicit CORS allowlist, and no secrets or personal file paths hardcoded in source.
- **A frontend that knows where it's running.** The same Angular app resolves the API's address differently depending on whether it's rendering in the browser or on the server inside a container, so server side rendering works correctly in both environments without extra setup.
- **Routing built to grow.** Each feature owns its own route file and loads on demand. Adding a new module later means adding one file and one line, not touching what already exists.

---

## Project structure

```
.
├── api/                        # Express + TypeScript backend
│   └── src/
│       ├── app/                # routes → controllers → models (per resource)
│       ├── config/              # env, cors, logger, pagination, validated at boot
│       ├── middleware/          # asyncHandler, errorHandler, validate
│       ├── services/            # elasticsearch client
│       ├── utils/                # ApiError, asyncRouter, pagination helper
│       └── validators/          # Zod schemas
├── web/                         # Angular 19 (SSR) frontend
│   └── src/app/
│       ├── ticket/               # feature module: listing, add/edit, own routes
│       ├── shared/               # confirm-dialog, pagination
│       ├── services/             # TicketService, ConfirmDialogService
│       └── tokens/                # API_URL (browser vs SSR)
├── docker-compose.yml            # api + web
├── docker-compose.infra.yml      # mongo + elasticsearch
└── README.md
```

---

## Running it

Two ways to run this, depending on how much you want on your machine.

### Fully dockerized

Nothing to install except Docker. Mongo, Elasticsearch, the API, and the Angular SSR server all run in containers.

```bash
# 1. Infra first (creates the shared network, starts Mongo and Elasticsearch)
docker compose -f docker-compose.infra.yml up -d

# 2. App (builds and starts api + web, joins the network from step 1)
docker compose -f docker-compose.yml up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:4000 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api-docs |

> Heads up: during the `web` image build you may see a benign `ECONNREFUSED` in the log. That's Angular's SSR prerender step trying to reach the API at build time, before any container is actually running. The build still succeeds, and real API calls work fine once everything is up.

To tear down, run `docker compose -f docker-compose.yml down`, then `docker compose -f docker-compose.infra.yml down` (add `-v` if you also want to wipe Mongo/ES data).

### Hybrid, for active development

Docker only for the stateful pieces (Mongo, Elasticsearch), with the API and frontend running locally so you get hot reload.

```bash
# 1. Infra
docker compose -f docker-compose.infra.yml up -d

# 2. API, from /api
npm install
npm run dev          # http://localhost:3000

# 3. Frontend, from /web
npm install
npm start             # http://localhost:4200
```

`api/.env` already ships with the `localhost` values this mode needs, so nothing to edit.

---

## Environment variables (`api/.env`)

Validated at startup via Zod (`config/env.ts`). If any of these are missing or malformed, the app refuses to boot and tells you exactly why.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | API port |
| `API_URL` | This API's own public URL, used in Swagger's server list |
| `LOG_LEVEL` | Pino log level (`info`, `debug`, ...) |
| `MONGO_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Comma-separated allowlist, e.g. `http://localhost:4200,http://localhost:4000` |
| `ELASTICSEARCH_URL`, `ELASTIC_USERNAME`, `ELASTIC_PASSWORD`, `ELASTIC_CA_PATH` | Elasticsearch connection |

The dockerized `api` service sets its own equivalents through `docker-compose.yml`'s `environment:` block, using Docker network hostnames instead of `localhost`, so it doesn't rely on `.env` at all when run that way.

---

## API docs

Swagger is generated from JSDoc comments on the route definitions themselves (`api/src/app/routes/*.ts`), so the docs stay close to what the endpoints actually do.

**http://localhost:3000/api-docs**

---

## Scripts

| Where | Command | Does |
|---|---|---|
| `api/` | `npm run dev` | Runs the API with hot reload (`ts-node-dev`, transpile-only) |
| `api/` | `npm run build` | Compiles TypeScript to `dist/` |
| `api/` | `npm start` | Runs the compiled build |
| `web/` | `npm start` | `ng serve`, dev server on :4200 |
| `web/` | `npm run build` | Production SSR build |
| `web/` | `npm run serve:ssr:ticketmaster` | Runs the built SSR server |

## Screenshots

**Listing**
<img width="1920" height="826" alt="image" src="https://github.com/user-attachments/assets/c64c7fd5-be01-4601-823a-c1f8f6d0ae46" />

**Create**
<img width="1920" height="826" alt="image" src="https://github.com/user-attachments/assets/2f410dc8-2f7e-4b35-91fa-035ba340326c" />

**Update**
<img width="1920" height="826" alt="image" src="https://github.com/user-attachments/assets/1ad7cab8-6756-4590-b772-d62ed4078c55" />

**Confirmation Dialog**
<img width="1920" height="826" alt="screencapture-localhost-4200-tickets-2026-07-05-16_21_45" src="https://github.com/user-attachments/assets/4254ad2d-8241-4fd0-877e-418e8f78bf36" />


---
