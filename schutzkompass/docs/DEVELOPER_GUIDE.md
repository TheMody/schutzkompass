# SchutzKompass — Developer Guide

> **Version 1.0** · July 2025
> Technical documentation for developers and operators of the SchutzKompass platform.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Getting Started](#3-getting-started)
4. [Monorepo Architecture](#4-monorepo-architecture)
5. [Packages Deep Dive](#5-packages-deep-dive)
   - 5.1 [@schutzkompass/web](#51-schutzkompassweb)
   - 5.2 [@schutzkompass/db](#52-schutzkompassdb)
   - 5.3 [@schutzkompass/shared](#53-schutzkompassshared)
   - 5.4 [@schutzkompass/ui](#54-schutzkompassui)
   - 5.5 [@schutzkompass/compliance-content](#55-schutzkompasscompliance-content)
6. [Server Actions](#6-server-actions)
7. [Services](#7-services)
8. [Authentication](#8-authentication)
9. [Database](#9-database)
10. [UI & Styling](#10-ui--styling)
11. [Environment Variables](#11-environment-variables)
12. [Docker & Deployment](#12-docker--deployment)
13. [CI/CD Pipeline](#13-cicd-pipeline)
14. [Testing](#14-testing)
15. [Common Tasks](#15-common-tasks)
16. [Architecture Decisions](#16-architecture-decisions)
17. [Known Limitations & TODOs](#17-known-limitations--todos)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. Overview

**SchutzKompass** is a web-based NIS2 & CRA compliance management platform built as a Turborepo monorepo. It helps organizations assess their regulatory obligations, manage risks, track security controls, handle incidents, manage supplier security, and maintain product conformity documentation.

### Tech Stack Summary

| Layer | Technology |
|---|---|
| **Monorepo** | Turborepo + pnpm 10 workspaces |
| **Runtime** | Node.js ≥ 20 |
| **Framework** | Next.js 15 (App Router, `output: 'standalone'`) |
| **Language** | TypeScript 5.9 |
| **UI** | shadcn/ui + Radix UI + Tailwind CSS v4 |
| **Charts** | Recharts 2.15 |
| **Forms** | React Hook Form + Zod validation |
| **Database** | PostgreSQL 16 via Drizzle ORM 0.38 |
| **Auth** | NextAuth.js v5 (beta) — Credentials provider, JWT sessions |
| **Background Jobs** | BullMQ + Redis (via ioredis) |
| **Object Storage** | MinIO (S3-compatible) |
| **E-Mail** | Resend |
| **Containerization** | Docker multi-stage builds |
| **Reverse Proxy** | Nginx (production) |
| **CI** | GitHub Actions |

---

## 2. Prerequisites

- **Node.js** ≥ 20 (LTS recommended)
- **pnpm** ≥ 10 (`corepack enable pnpm`)
- **Docker** & **Docker Compose** (for local services)
- **Git**

Optional:
- **VS Code** with the following extensions: ESLint, Tailwind CSS IntelliSense, Prettier

---

## 3. Getting Started

### 3.1 Clone & Install

```bash
git clone <repository-url> schutzkompass
cd schutzkompass

# Enable pnpm via corepack
corepack enable pnpm

# Install all dependencies
pnpm install
```

### 3.2 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL=postgresql://schutzkompass:schutzkompass_dev@localhost:5432/schutzkompass
REDIS_URL=redis://localhost:6379
AUTH_SECRET=<generate-a-random-32-char-secret>
NEXTAUTH_URL=http://localhost:3000
```

> **Tip:** Generate `AUTH_SECRET` with `openssl rand -base64 32`.

### 3.3 Start Everything (Single Command)

```bash
pnpm start:dev
```

This **single command** handles everything automatically:

1. **Starts Docker services** — PostgreSQL 16, Redis 7, MinIO (via `docker-compose`)
2. **Waits for readiness** — Polls PostgreSQL and Redis until they accept connections
3. **Pushes the database schema** — Runs `drizzle-kit push` (idempotent, safe to re-run)
4. **Starts the dev servers** — Runs Turborepo `dev` task (Next.js + Worker)

The web app will be available at **http://localhost:3000**.

> **Note:** If Docker requires `sudo` on your system, the script will detect this automatically and use `sudo` for Docker commands. To avoid this, add your user to the `docker` group:
> ```bash
> sudo usermod -aG docker $USER
> # Then log out and back in
> ```

#### Docker Services Started

| Service | Port(s) | Credentials |
|---|---|---|
| PostgreSQL | `localhost:5432` | `schutzkompass` / `schutzkompass_dev` / db: `schutzkompass` |
| Redis | `localhost:6379` | No password |
| MinIO | `localhost:9000` (API), `localhost:9001` (Console) | `minioadmin` / `minioadmin` |

### 3.4 Manual Setup (Alternative)

If you prefer to start services individually:

```bash
# Start Docker services (use docker-compose or docker compose, whichever is installed)
# If Docker requires sudo, prefix with sudo
docker-compose -f docker/docker-compose.yml up -d

# Wait for PostgreSQL to be ready, then push schema
pnpm db:push

# Start development servers
pnpm dev
```

### 3.5 Build

```bash
pnpm build
```

Builds all packages in dependency order. The web app produces a standalone Next.js output in `apps/web/.next/standalone/`.

---

## 4. Monorepo Architecture

```
schutzkompass/
├── apps/
│   ├── web/                          # Next.js 15 web application
│   └── worker/                       # BullMQ background worker (planned)
├── packages/
│   ├── db/                           # @schutzkompass/db — Drizzle ORM schemas & client
│   ├── shared/                       # @schutzkompass/shared — Types, validators, constants
│   ├── ui/                           # @schutzkompass/ui — Shared UI components
│   └── compliance-content/           # @schutzkompass/compliance-content — Static data
├── docker/
│   ├── docker-compose.yml            # Dev services (postgres, redis, minio)
│   ├── docker-compose.prod.yml       # Production stack
│   ├── Dockerfile.web                # Multi-stage web build
│   ├── Dockerfile.worker             # Worker build
│   └── nginx.conf                    # Reverse proxy config
├── scripts/
│   └── dev.sh                        # Single-command dev startup script
├── .github/
│   └── workflows/ci.yml             # GitHub Actions CI pipeline
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml               # Workspace definition
├── package.json                       # Root package.json
└── .env.example                      # Environment template
```

### Turborepo Pipeline

Defined in `turbo.json`:

| Task | Caching | Dependencies | Description |
|---|---|---|---|
| `start:dev` | No | — | **Single command:** Start Docker, push DB schema, run dev servers |
| `dev` | No | — | Start dev servers (persistent) |
| `build` | Yes | `^build` | Build all packages |
| `lint` | Yes | `^build` | ESLint across workspace |
| `type-check` | Yes | `^build` | TypeScript type checking |
| `clean` | No | — | Remove build artifacts |
| `db:generate` | No | — | Generate Drizzle migrations |
| `db:migrate` | No | — | Run database migrations |
| `db:push` | No | — | Push schema to database |

### Workspace Packages

Defined in `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 5. Packages Deep Dive

### 5.1 @schutzkompass/web

**Location:** `apps/web/`
**Framework:** Next.js 15 with App Router

#### Directory Structure

```
apps/web/
├── app/
│   ├── (app)/                        # Authenticated layout group
│   │   ├── layout.tsx                # App shell with sidebar
│   │   ├── dashboard/page.tsx        # Dashboard
│   │   ├── onboarding/page.tsx       # 4-step onboarding wizard
│   │   ├── organisation/             # NIS2 modules (8 pages)
│   │   │   ├── assets/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   ├── betroffenheit/page.tsx
│   │   │   ├── lieferkette/page.tsx
│   │   │   ├── massnahmen/page.tsx
│   │   │   ├── richtlinien/page.tsx
│   │   │   ├── risiken/page.tsx
│   │   │   └── vorfaelle/page.tsx
│   │   ├── produkte/                 # CRA modules (6 pages)
│   │   │   ├── page.tsx
│   │   │   ├── konformitaet/page.tsx
│   │   │   ├── lebenszyklus/page.tsx
│   │   │   ├── meldungen/page.tsx
│   │   │   ├── sbom/page.tsx
│   │   │   └── schwachstellen/page.tsx
│   │   ├── einstellungen/            # Settings (4 pages)
│   │   │   ├── benutzer/page.tsx
│   │   │   ├── integrationen/page.tsx
│   │   │   ├── organisation/page.tsx
│   │   │   └── profil/page.tsx
│   │   └── hilfe/page.tsx            # Help & Support
│   ├── (auth)/                       # Auth layout group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing / redirect
├── components/
│   ├── shared/
│   │   └── app-sidebar.tsx           # Main navigation sidebar
│   ├── charts/
│   │   ├── compliance-donut.tsx      # Recharts PieChart
│   │   └── risk-heatmap-chart.tsx    # Recharts ScatterChart
│   └── providers.tsx                 # Client-side providers
├── lib/
│   ├── actions/                      # Server Actions (12 files)
│   │   ├── assets.ts
│   │   ├── auth.ts
│   │   ├── conformity.ts
│   │   ├── controls.ts
│   │   ├── incidents.ts
│   │   ├── onboarding.ts
│   │   ├── policies.ts
│   │   ├── products.ts
│   │   ├── risks.ts
│   │   ├── sbom.ts
│   │   ├── suppliers.ts
│   │   └── vulnerabilities.ts
│   ├── services/                     # Business logic services
│   │   ├── cra-classifier.ts
│   │   ├── nis2-applicability.ts
│   │   └── risk-scoring.ts
│   ├── auth.ts                       # NextAuth configuration
│   └── session.ts                    # Session helpers
└── package.json
```

#### Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | ^15.3.0 | React framework |
| `react` / `react-dom` | ^19.0.0 | UI library |
| `next-auth` | 5.0.0-beta.30 | Authentication |
| `drizzle-orm` | ^0.38.4 | Database ORM |
| `react-hook-form` | ^7.54.0 | Form handling |
| `zod` | ^3.24.0 | Schema validation |
| `recharts` | ^2.15.0 | Charts/visualizations |
| `lucide-react` | ^0.468.0 | Icons |
| `date-fns` | ^4.1.0 | Date utilities |
| `sonner` | ^1.7.0 | Toast notifications |
| `bcryptjs` | ^3.0.3 | Password hashing |

### 5.2 @schutzkompass/db

**Location:** `packages/db/`
**ORM:** Drizzle ORM with PostgreSQL

#### Exports

```typescript
// Main entry: packages/db/src/index.ts
export { db, Database } from './client';
export * from './schema';

// Named exports:
import { db } from '@schutzkompass/db';              // Database client
import { users, assets } from '@schutzkompass/db/schema'; // Schema tables
```

#### Schema Files

| File | Tables | Description |
|---|---|---|
| `organisations.ts` | `organisations` | Organization profiles |
| `users.ts` | `users` | User accounts |
| `auth.ts` | `sessions`, `accounts`, `verificationTokens` | NextAuth.js tables |
| `assets.ts` | `assets` | IT asset inventory |
| `risks.ts` | `riskAssessments`, `riskEntries` | Risk assessments |
| `products.ts` | `products` | Digital products |
| `sboms.ts` | `sboms`, `sbomComponents` | Software BOMs |
| `vulnerabilities.ts` | `vulnerabilities` | CVE tracking |
| `suppliers.ts` | `suppliers`, `questionnaireResponses` | Supplier management |
| `incidents.ts` | `incidents`, `incidentTimeline` | Incident management |
| `controls.ts` | `controls` | Security controls |
| `audit-log.ts` | `auditLog` | Audit trail |
| `conformity-documents.ts` | `conformityDocuments` | CRA conformity docs |

#### Database Client

```typescript
// packages/db/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

#### Common Database Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (dev only, may drop data)
pnpm db:push

# Open Drizzle Studio (visual DB browser)
cd packages/db && pnpm db:studio
```

### 5.3 @schutzkompass/shared

**Location:** `packages/shared/`

Shared TypeScript types, Zod validators, and constants used across apps and packages.

| Export | Purpose |
|---|---|
| `constants` | Application-wide constants |
| `validators` | Zod schemas for form/API validation |
| `types` | Shared TypeScript type definitions |

### 5.4 @schutzkompass/ui

**Location:** `packages/ui/`

Shared UI components based on **shadcn/ui** + **Radix UI** primitives.

| Export | Purpose |
|---|---|
| `utils` | `cn()` utility for Tailwind class merging |
| `Button` | Standard button component |
| `Card`, `CardHeader`, etc. | Card layout components |
| `Wizard` | Multi-step wizard component |

### 5.5 @schutzkompass/compliance-content

**Location:** `packages/compliance-content/`

Static compliance data shipped as JSON:

| File | Content |
|---|---|
| `nis2/sectors.json` | 19 NIS2 sectors with sub-sectors |
| `threats/threat-catalog.json` | 20 cyber threat types |
| `bsi/grundschutz-controls.json` | 30 BSI baseline controls mapped to NIS2 Art. 21 |
| `nis2/policies/index.json` | 12 security policy templates |

---

## 6. Server Actions

All data operations use **Next.js Server Actions** (`'use server'` functions) located in `apps/web/lib/actions/`.

> ⚠️ **Important:** Currently, all server actions use **in-memory data stores** (JavaScript arrays). Each file contains sample data and `TODO` comments indicating where to integrate with the actual database via Drizzle ORM.

### Action Files Overview

| File | Functions | Description |
|---|---|---|
| `auth.ts` | `login()`, `register()` | User authentication |
| `onboarding.ts` | `evaluateOnboarding()` | NIS2/CRA applicability check |
| `assets.ts` | `getAssets()`, `createAsset()`, `importAssetsFromCSV()` | Asset CRUD + CSV import |
| `risks.ts` | `getRiskAssessments()`, `createRiskAssessment()`, `createRiskEntry()` | Risk management |
| `controls.ts` | `getControls()`, `updateControlStatus()`, `getComplianceScore()` | NIS2 controls tracking |
| `policies.ts` | `getPolicies()`, `updatePolicyStatus()` | Policy templates |
| `products.ts` | `getProducts()`, `createProduct()` | Product inventory |
| `sbom.ts` | `getSbomComponents()`, `getSbomComponentById()` | SBOM management |
| `vulnerabilities.ts` | `getVulnerabilities()`, `updateVulnerabilityStatus()` | CVE tracking/triage |
| `incidents.ts` | `getIncidents()`, `createIncident()`, `updateIncidentStatus()`, `classifySeverity()`, `getNis2Deadlines()` | Incident management |
| `suppliers.ts` | `getSuppliers()`, `createSupplier()`, `getSecurityQuestionnaire()`, `calculateSupplierScore()` | Supplier management |
| `conformity.ts` | `getConformityDocuments()`, `createConformityDocument()`, `getAnnexVIISections()`, `getEvidenceRepository()`, `addEvidence()` | CRA conformity |

### Server Action Pattern

Every server action follows this pattern:

```typescript
'use server';

// In-memory store (replace with DB queries)
let items: Item[] = [
  // Sample data for development
];

export async function getItems(): Promise<Item[]> {
  // TODO: Replace with db.select().from(schema.items)
  return items;
}

export async function createItem(data: CreateItemInput): Promise<Item> {
  // TODO: Replace with db.insert(schema.items).values(data)
  const newItem = { id: generateId(), ...data };
  items.push(newItem);
  return newItem;
}
```

### Migrating to Database

To connect a server action to the actual database:

1. Import the db client: `import { db } from '@schutzkompass/db';`
2. Import the schema: `import { items } from '@schutzkompass/db/schema';`
3. Replace in-memory reads: `const results = await db.select().from(items);`
4. Replace in-memory writes: `await db.insert(items).values(data);`
5. Remove the in-memory array and sample data.

---

## 7. Services

Business logic services in `apps/web/lib/services/`:

### NIS2 Applicability Service

**File:** `nis2-applicability.ts`

Implements the NIS2 decision tree:
- Takes sector, sub-sector, employee count, annual revenue
- Determines if the organization falls under NIS2
- Classifies as "essential" or "important" entity
- Returns applicable obligations

### CRA Classifier Service

**File:** `cra-classifier.ts`

Classifies digital products according to CRA categories:
- **Standard** — Default, self-assessment possible
- **Important Class I** — Enhanced requirements, self-assessment with standards
- **Important Class II** — Third-party conformity assessment required
- **Critical** — European cybersecurity certification required

### Risk Scoring Service

**File:** `risk-scoring.ts`

Implements a 5×5 risk matrix:
- Input: `{ likelihood: 1-5, impact: 1-5 }`
- Output: `{ score: number, riskLevel: 'low' | 'medium' | 'high' | 'critical' }`
- Score = likelihood × impact
- Thresholds: low (1–4), medium (5–9), high (10–16), critical (17–25)

---

## 8. Authentication

### Configuration

Auth is configured in `apps/web/lib/auth.ts` using **NextAuth.js v5 (beta)**:

- **Provider:** Credentials (email + password)
- **Session strategy:** JWT
- **Password hashing:** bcryptjs
- **Adapter:** Drizzle adapter for NextAuth

### Session Helpers

`apps/web/lib/session.ts` provides utilities:
- `getSession()` — Get the current user session
- `requireAuth()` — Redirect to login if unauthenticated

### Auth Routes

| Route | Purpose |
|---|---|
| `/login` | Login page |
| `/register` | Registration page |
| `/api/auth/*` | NextAuth API routes (automatic) |

---

## 9. Database

### Technology

- **RDBMS:** PostgreSQL 16 (Alpine)
- **ORM:** Drizzle ORM 0.38
- **Driver:** `postgres` (postgres.js)

### Schema Overview

The database has **17 tables** across 13 schema files:

```
┌──────────────────────┐     ┌──────────────────────┐
│    organisations     │────▸│       users           │
└──────────────────────┘     └──────────────────────┘
                                      │
                             ┌────────┼────────┐
                             ▼        ▼        ▼
                         sessions  accounts  verificationTokens
                                      
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    assets    │  │   products   │  │  suppliers   │
└──────────────┘  └──────────────┘  └──────────────┘
                        │                   │
                   ┌────┴────┐    questionnaireResponses
                   ▼         ▼
              ┌────────┐  ┌──────────────────┐
              │ sboms  │  │ vulnerabilities  │
              └────────┘  └──────────────────┘
                   │
              sbomComponents

┌──────────────────────┐  ┌──────────────────────┐
│   riskAssessments    │  │      controls        │
└──────────────────────┘  └──────────────────────┘
         │
    riskEntries

┌──────────────────────┐  ┌──────────────────────┐
│     incidents        │  │ conformityDocuments  │
└──────────────────────┘  └──────────────────────┘
         │
   incidentTimeline

┌──────────────────────┐
│      auditLog        │
└──────────────────────┘
```

### Adding a New Table

1. Create a new schema file in `packages/db/src/schema/`:
   ```typescript
   import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
   
   export const myTable = pgTable('my_table', {
     id: uuid('id').defaultRandom().primaryKey(),
     name: text('name').notNull(),
     createdAt: timestamp('created_at').defaultNow().notNull(),
   });
   ```

2. Export it from `packages/db/src/schema/index.ts`:
   ```typescript
   export { myTable } from './my-table';
   ```

3. Generate and apply the migration:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

---

## 10. UI & Styling

### Design System

| Property | Value |
|---|---|
| **Primary Color** | `#1e3a5f` (Deep Blue) |
| **Accent Color** | `#0d9488` (Teal) |
| **Border Radius** | 8px (`rounded-lg`) |
| **Font** | Inter (Google Fonts) |
| **Dark Mode** | Prepared (CSS variables) |

### Component Library

All UI components are based on **shadcn/ui** in `packages/ui/`. Additional components are added as needed using:

```bash
cd packages/ui
npx shadcn@latest add <component-name>
```

### Tailwind CSS v4

The project uses **Tailwind CSS v4** with PostCSS:
- Config: `@tailwindcss/postcss` plugin
- Global styles: `apps/web/app/globals.css`
- Utility: `cn()` function from `@schutzkompass/ui` (clsx + tailwind-merge)

### Chart Components

Located in `apps/web/components/charts/`:

| Component | Library | Usage |
|---|---|---|
| `ComplianceDonut` | Recharts `PieChart` | Dashboard compliance overview |
| `RiskHeatmapChart` | Recharts `ScatterChart` | 5×5 risk matrix visualization |

### Icons

All icons come from **Lucide React** (`lucide-react`). Import example:

```typescript
import { Shield, AlertTriangle, Package } from 'lucide-react';
```

---

## 11. Environment Variables

All environment variables are documented in `.env.example`:

### Required

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/schutzkompass` |
| `AUTH_SECRET` | NextAuth.js secret (≥32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical app URL | `http://localhost:3000` |

### Optional — Infrastructure

| Variable | Description | Default |
|---|---|---|
| `REDIS_URL` | Redis connection for BullMQ | `redis://localhost:6379` |
| `S3_ENDPOINT` | MinIO/S3 endpoint | `http://localhost:9000` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` |
| `S3_BUCKET` | S3 bucket name | `schutzkompass` |

### Optional — Integrations

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for emails |
| `NVD_API_KEY` | NIST NVD API key for CVE lookups |
| `INTERNAL_TOKEN` | Token for internal service-to-service calls |

---

## 12. Docker & Deployment

### Development (docker-compose.yml)

```bash
# Use docker-compose (v1) or docker compose (v2), whichever is installed
# If Docker requires sudo, prefix with sudo
docker-compose -f docker/docker-compose.yml up -d
```

> **Recommended:** Use `pnpm start:dev` instead — it handles Docker, schema setup, and dev servers automatically.

Services:
| Service | Image | Ports | Volumes |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | `postgres_data` |
| `redis` | `redis:7-alpine` | 6379 | `redis_data` |
| `minio` | `minio/minio:latest` | 9000 (API), 9001 (Console) | `minio_data` |

### Production (docker-compose.prod.yml)

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

Full production stack:

| Service | Description | Ports |
|---|---|---|
| `nginx` | Reverse proxy with security headers, gzip, caching | 80, 443 |
| `web` | Next.js standalone server | 3000 (internal) |
| `worker` | BullMQ background worker | — |
| `postgres` | PostgreSQL 16 | 5432 (internal) |
| `redis` | Redis 7 | 6379 (internal) |
| `minio` | S3-compatible object storage | 9000 (internal) |

All services include:
- **Health checks** with intervals and retries
- **Restart policies** (`unless-stopped`)
- **Named volumes** for data persistence
- **Internal networking** (only nginx exposed publicly)

### Docker Images

#### Web (`docker/Dockerfile.web`)

Multi-stage build:
1. **deps** — Install pnpm dependencies
2. **builder** — Build the Next.js app
3. **runner** — Minimal production image with standalone output

```bash
docker build -f docker/Dockerfile.web -t schutzkompass-web .
```

#### Worker (`docker/Dockerfile.worker`)

Single-stage build for the BullMQ worker:
```bash
docker build -f docker/Dockerfile.worker -t schutzkompass-worker .
```

### Nginx Configuration

`docker/nginx.conf` provides:
- Security headers (X-Frame-Options, CSP, XSS protection, etc.)
- Gzip compression for text/JSON/CSS/JS
- Static asset caching (365 days for `/_next/static/`)
- WebSocket upgrade support
- Max upload size: 50 MB (for SBOM files)
- Health check endpoint passthrough

### Deploying to a Server

1. Copy the project to your server.
2. Create `.env` with production values.
3. Build and start:
   ```bash
   docker-compose -f docker/docker-compose.prod.yml build
   docker-compose -f docker/docker-compose.prod.yml up -d
   ```
4. Run database migrations:
   ```bash
   docker-compose -f docker/docker-compose.prod.yml exec web \
     node -e "require('./packages/db/src/migrate.ts')"
   ```
5. Configure your DNS to point to the server.
6. Add TLS certificates (e.g., via Certbot/Let's Encrypt) to nginx.

---

## 13. CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

The CI pipeline runs on pushes/PRs to `main` and `develop`:

```
┌─────────────────────────┐
│  lint-and-typecheck     │
│  ├── pnpm install       │
│  ├── pnpm type-check    │
│  └── pnpm lint          │
└────────────┬────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌─────────┐   ┌───────────┐
│  build  │   │   test    │
│         │   │  postgres │
│         │   │  redis    │
└────┬────┘   └─────┬─────┘
     │              │
     └──────┬───────┘
            ▼
     ┌─────────────┐
     │   docker    │  (main branch only)
     │  build web  │
     │ build worker│
     └─────────────┘
```

#### Jobs

1. **lint-and-typecheck** — Runs ESLint and TypeScript compiler
2. **build** — Full production build (depends on lint)
3. **test** — Runs tests with PostgreSQL 16 and Redis 7 service containers (depends on lint)
4. **docker** — Builds Docker images (depends on build + test, main branch only)

#### Service Containers

The `test` job spins up:
- **PostgreSQL 16** (`schutzkompass_test` / `test` / `test`)
- **Redis 7** (no auth)

With health checks to ensure services are ready before tests run.

---

## 14. Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm test --filter=@schutzkompass/web
```

### Test Database

Tests use a separate PostgreSQL database (`schutzkompass_test`). Configure via:

```env
DATABASE_URL=postgresql://test:test@localhost:5432/schutzkompass_test
```

Ensure the test database exists:
```bash
docker exec -it schutzkompass-postgres psql -U schutzkompass -c "CREATE DATABASE schutzkompass_test;"
```

---

## 15. Common Tasks

### Add a New Page

1. Create `apps/web/app/(app)/<section>/<page>/page.tsx`
2. Add navigation entry in `apps/web/components/shared/app-sidebar.tsx`
3. Create corresponding server actions in `apps/web/lib/actions/`
4. Add database schema if needed in `packages/db/src/schema/`

### Add a New Server Action

1. Create or edit a file in `apps/web/lib/actions/`
2. Mark with `'use server'` at the top
3. Define input types (Zod schemas recommended)
4. Implement the logic
5. Import and use from page components

### Add a New UI Component (shadcn)

```bash
cd packages/ui
npx shadcn@latest add dialog   # Example: add Dialog component
```

Then import from `@schutzkompass/ui`:
```typescript
import { Dialog, DialogContent } from '@schutzkompass/ui';
```

### Add a New Compliance Data File

1. Create JSON in `packages/compliance-content/src/`
2. Export from `packages/compliance-content/src/index.ts`
3. Import in consuming packages:
   ```typescript
   import sectors from '@schutzkompass/compliance-content/nis2/sectors.json';
   ```

### Update Database Schema

1. Edit the schema file in `packages/db/src/schema/`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:migrate`
4. Update corresponding server actions

### Clean Build Artifacts

```bash
pnpm clean
```

This removes `.next/`, `.turbo/`, and `dist/` from all packages.

---

## 16. Architecture Decisions

### Why Turborepo Monorepo?

- Shared types and validators between frontend and backend
- Single dependency management with pnpm workspaces
- Parallel builds with caching
- Easy code sharing between web app and worker

### Why Server Actions (not API routes)?

- Tight integration with React Server Components
- Type-safe end-to-end (no separate API layer)
- Automatic request deduplication
- Simpler mental model for CRUD operations

### Why In-Memory Stores (current state)?

- Rapid prototyping without database setup
- All server actions have `TODO` comments for DB migration
- Sample data included for immediate UI development
- Migration path is straightforward (see [Section 6](#6-server-actions))

### Why Drizzle ORM?

- TypeScript-first with full type inference
- SQL-like API (no magic, predictable queries)
- Lightweight compared to Prisma
- Built-in migration tooling
- Compatible with postgres.js driver

### Why NextAuth v5 Beta?

- Native App Router support
- Edge runtime compatible
- JWT sessions (no DB session store needed)
- Drizzle adapter available

### Why shadcn/ui?

- Not a dependency — components are copied into the project
- Full control and customization
- Built on Radix UI (accessible, composable)
- Tailwind CSS integration
- Active community and ecosystem

---

## 17. Known Limitations & TODOs

### Critical — Must Fix Before Production

| Item | Description | Location |
|---|---|---|
| **In-memory data stores** | All server actions use arrays instead of DB. Must migrate to Drizzle queries. | `apps/web/lib/actions/*.ts` |
| **No rate limiting** | Auth endpoints lack rate limiting | `apps/web/lib/actions/auth.ts` |
| **No CSRF protection** | Server actions need CSRF tokens in production | Global |
| **No input sanitization** | User inputs should be sanitized beyond Zod validation | Server actions |
| **No file upload** | S3/MinIO integration not yet implemented | Evidence uploads, SBOM import |

### Important — Should Fix

| Item | Description |
|---|---|
| **No e-mail sending** | Resend integration configured but not active |
| **No NVD API integration** | CVE data is sample data, not fetched from NIST |
| **No SBOM import/export** | CycloneDX/SPDX parsing not implemented |
| **No audit logging** | `auditLog` table exists but no writes |
| **No real-time notifications** | No WebSocket/SSE for live updates |
| **Worker not implemented** | BullMQ worker shell exists but no jobs defined |
| **No i18n** | UI is German-only, no language switching |

### Nice to Have

| Item | Description |
|---|---|
| **Dark mode** | CSS variables prepared but toggle not built |
| **PDF export** | Reports and documents as PDF |
| **Multi-tenancy** | Organisation-scoped data isolation |
| **2FA** | Two-factor authentication |
| **SSO** | SAML/OIDC enterprise login |

---

## 18. Troubleshooting

### Common Issues

#### `pnpm install` fails

```bash
# Ensure pnpm is enabled via corepack
corepack enable pnpm

# Clear pnpm cache
pnpm store prune

# Retry
pnpm install
```

#### Database connection refused

```bash
# Check if PostgreSQL is running
docker-compose -f docker/docker-compose.yml ps

# Restart services
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d

# Verify connection
docker exec -it docker_db_1 psql -U schutzkompass -c "SELECT 1;"
```

> **Note:** If Docker requires `sudo` on your system, prefix all Docker/docker-compose commands with `sudo`.
> Alternatively, use `pnpm start:dev` which handles this automatically.

#### Port 3000 already in use

```bash
# Find the process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

#### Drizzle migration errors

```bash
# Reset and re-push schema (development only!)
pnpm db:push

# If migrations are out of sync, drop and recreate
docker exec -it schutzkompass-postgres psql -U schutzkompass -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm db:push
```

#### `Module not found` errors after adding a package

```bash
# Clean and reinstall
pnpm clean
pnpm install
pnpm dev
```

#### Docker build fails

```bash
# Ensure pnpm-lock.yaml is committed
git add pnpm-lock.yaml
git commit -m "Update lockfile"

# Build with no cache
docker build --no-cache -f docker/Dockerfile.web -t schutzkompass-web .
```

### Useful Commands

```bash
# ── Quick Start (everything in one command) ──
pnpm start:dev

# Check TypeScript errors across all packages
pnpm type-check

# Lint all packages
pnpm lint

# Open Drizzle Studio (DB browser)
cd packages/db && pnpm db:studio

# List all workspace packages
pnpm ls --depth 0 -r

# Run a command in a specific workspace
pnpm --filter @schutzkompass/web <command>

# Check for outdated dependencies
pnpm outdated -r
```

---

> **Questions?** Open an issue in the repository or contact the development team.
