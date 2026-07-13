# Ticketmaster

[![CI](https://github.com/assadshahbaz/ticketmaster/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/assadshahbaz/ticketmaster/actions/workflows/ci.yml)

A small ticket management app: create, search, edit, delete. The CRUD itself is simple on purpose. What this repo is really meant to show is everything sitting around that CRUD: a clean layered backend, validation and error handling done properly, search kept in sync automatically, a modular Angular SSR frontend that mirrors the same care, CI running on every push, and both services built as Docker images and deployed to Render.

Think of it less as a demo app and more as a portfolio of practices.

**Live demo:** https://ticketmaster-web.onrender.com
> Hosted on Render's free tier, which spins down after inactivity. The first request can take ~30s to wake back up. Subsequent requests are fast.

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

- **Layered backend.** Routes wire paths to controllers, controllers orchestrate, and models own their own persistence. Validation, logging, and configuration each live in their own folder.
- **One error handler.** Every route is wrapped so errors always land in a single handler, with a typed `ApiError` carrying the right status code. No repeated try/catch blocks.
- **Schema-driven validation and config.** Zod checks request bodies and environment variables at startup, so bad input or missing config fails fast with a clear message.
- **Search that stays in sync.** A reusable mongoose plugin (`plugins/esIndexPlugin`) mirrors writes into Elasticsearch and adds a `search()` static, so any model gets indexing and full-text search with no per-model glue code.
- **Structured logging.** Leveled, traced request logs instead of console output, with third-party errors summarized into something readable.
- **Security by default.** Standard security headers, an explicit CORS allowlist, no secrets or hardcoded paths in source.
- **A frontend that knows where it's running.** The same Angular app resolves the API's address differently in the browser versus during server rendering, so SSR works in both environments without extra setup.
- **CI on every push.** GitHub Actions builds and tests both the API and the frontend on every push and pull request to main.
- **Deployed on Render.** Both services run as Docker images, `api` and `web`, each with their own build and environment configuration.

---

## Project structure

```
.
├── api/                        # Express + TypeScript backend
│   └── src/
│       ├── app/                # routes → controllers → models (per resource)
│       ├── config/              # env, cors, logger, pagination, validated at boot
│       ├── middleware/          # asyncHandler, errorHandler, validate
│       ├── plugins/             # esIndexPlugin, attach a model to Elasticsearch
│       ├── services/            # elasticsearch client
│       ├── utils/                # ApiError, asyncRouter, pagination helper
│       └── validators/          # Zod schemas
├── web/                         # Angular 19 (SSR) frontend
│   └── src/app/
│       ├── ticket/               # feature module: listing, add/edit, own routes
│       ├── shared/               # confirm-dialog, pagination
│       ├── services/             # TicketService, ConfirmDialogService
│       ├── tokens/                # API_URL (browser vs SSR)
│       └── app.routes.server.ts   # per-route render mode (SSR vs prerender)
├── docker-compose.yml            # api + web
├── docker-compose.infra.yml      # mongo + elasticsearch
└── README.md
```

---

## Deployment

Live on Render as two separate services, each built from its own Dockerfile: [`api/Dockerfile`](api/Dockerfile) and [`web/Dockerfile`](web/Dockerfile).

| Service | Notes |
|---|---|
| `api` | Needs `NODE_ENV=production` set explicitly in Render's dashboard. Render doesn't set this for you, and the logger relies on it to skip a dev-only pretty-print transport that isn't installed in the production image. |
| `web` | `environment.prod.ts` bakes in the live `api` URL at build time. `app.routes.server.ts` renders every route per-request (`RenderMode.Server`) instead of prerendering at build time, so `ng build` never needs to reach the API. |

Both services are on Render's free tier, so they spin down after inactivity. See the live demo link at the top for the cold-start note.

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
| `ELASTICSEARCH_URL` | Elasticsearch connection |

The dockerized `api` service sets its own equivalents through `docker-compose.yml`'s `environment:` block, using Docker network hostnames instead of `localhost`, so it doesn't rely on `.env` at all when run that way.

---

## API docs

Swagger is generated from JSDoc comments on the route definitions themselves (`api/src/app/routes/*.ts`), so the docs stay close to what the endpoints actually do.

**http://localhost:3000/api-docs**

---

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
