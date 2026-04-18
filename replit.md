# BaseCommons

## Overview

**BaseCommons** is a production-ready Quadratic Funding (QF) platform on Base blockchain. Many small donors outweigh a few large ones — community breadth is rewarded over concentrated capital.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (UUIDs as primary keys)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + framer-motion
- **Routing**: wouter
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Smart Contracts**: Solidity 0.8.20 + Foundry
- **Blockchain**: Base L2 (mainnet chain 8453, sepolia chain 84532)

## Architecture

- `artifacts/basecommons/` — React+Vite frontend at `/`
- `artifacts/api-server/` — Express 5 backend at `/api`
- `contracts/` — Foundry project with BaseCommons.sol, tests, deploy scripts
- `lib/db/` — Drizzle ORM schema (projects, donations, funding_cycles tables)
- `lib/api-spec/openapi.yaml` — Single source of truth for API contracts
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas

## Frontend Pages

- `/` — Home with hero, stats, project grid (search + category filter), leaderboard, live feed
- `/project/:uuid` — Project detail with image, QF match estimator, donate box, share buttons
- `/create` — Create new project form
- `/admin` — Admin panel with matching pool distribution
- `/how-it-works` — Quadratic Funding explainer with formula, comparison charts

## Features

- Projects feed with quadratic funding metrics (donors, raised, estimated match)
- Search bar + category filter on home page (All/Community/Open Source/Environment/Education/Music/Agriculture)
- Project detail with Live QF Match Estimator (interactive slider)
- DonateBox — ETH donation recording via API
- Social sharing buttons on project pages (X/Twitter, Farcaster/Warpcast, copy link, Web Share API)
- Register new projects via form
- Admin panel with platform stats, funding cycles, matching pool
- Live activity feed of recent donations
- Leaderboard of top projects by QF share
- How It Works page with QF formula, visual comparison, step guide
- Enhanced footer with nav links, resources, branding

## Smart Contract (`contracts/`)

- `contracts/src/BaseCommons.sol` — QF contract (Solidity ^0.8.20)
- `contracts/test/BaseCommons.t.sol` — 15 unit tests (all pass)
- `contracts/script/Deploy.s.sol` — One-command deployment script
- `contracts/foundry.toml` — Foundry config with Base mainnet + sepolia endpoints
- `contracts/deploy.sh` — Full deploy+verify shell script

### Contract Functions
- `registerProject(name, description, imageURI)` — Register project (caller is recipient)
- `donate(projectId)` payable — Donate ETH (forwarded instantly to recipient)
- `fundMatchingPool()` payable — Add to matching pool
- `estimateMatching()` view — Preview QF distribution
- `distributeMatching()` onlyAdmin — Execute QF distribution

### Deployment Wallet
- Address: `0xFfb6505912FCE95B42be4860477201bb4e204E9f`
- Base Mainnet balance: ~0.0000004 ETH (needs 0.01+ ETH to deploy)
- Base Sepolia balance: 0 ETH (needs testnet ETH from faucet)
- To deploy: `bash contracts/deploy.sh sepolia` or `bash contracts/deploy.sh mainnet`

## Quadratic Funding Formula

```
match_i = pool × (Σⱼ √donationⱼᵢ)² / Σₖ (Σⱼ √donationⱼₖ)²
```

Proven result: 9 donors × 0.01 ETH each (total 0.09 ETH) gets 0.313 ETH match
vs 1 whale × 0.5 ETH gets 0.193 ETH match (from test suite).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `cd contracts && forge test -vv` — run all 15 contract tests
- `bash contracts/deploy.sh [mainnet|sepolia]` — deploy + verify contract
- `export PATH="$HOME/.foundry/bin:$PATH"` — make foundry available (already installed at ~/.foundry/bin/)

## Database Schema

- `projects` — UUID PK, registered public goods projects with donation totals
- `donations` — UUID PK, individual donation records with donor addresses  
- `funding_cycles` — historical data per funding cycle

## Logo & Branding

- Logo: `artifacts/basecommons/public/logo.png` (hexagon + seedling, amber/green)
- Color palette: warm off-white (#FAF7F0), deep ink (#1A1208), amber gold (#C8972A), forest green (#5A7A5A)

## Environment Variables Needed

- `SESSION_SECRET` — session signing (set)
- `DATABASE_URL` — PostgreSQL connection (set)
- `WALLET_PRIVATE_KEY` — deployer wallet key (set)
- `BASESCAN_API_KEY` — contract verification on Basescan (NOT YET SET — needed before deploying)
- `VITE_BASE_COMMONS_ADDRESS` — set after deployment
- `VITE_CHAIN_ID` — set after deployment (8453 for mainnet, 84532 for sepolia)
