# BaseCommons

## Overview

**BaseCommons** is a production-ready Quadratic Funding platform on Base blockchain. Many small donors outweigh a few large ones — community breadth is rewarded over concentrated capital.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + framer-motion
- **Routing**: wouter
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Architecture

- `artifacts/basecommons/` — React+Vite frontend at `/`
- `artifacts/api-server/` — Express 5 backend at `/api`
- `lib/db/` — Drizzle ORM schema (projects, donations, funding_cycles tables)
- `lib/api-spec/openapi.yaml` — Single source of truth for API contracts
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas

## Features

- Projects feed with quadratic funding metrics (donors, raised, estimated match)
- Sort by newest / top funded / most donors / top matched
- Project detail with Live QF Match Estimator (interactive slider)
- DonateBox — simulate ETH donations, record via API
- Register new projects via form
- Admin panel with platform stats, funding cycles, matching pool
- Live activity feed of recent donations
- Leaderboard of top projects by QF share

## Quadratic Funding Formula

```
match_i = pool × (Σⱼ √donationⱼᵢ)² / Σₖ (Σⱼ √donationⱼₖ)²
```

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `projects` — registered public goods projects with donation totals
- `donations` — individual donation records with donor addresses
- `funding_cycles` — historical data per funding cycle

## Logo & Branding

- Logo: `artifacts/basecommons/public/logo.png` (hexagon + seedling, amber/green)
- Color palette: warm off-white (#FAF7F0), deep ink (#1A1208), amber gold (#C8972A), forest green (#5A7A5A)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
