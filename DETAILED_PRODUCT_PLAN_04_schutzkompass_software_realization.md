# SchutzKompass — Software Realization Plan

Concrete technical plan for actually building the product. No business strategy, no market analysis — just how to build it.

---

## Table of Contents

1. [Product Format Decision](#1-product-format-decision)
2. [Technology Stack (Final)](#2-technology-stack-final)
3. [Repository & Project Structure](#3-repository--project-structure)
4. [Database Schema](#4-database-schema)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture & UI Design](#6-frontend-architecture--ui-design)
7. [User Flows](#7-user-flows)
8. [Page-by-Page UI Specification](#8-page-by-page-ui-specification)
9. [SBOM Processing Pipeline](#9-sbom-processing-pipeline)
10. [Vulnerability Monitoring Pipeline](#10-vulnerability-monitoring-pipeline)
11. [Document Generation System](#11-document-generation-system)
12. [Authentication & Multi-Tenancy](#12-authentication--multi-tenancy)
13. [External Integrations](#13-external-integrations)
14. [Infrastructure & Deployment](#14-infrastructure--deployment)
15. [Development Sprint Plan](#15-development-sprint-plan)

---

## 1. Product Format Decision

### Web Application (not desktop, not mobile)

**Decision**: Browser-based web application, deployed as a self-hosted Docker setup on German cloud infrastructure.

**Reasons**:
- Target users (IT-Leiter, Compliance Officer, Geschäftsführer) work from desktop browsers during business hours
- Multi-user collaboration is essential (assign tasks, share evidence, supplier portal)
- No offline capability needed — compliance work happens with internet access
- Avoids app store gatekeeping and platform-specific development
- Updates ship instantly, no user-side installation
- Supplier portal (external users filling questionnaires) must be browser-accessible

**NOT a SPA on Vercel/Netlify**: Because this is a multi-tenant B2B application with server-side data processing (SBOM parsing, vulnerability scanning, PDF generation), it needs a real backend. Next.js gives us both the frontend and API routes in one deployable unit, which simplifies the architecture significantly for a small team.

**NOT a desktop application**: No reason to. The product is forms, dashboards, document generation, and task management. All things browsers excel at. No hardware access, no GPU, no filesystem access needed.

**NOT mobile-first**: The primary interaction is filling out assessments, managing policies, reviewing risk tables. These are keyboard-heavy, table-heavy workflows. Mobile would be a secondary concern (notification checking at most).

---

## 2. Technology Stack (Final)

### Core Application

| Component | Technology | Version | Why This and Not Something Else |
|---|---|---|---|
| **Framework** | **Next.js** (App Router) | 16.x | Full-stack in one repo. Server Components for data-heavy pages. API Routes for backend logic. Server Actions for form submissions. SSR for initial load performance. Self-hostable with `output: 'standalone'`. Avoids needing a separate backend framework entirely. |
| **Language** | **TypeScript** | 5.x | Type safety across frontend and backend. Shared types between API and UI. Catches bugs at compile time. |
| **UI Components** | **shadcn/ui** + **Radix UI** + **Tailwind CSS v4** | Latest | shadcn/ui gives actual component code we own and can modify. Not a dependency — it's our code. Radix handles accessibility (ARIA). Tailwind for utility-first styling. No CSS-in-JS runtime overhead. |
| **Forms** | **React Hook Form** + **Zod** | Latest | React Hook Form for performant form state (no re-renders on every keystroke — critical for 40-question supplier questionnaires). Zod for schema validation shared between client and server. |
| **Tables** | **TanStack Table** (React Table v8) | Latest | The standard for complex data tables with sorting, filtering, pagination, column resizing. Needed for asset inventories, vulnerability lists, supplier tables, SBOM component lists. Headless — we control rendering. |
| **Charts** | **Recharts** | Latest | Simple, React-native charting. For compliance percentage donuts, vulnerability trends, risk heatmaps. Good enough — we're not building a BI tool. |
| **State Management** | **Server Components + URL state + React Context** | — | No Redux, no Zustand. Server Components fetch data on the server. URL search params for filters/pagination (shareable links). React Context only for truly client-side state (sidebar open/closed, modal state). |
| **Date handling** | **date-fns** | Latest | Lightweight, tree-shakeable. For deadline calculations (24h/72h/30d timers), certificate expiry tracking. |
| **PDF Generation** | **@react-pdf/renderer** (client-triggered) + **Puppeteer** (server-side for complex reports) | Latest | @react-pdf for simple documents (declarations of conformity, checklists). Puppeteer for pixel-perfect complex reports (management summaries with charts, audit packages). |
| **Rich Text Editing** | **Tiptap** | Latest | For policy document editing, incident descriptions, risk treatment text. Block-based, extensible, good German language support. Not a full word processor — just structured rich text. |
| **Icons** | **Lucide React** | Latest | Consistent, open-source icon set. Ships with shadcn/ui. |
| **Notifications (in-app)** | **Sonner** (toasts) + custom notification center | Latest | Sonner for transient success/error messages. Custom notification center (bell icon) for deadlines, new vulnerabilities, task assignments. |

### Database & Storage

| Component | Technology | Why |
|---|---|---|
| **Primary Database** | **PostgreSQL 16** on Hetzner managed DB or self-hosted | Mature, reliable, excellent JSON support (for flexible metadata), full-text search (for searching across policies/incidents), row-level security (for multi-tenancy). |
| **ORM** | **Drizzle ORM** | Type-safe SQL queries in TypeScript. Generates migrations. Lightweight (no heavy abstraction like Prisma's query engine). Direct SQL when needed. Schema defined in TypeScript = single source of truth. |
| **Migrations** | **Drizzle Kit** | Schema diffing, migration generation, push to DB. |
| **File Storage** | **MinIO** (S3-compatible, self-hosted on Hetzner) | For SBOMs, uploaded evidence files, generated PDFs, policy documents. Self-hosted = German data residency guaranteed. S3 API = standard. |
| **Cache** | **Redis** (Hetzner managed or self-hosted) | Session storage, rate limiting, background job queues (BullMQ). |
| **Search** (Phase 2) | **PostgreSQL full-text search** (initially) → **Meilisearch** (later) | Start with pg_trgm and tsvector. If search becomes a bottleneck or users want fuzzy search across policies/incidents/products, add Meilisearch. |

### Background Processing

| Component | Technology | Why |
|---|---|---|
| **Job Queue** | **BullMQ** (Redis-backed) | For async tasks: SBOM processing, vulnerability scans, PDF generation, email sending, supplier questionnaire reminders. Reliable, has retry logic, priority queues, scheduled/recurring jobs. Runs in the same Node.js process (or separate worker process). |
| **SBOM Tools** | **Syft**, **Trivy**, **Grype**, **cdxgen** | Called as CLI subprocesses from Node.js worker. Each runs in a Docker container (sandboxed). User uploads file → BullMQ job → worker runs Syft/Trivy in container → parses output → stores in DB. |
| **Scheduled Jobs** | **BullMQ repeatable jobs** | Nightly vulnerability scan (match SBOM components against NVD). Weekly supplier questionnaire reminders. Monthly compliance score recalculation. Certificate expiry checks. |

### Email

| Component | Technology | Why |
|---|---|---|
| **Transactional Email** | **Postmark** (EU sending) or **Resend** | Supplier questionnaire invitations, incident alerts, deadline reminders, password resets. Postmark has high deliverability. Resend has better developer experience and React Email templates. |
| **Email Templates** | **React Email** | Build email templates in React/TSX. Renders to HTML email. Same tech as the rest of the app. |

### Authentication

| Component | Technology | Why |
|---|---|---|
| **Auth** | **Better Auth** or **Lucia Auth** (self-hosted) | Self-hosted auth library (no third-party dependency for auth = no external data flow). Email/password, magic links. SAML/OIDC for enterprise SSO (Phase 2). Stores sessions in PostgreSQL or Redis. Simpler than Keycloak (which is Java, heavy to deploy, overkill for MVP). |
| **Alternative** | **NextAuth.js v5** (Auth.js) | If Better Auth/Lucia don't meet needs. NextAuth integrates natively with Next.js. Credentials provider for email/password. Azure AD provider for enterprise SSO. |

---

## 3. Repository & Project Structure

### Monorepo with Turborepo

```
schutzkompass/
├── apps/
│   ├── web/                          # Next.js application (main product)
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/               # Auth route group (login, register, forgot-password)
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── layout.tsx        # Minimal layout (no sidebar)
│   │   │   ├── (app)/                # Main app route group (authenticated)
│   │   │   │   ├── layout.tsx        # App shell: sidebar + top bar
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── organisation/     # NIS2 modules
│   │   │   │   │   ├── betroffenheit/page.tsx    # O1: Applicability check
│   │   │   │   │   ├── risiken/                  # O2: Risk assessment
│   │   │   │   │   │   ├── page.tsx              # Risk overview
│   │   │   │   │   │   ├── [id]/page.tsx         # Single risk detail
│   │   │   │   │   │   └── neu/page.tsx          # New risk assessment
│   │   │   │   │   ├── massnahmen/               # O3: Controls & policies
│   │   │   │   │   │   ├── page.tsx              # Controls overview
│   │   │   │   │   │   ├── richtlinien/page.tsx  # Policy library
│   │   │   │   │   │   └── aufgaben/page.tsx     # Tasks
│   │   │   │   │   ├── lieferkette/              # O4: Supply chain
│   │   │   │   │   │   ├── page.tsx              # Supplier list
│   │   │   │   │   │   ├── [id]/page.tsx         # Supplier detail
│   │   │   │   │   │   └── fragebogen/page.tsx   # Questionnaire editor
│   │   │   │   │   ├── vorfaelle/                # O5: Incident management
│   │   │   │   │   │   ├── page.tsx              # Incident list
│   │   │   │   │   │   ├── [id]/page.tsx         # Incident detail + timeline
│   │   │   │   │   │   └── melden/page.tsx       # New incident wizard
│   │   │   │   │   └── audit/                    # O6: Evidence management
│   │   │   │   │       ├── page.tsx              # Evidence overview
│   │   │   │   │       └── export/page.tsx       # Audit package export
│   │   │   │   ├── produkte/         # CRA modules
│   │   │   │   │   ├── page.tsx                  # Product portfolio overview
│   │   │   │   │   ├── [id]/                     # Single product
│   │   │   │   │   │   ├── page.tsx              # Product dashboard
│   │   │   │   │   │   ├── sbom/page.tsx         # SBOM viewer
│   │   │   │   │   │   ├── schwachstellen/page.tsx # Vulnerabilities
│   │   │   │   │   │   ├── konformitaet/page.tsx # Conformity docs
│   │   │   │   │   │   └── lebenszyklus/page.tsx # Lifecycle
│   │   │   │   │   ├── klassifikation/page.tsx   # P1: Product classifier wizard
│   │   │   │   │   └── meldungen/page.tsx        # P4: ENISA/CSIRT reports
│   │   │   │   ├── einstellungen/    # Settings
│   │   │   │   │   ├── profil/page.tsx
│   │   │   │   │   ├── organisation/page.tsx
│   │   │   │   │   ├── benutzer/page.tsx
│   │   │   │   │   └── integrationen/page.tsx
│   │   │   │   └── hilfe/page.tsx    # Help center
│   │   │   ├── (supplier)/           # Supplier portal (separate layout, no sidebar)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── fragebogen/[token]/page.tsx  # Supplier fills questionnaire
│   │   │   ├── (public)/             # Public pages
│   │   │   │   ├── betroffenheits-check/page.tsx # Free applicability check (lead gen)
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                  # API routes (for webhooks, external integrations)
│   │   │   │   ├── webhooks/
│   │   │   │   ├── v1/              # Versioned public API (Phase 2)
│   │   │   │   └── cron/            # Cron endpoint (triggered by external scheduler)
│   │   │   ├── layout.tsx            # Root layout (html, body, fonts, providers)
│   │   │   └── globals.css
│   │   ├── components/               # UI components specific to web app
│   │   │   ├── dashboard/
│   │   │   ├── risk-assessment/
│   │   │   ├── sbom/
│   │   │   ├── incidents/
│   │   │   ├── suppliers/
│   │   │   └── shared/
│   │   ├── lib/                      # App-specific utilities
│   │   │   ├── auth.ts               # Auth configuration
│   │   │   ├── db.ts                 # Database client
│   │   │   ├── s3.ts                 # MinIO/S3 client
│   │   │   ├── email.ts             # Email sending
│   │   │   └── queue.ts             # BullMQ queue setup
│   │   ├── server/                   # Server-side code
│   │   │   ├── actions/             # Server Actions (form submissions)
│   │   │   │   ├── risk-actions.ts
│   │   │   │   ├── incident-actions.ts
│   │   │   │   ├── supplier-actions.ts
│   │   │   │   ├── product-actions.ts
│   │   │   │   └── sbom-actions.ts
│   │   │   ├── queries/             # Database queries (Server Components call these)
│   │   │   │   ├── risk-queries.ts
│   │   │   │   ├── incident-queries.ts
│   │   │   │   └── product-queries.ts
│   │   │   └── services/            # Business logic
│   │   │       ├── nis2-applicability.ts
│   │   │       ├── cra-classifier.ts
│   │   │       ├── risk-scoring.ts
│   │   │       ├── vulnerability-matcher.ts
│   │   │       └── compliance-calculator.ts
│   │   ├── public/
│   │   │   └── templates/           # Downloadable policy templates (.docx)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── worker/                       # Background job worker (separate process)
│       ├── src/
│       │   ├── index.ts              # Worker entry point, BullMQ processor
│       │   ├── jobs/
│       │   │   ├── sbom-generate.ts  # Run Syft/Trivy, parse output
│       │   │   ├── sbom-parse.ts     # Parse uploaded SBOM file
│       │   │   ├── vuln-scan.ts      # Match components against NVD/OSV
│       │   │   ├── pdf-generate.ts   # Generate PDF reports
│       │   │   ├── email-send.ts     # Send emails via Postmark/Resend
│       │   │   └── reminder.ts       # Questionnaire/deadline reminders
│       │   └── integrations/
│       │       ├── nvd.ts            # NVD API v2 client
│       │       ├── osv.ts            # OSV.dev API client
│       │       ├── syft.ts           # Syft CLI wrapper
│       │       ├── trivy.ts          # Trivy CLI wrapper
│       │       └── grype.ts          # Grype CLI wrapper
│       ├── Dockerfile                # Worker container (includes Syft, Trivy, Grype)
│       └── package.json
│
├── packages/
│   ├── db/                           # Shared database schema & client
│   │   ├── src/
│   │   │   ├── schema/              # Drizzle schema definitions
│   │   │   │   ├── organisations.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── assets.ts
│   │   │   │   ├── risks.ts
│   │   │   │   ├── controls.ts
│   │   │   │   ├── policies.ts
│   │   │   │   ├── suppliers.ts
│   │   │   │   ├── incidents.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── sboms.ts
│   │   │   │   ├── vulnerabilities.ts
│   │   │   │   ├── conformity-documents.ts
│   │   │   │   ├── audit-log.ts
│   │   │   │   └── index.ts         # Re-exports all schemas
│   │   │   ├── client.ts            # Drizzle client factory
│   │   │   └── migrate.ts           # Migration runner
│   │   ├── drizzle/                  # Generated migrations
│   │   └── package.json
│   │
│   ├── ui/                           # Shared UI components (shadcn/ui based)
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── data-table.tsx        # Reusable TanStack Table wrapper
│   │   │   ├── form.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── status-badge.tsx      # Traffic light badges
│   │   │   ├── compliance-gauge.tsx  # Circular percentage indicator
│   │   │   ├── timeline.tsx          # For incident timelines
│   │   │   ├── wizard.tsx            # Multi-step form wizard
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── compliance-content/           # Regulatory content (separated from code)
│   │   ├── nis2/
│   │   │   ├── sectors.json          # NIS2 sector definitions for applicability check
│   │   │   ├── threats.json          # BSI threat catalog
│   │   │   ├── controls.json         # NIS2 Art. 21 controls mapped to BSI Grundschutz
│   │   │   ├── policies/            # Policy template metadata
│   │   │   │   ├── index.json
│   │   │   │   └── templates/       # .docx templates
│   │   │   └── incident-templates.json # BSI reporting templates
│   │   ├── cra/
│   │   │   ├── product-categories.json # Implementing Reg. 2025/2392 categories
│   │   │   ├── essential-requirements.json # Annex I requirements
│   │   │   ├── annex-vii-template.json # Tech doc structure
│   │   │   └── conformity-checklists.json
│   │   └── package.json
│   │
│   └── shared/                       # Shared types, constants, utils
│       ├── src/
│       │   ├── types.ts              # Shared TypeScript types
│       │   ├── constants.ts          # Risk levels, severity levels, etc.
│       │   └── validators.ts         # Shared Zod schemas
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml            # Local development
│   ├── docker-compose.prod.yml       # Production
│   ├── Dockerfile.web                # Next.js app container
│   ├── Dockerfile.worker             # Background worker container
│   └── nginx.conf                    # Reverse proxy config
│
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   └── development.md
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
└── .env.example
```

### Why This Structure

- **Monorepo (Turborepo + pnpm)**: One repo for everything. Shared types and schemas between web app and worker. Coordinated deployments. For a team of 3-5 developers, a monorepo avoids the overhead of managing multiple repos.
- **`packages/db`**: Database schema is its own package so both `apps/web` and `apps/worker` import the same schema. Change a table in one place, both apps get the update.
- **`packages/compliance-content`**: Regulatory content (sector lists, control catalogs, policy templates) lives separately from code. The compliance specialist edits JSON files and .docx templates without touching application code. Content updates don't require code changes.
- **`apps/worker`**: Background jobs run as a separate Node.js process (or container). This keeps the web server responsive. The worker can be scaled independently.

---

## 4. Database Schema

### Core Tables (Drizzle ORM TypeScript definitions)

```typescript
// packages/db/src/schema/organisations.ts

export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  hrbNumber: varchar('hrb_number', { length: 50 }),        // Handelsregister
  naceCodes: jsonb('nace_codes').$type<string[]>(),         // NACE sector codes
  employeeCount: integer('employee_count'),
  annualRevenue: numeric('annual_revenue'),                 // in EUR
  nis2EntityType: varchar('nis2_entity_type', { length: 20 }), // 'essential' | 'important' | 'not_applicable' | null
  nis2Applicable: boolean('nis2_applicable'),
  craApplicable: boolean('cra_applicable'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// packages/db/src/schema/users.ts

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 30 }).notNull(),          // 'admin' | 'compliance_officer' | 'viewer' | 'auditor'
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// packages/db/src/schema/assets.ts

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),          // 'server' | 'endpoint' | 'network' | 'cloud' | 'ot_device' | 'application'
  description: text('description'),
  criticality: varchar('criticality', { length: 20 }),      // 'critical' | 'high' | 'medium' | 'low'
  owner: varchar('owner', { length: 255 }),
  location: varchar('location', { length: 255 }),
  metadata: jsonb('metadata'),                              // flexible fields per asset type
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// packages/db/src/schema/risks.ts

export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),      // 'draft' | 'in_progress' | 'completed' | 'archived'
  assessorId: uuid('assessor_id').references(() => users.id),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const riskEntries = pgTable('risk_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => riskAssessments.id).notNull(),
  assetId: uuid('asset_id').references(() => assets.id),
  threatDescription: text('threat_description').notNull(),
  threatCategory: varchar('threat_category', { length: 100 }), // BSI elementary threat category
  likelihood: integer('likelihood').notNull(),               // 1-5
  impact: integer('impact').notNull(),                       // 1-5
  riskLevel: varchar('risk_level', { length: 20 }),          // computed: 'critical' | 'high' | 'medium' | 'low' | 'negligible'
  treatment: varchar('treatment', { length: 20 }),           // 'accept' | 'mitigate' | 'transfer' | 'avoid'
  treatmentDescription: text('treatment_description'),
  controlIds: jsonb('control_ids').$type<string[]>(),        // linked BSI Grundschutz controls
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// packages/db/src/schema/products.ts

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }),
  version: varchar('version', { length: 100 }),
  description: text('description'),
  productType: varchar('product_type', { length: 20 }),     // 'hardware' | 'software' | 'combined'
  hasSoftware: boolean('has_software'),
  hasNetworkConnection: boolean('has_network_connection'),
  craCategory: varchar('cra_category', { length: 30 }),     // 'default' | 'important_class_I' | 'important_class_II' | 'critical' | 'out_of_scope'
  conformityPathway: varchar('conformity_pathway', { length: 30 }), // 'module_a' | 'module_b_c' | 'module_h'
  supportPeriodStart: date('support_period_start'),
  supportPeriodEnd: date('support_period_end'),
  ceMarkingApplied: boolean('ce_marking_applied').default(false),
  complianceScore: integer('compliance_score'),              // 0-100
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// packages/db/src/schema/sboms.ts

export const sboms = pgTable('sboms', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  version: varchar('version', { length: 100 }),             // e.g. "v2.3.1" firmware version
  format: varchar('format', { length: 20 }).notNull(),      // 'spdx' | 'cyclonedx'
  source: varchar('source', { length: 20 }).notNull(),      // 'uploaded' | 'generated_syft' | 'generated_trivy' | 'generated_cdxgen' | 'manual'
  componentCount: integer('component_count'),
  filePath: varchar('file_path', { length: 500 }),          // S3 key for original file
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sbomComponents = pgTable('sbom_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  sbomId: uuid('sbom_id').references(() => sboms.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 100 }),
  supplier: varchar('supplier', { length: 255 }),
  license: varchar('license', { length: 100 }),
  cpe: varchar('cpe', { length: 500 }),                     // Common Platform Enumeration
  purl: varchar('purl', { length: 500 }),                   // Package URL
  type: varchar('type', { length: 50 }),                    // 'library' | 'framework' | 'os' | 'firmware' | 'application'
});

// packages/db/src/schema/vulnerabilities.ts

export const vulnerabilities = pgTable('vulnerabilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentId: uuid('component_id').references(() => sbomComponents.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  cveId: varchar('cve_id', { length: 30 }),
  cvssScore: numeric('cvss_score'),
  severity: varchar('severity', { length: 20 }),            // 'critical' | 'high' | 'medium' | 'low' | 'info'
  description: text('description'),
  exploitAvailable: boolean('exploit_available').default(false),
  status: varchar('status', { length: 20 }).notNull(),      // 'open' | 'triaged' | 'in_progress' | 'fixed' | 'accepted' | 'false_positive'
  assignedTo: uuid('assigned_to').references(() => users.id),
  targetFixVersion: varchar('target_fix_version', { length: 100 }),
  firstDetectedAt: timestamp('first_detected_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  acceptedJustification: text('accepted_justification'),    // if status = 'accepted', why
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// packages/db/src/schema/suppliers.ts

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  riskClass: varchar('risk_class', { length: 20 }),         // 'critical' | 'important' | 'standard'
  riskScore: integer('risk_score'),                          // 0-100 computed from questionnaire
  questionnaireStatus: varchar('questionnaire_status', { length: 20 }), // 'not_sent' | 'sent' | 'in_progress' | 'completed' | 'overdue'
  questionnaireToken: varchar('questionnaire_token', { length: 64 }), // for supplier portal access
  questionnaireSentAt: timestamp('questionnaire_sent_at'),
  questionnaireCompletedAt: timestamp('questionnaire_completed_at'),
  iso27001CertExpiry: date('iso27001_cert_expiry'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questionnaireResponses = pgTable('questionnaire_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
  questionKey: varchar('question_key', { length: 100 }).notNull(),
  answer: varchar('answer', { length: 20 }),                // 'yes' | 'no' | 'partial' | 'not_applicable'
  comment: text('comment'),
  evidenceFilePath: varchar('evidence_file_path', { length: 500 }),
  answeredAt: timestamp('answered_at'),
});

// packages/db/src/schema/incidents.ts

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(),          // 'nis2_organisational' | 'cra_vulnerability' | 'cra_incident'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  severity: varchar('severity', { length: 20 }),            // 'critical' | 'high' | 'medium' | 'low'
  status: varchar('status', { length: 30 }).notNull(),      // 'detected' | 'early_warning_sent' | 'notification_sent' | 'final_report_sent' | 'closed'
  detectedAt: timestamp('detected_at').notNull(),
  earlyWarningSentAt: timestamp('early_warning_sent_at'),   // 24h deadline
  notificationSentAt: timestamp('notification_sent_at'),    // 72h deadline
  finalReportSentAt: timestamp('final_report_sent_at'),     // 30d (NIS2) or 14d (CRA vuln) deadline
  affectedProductIds: jsonb('affected_product_ids').$type<string[]>(), // for CRA incidents
  reportedById: uuid('reported_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const incidentTimeline = pgTable('incident_timeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  action: varchar('action', { length: 100 }).notNull(),     // 'detected' | 'escalated' | 'bsi_notified' | 'contained' | 'resolved' | 'note'
  description: text('description'),
  userId: uuid('user_id').references(() => users.id),
  attachmentPath: varchar('attachment_path', { length: 500 }),
});

// packages/db/src/schema/audit-log.ts

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(),      // 'create' | 'update' | 'delete' | 'export' | 'login'
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'risk' | 'incident' | 'supplier' | 'product' | 'sbom' | 'policy'
  entityId: uuid('entity_id'),
  details: jsonb('details'),                                 // what changed (old/new values)
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// packages/db/src/schema/controls.ts (NIS2 controls / measures)

export const controls = pgTable('controls', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  nis2Article: varchar('nis2_article', { length: 20 }),     // e.g. 'art21_2a', 'art21_2b'
  bsiGrundschutzId: varchar('bsi_grundschutz_id', { length: 20 }), // e.g. 'SYS.1.1'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull(),      // 'not_started' | 'in_progress' | 'implemented' | 'verified'
  priority: varchar('priority', { length: 20 }),            // 'must' | 'should' | 'nice_to_have'
  assignedTo: uuid('assigned_to').references(() => users.id),
  dueDate: date('due_date'),
  evidence: text('evidence'),                               // description of evidence
  evidenceFilePath: varchar('evidence_file_path', { length: 500 }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Multi-Tenancy Strategy

**Row-Level Security (RLS)** via `organisationId` on every table:
- Every query includes `WHERE organisation_id = $currentUserOrgId`
- Enforced at the ORM level: a `withOrgScope(orgId)` wrapper that automatically adds the filter
- PostgreSQL RLS policies as a second line of defense (belt + suspenders)
- No shared data between tenants — complete isolation
- Audit log and audit trail cannot be deleted, even by admins

---

## 5. Backend Architecture

### No Separate Backend Framework

Next.js handles everything:

```
Client Browser
    │
    ├── Page requests → Next.js Server Components (SSR, data fetching via Drizzle)
    ├── Form submissions → Next.js Server Actions (validated with Zod, executed on server)
    ├── File uploads → Next.js API Routes (/api/upload/sbom, /api/upload/evidence)
    └── Webhooks → Next.js API Routes (/api/webhooks/...)

Next.js Server
    │
    ├── Drizzle ORM → PostgreSQL (all reads/writes)
    ├── MinIO Client → S3 (file storage)
    ├── BullMQ → Redis → Worker Process (async jobs)
    └── Resend/Postmark SDK → Email

Worker Process (separate container)
    │
    ├── BullMQ Consumer → processes jobs from Redis queue
    ├── Syft/Trivy/Grype CLIs (containerized)
    ├── NVD/OSV API clients
    └── Puppeteer (PDF generation)
```

### Server Actions (Form Handling Pattern)

Every form submission uses a Next.js Server Action:

```typescript
// server/actions/risk-actions.ts
'use server'

import { z } from 'zod'
import { db } from '@schutzkompass/db'
import { riskEntries } from '@schutzkompass/db/schema'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

const createRiskEntrySchema = z.object({
  assessmentId: z.string().uuid(),
  threatDescription: z.string().min(10).max(2000),
  threatCategory: z.string(),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  treatment: z.enum(['accept', 'mitigate', 'transfer', 'avoid']),
  treatmentDescription: z.string().optional(),
})

export async function createRiskEntry(formData: z.infer<typeof createRiskEntrySchema>) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const validated = createRiskEntrySchema.parse(formData)

  const riskLevel = calculateRiskLevel(validated.likelihood, validated.impact)

  const [entry] = await db.insert(riskEntries).values({
    ...validated,
    riskLevel,
  }).returning()

  await logAuditEvent(user, 'create', 'risk', entry.id)
  revalidatePath('/organisation/risiken')

  return { success: true, id: entry.id }
}
```

### Server Components (Data Fetching Pattern)

Pages fetch data directly on the server — no API calls, no loading spinners for initial data:

```typescript
// app/(app)/organisation/risiken/page.tsx

import { db } from '@schutzkompass/db'
import { riskAssessments, riskEntries } from '@schutzkompass/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { RiskOverviewTable } from '@/components/risk-assessment/risk-overview-table'
import { RiskHeatmap } from '@/components/risk-assessment/risk-heatmap'

export default async function RisikenPage() {
  const user = await getCurrentUser()

  const assessments = await db.select()
    .from(riskAssessments)
    .where(eq(riskAssessments.organisationId, user.organisationId))
    .orderBy(desc(riskAssessments.createdAt))

  const entries = await db.select()
    .from(riskEntries)
    .where(/* ... */)

  return (
    <div className="space-y-6">
      <PageHeader title="Risikobewertung" description="Übersicht Ihrer identifizierten Risiken" />
      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Kritische Risiken" value={criticalCount} variant="destructive" />
        <StatsCard title="Hohe Risiken" value={highCount} variant="warning" />
        <StatsCard title="Maßnahmen offen" value={openControlsCount} variant="info" />
      </div>
      <RiskHeatmap entries={entries} />
      <RiskOverviewTable assessments={assessments} entries={entries} />
    </div>
  )
}
```

---

## 6. Frontend Architecture & UI Design

### Design System

**Visual Language**:
- Clean, professional, German corporate aesthetic
- Color palette:
  - Primary: Deep blue (#1e3a5f) — trust, security, professionalism
  - Accent: Teal (#0d9488) — modern, differentiated from the "enterprise gray" competitors
  - Backgrounds: White + Light gray (#f8fafc)
  - Status colors: Red (#dc2626) for critical/overdue, Orange (#f59e0b) for warning, Green (#16a34a) for completed/compliant, Blue (#2563eb) for informational
- Typography: Inter (clean, readable, free, excellent German character support including Umlauts)
- Spacing: 4px grid system (Tailwind default)
- Border radius: 8px (rounded-lg) — modern but not bubbly
- Shadows: Subtle (shadow-sm on cards)

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│  Top Bar (56px)                                                        │
│  ┌──────────┬──────────────────────────────────────────┬──────────┐   │
│  │ Logo     │  Breadcrumb: Dashboard > Risikobewertung │ 🔔 👤   │   │
│  └──────────┴──────────────────────────────────────────┴──────────┘   │
├──────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar      │  Main Content Area                                      │
│ (240px,      │                                                         │
│  collapsible │  ┌─────────────────────────────────────────────────┐   │
│  to 60px)    │  │ Page Header + Actions                           │   │
│              │  ├─────────────────────────────────────────────────┤   │
│ ┌──────────┐ │  │                                                 │   │
│ │ 🏠 Dash  │ │  │  Stats Cards Row                               │   │
│ │          │ │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │   │
│ │ 🏢 Org   │ │  │  │  12 │ │   4 │ │  28 │ │ 73% │              │   │
│ │  Betroffen│ │  │  │Risi │ │Krit │ │Maßn │ │Comp │              │   │
│ │  Risiken  │ │  │  └─────┘ └─────┘ └─────┘ └─────┘              │   │
│ │  Maßnahm. │ │  │                                                 │   │
│ │  Lieferke.│ │  │  Main Content (tables, forms, charts)          │   │
│ │  Vorfälle │ │  │                                                 │   │
│ │  Audit    │ │  │                                                 │   │
│ │          │ │  │                                                 │   │
│ │ 📦 Prod  │ │  │                                                 │   │
│ │  Inventar │ │  │                                                 │   │
│ │  SBOMs    │ │  │                                                 │   │
│ │  Schwachst│ │  │                                                 │   │
│ │  Meldungen│ │  │                                                 │   │
│ │  Konform. │ │  │                                                 │   │
│ │          │ │  │                                                 │   │
│ │ ⚙ Einst. │ │  │                                                 │   │
│ │ ❓ Hilfe  │ │  │                                                 │   │
│ └──────────┘ │  └─────────────────────────────────────────────────┘   │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### Sidebar Navigation Structure

```
📊 Dashboard

🏢 ORGANISATION (NIS2)
   ├── Betroffenheits-Check
   ├── Risikobewertung
   │   ├── Übersicht
   │   └── Asset-Inventar
   ├── Maßnahmen & Richtlinien
   │   ├── Maßnahmen-Tracker
   │   ├── Richtlinien-Bibliothek
   │   └── Aufgaben
   ├── Lieferketten-Sicherheit
   ├── Vorfallmanagement
   └── Audit & Nachweise

📦 PRODUKTE (CRA)
   ├── Produkt-Inventar
   ├── SBOM-Manager
   ├── Schwachstellen-Monitor
   ├── Meldewesen (ENISA/BSI)
   ├── Konformitäts-Dokumentation
   └── Produkt-Lebenszyklus

⚙️ EINSTELLUNGEN
   ├── Organisation
   ├── Benutzer & Rollen
   └── Integrationen

❓ Hilfe & Support
```

### Conditional Sidebar Sections

- If `organisation.nis2Applicable === false`: The "ORGANISATION (NIS2)" section is collapsed/grayed with a message "NIS2 nicht anwendbar. Betroffenheits-Check wiederholen?"
- If `organisation.craApplicable === false`: The "PRODUKTE (CRA)" section is collapsed/grayed with a message "Kein CRA-pflichtiges Produkt erfasst."
- Users only see what's relevant to them.

---

## 7. User Flows

### Flow 1: First-Time Onboarding (10-15 minutes)

```
User visits schutzkompass.de
        │
        ▼
[Landing Page] — "Sind Sie von NIS2 oder CRA betroffen?"
        │ Click: "Kostenlos prüfen" or "Registrieren"
        ▼
[Registration] — Email, password, company name
        │ Verify email
        ▼
[Onboarding Wizard — Step 1: Unternehmensdaten]
  - Company name (pre-filled)
  - Address
  - NACE sector code (dropdown with search, German labels)
  - Employee count (range selector: <50 | 50-250 | 250-1000 | 1000+)
  - Annual revenue (range selector)
  - Group structure (standalone | parent | subsidiary)
        │
        ▼
[Onboarding Wizard — Step 2: NIS2-Betroffenheits-Check]
  Decision tree (6-8 questions):
  1. "In welchem Sektor ist Ihr Unternehmen hauptsächlich tätig?"
     → Shows NIS2 Annex I/II sectors in plain German
     → If sector matches: continue. If not: "NIS2 voraussichtlich nicht anwendbar"
  2. "Wie viele Mitarbeiter hat Ihr Unternehmen?"
  3. "Wie hoch ist der Jahresumsatz?"
  4. "Erbringen Sie Dienste, die für die Aufrechterhaltung kritischer
      gesellschaftlicher oder wirtschaftlicher Tätigkeiten unerlässlich sind?"
  ...
  Result: "Wesentliche Einrichtung" | "Wichtige Einrichtung" | "Nicht betroffen"
        │
        ▼
[Onboarding Wizard — Step 3: CRA-Betroffenheits-Check]
  3 questions:
  1. "Stellen Sie Produkte her, die Software oder Firmware enthalten?"
     → Yes/No
  2. "Können diese Produkte eine Verbindung zu einem Netzwerk oder
      anderen Geräten herstellen?"
     → Yes/No
  3. "Werden diese Produkte auf dem EU-Markt bereitgestellt?"
     → Yes/No
  If all Yes: "Der CRA ist auf Ihre Produkte anwendbar."
  If any No: "Der CRA ist voraussichtlich nicht anwendbar."
        │
        ▼
[Onboarding Wizard — Step 4: Ergebnis & Empfehlung]
  Shows personalized result card:
  ┌──────────────────────────────────────────┐
  │  🏢 NIS2: Wichtige Einrichtung          │
  │  📦 CRA: Anwendbar                      │
  │                                          │
  │  Handlungsbedarf:                        │
  │  • 14 NIS2-Maßnahmen umsetzen           │
  │  • Produkte klassifizieren               │
  │  • SBOM-Management aufbauen              │
  │                                          │
  │  Geschätzte Bearbeitungszeit: 3-6 Monate │
  │                                          │
  │  [PDF herunterladen]  [Jetzt starten]    │
  └──────────────────────────────────────────┘
        │ Click "Jetzt starten"
        ▼
[Dashboard] — personalized with relevant modules highlighted
```

### Flow 2: Risk Assessment (30-60 minutes per assessment)

```
[Risikobewertung > Neue Bewertung]
        │
        ▼
[Step 1: Asset-Auswahl]
  - Select existing assets from inventory or add new ones
  - Group assets by type (IT-Systeme, OT-Systeme, Netzwerk, Cloud, Anwendungen)
  - For each asset: assign criticality (Kritisch/Hoch/Mittel/Gering)
        │
        ▼
[Step 2: Bedrohungsanalyse]
  For each asset (or asset group):
  - System shows pre-populated threats from industry catalog
    (e.g., for "SPS/PLC": firmware manipulation, unauthorized remote access, 
     denial of service, supply chain compromise of control software)
  - User confirms, modifies, or adds custom threats
  - Each threat: rate Likelihood (1-5) and Impact (1-5) via slider or dropdown
  - System calculates risk level with color-coded matrix
  ┌─────────────────────────────────────────────────────┐
  │  Bedrohung: Ransomware-Angriff auf Produktions-IT   │
  │                                                     │
  │  Eintrittswahrscheinlichkeit:  ○ ○ ● ○ ○  (3/5)   │
  │  Schadensausmaß:               ○ ○ ○ ● ○  (4/5)   │
  │                                                     │
  │  Risikolevel: ████ HOCH                             │
  │                                                     │
  │  BSI-Grundschutz Baustein: OPS.1.1.4 Schutz vor    │
  │  Schadprogrammen                                    │
  └─────────────────────────────────────────────────────┘
        │
        ▼
[Step 3: Risikobehandlung]
  For each identified risk (sorted by level, highest first):
  - Treatment selection: Akzeptieren | Reduzieren | Übertragen | Vermeiden
  - If "Reduzieren": suggest matching controls/measures
    (auto-matched from BSI IT-Grundschutz based on threat category)
  - Assign responsible person + deadline
        │
        ▼
[Step 4: Zusammenfassung]
  - Risk register summary table
  - Risk heatmap (5×5 matrix)
  - Treatment plan overview
  - [Export als PDF] [Abschließen]
        │
        ▼
[Risikobewertung Übersicht]
  Updated with new assessment, auto-generates related Maßnahmen (controls)
```

### Flow 3: SBOM Upload & Vulnerability Check (5-10 minutes)

```
[Produkte > [Produkt auswählen] > SBOM]
        │
        ▼
[SBOM-Manager für "SmartSensor Pro v3.2"]
  Two options:
  ┌─────────────────────────────────────────────────────────────────┐
  │  Option A: SBOM hochladen                                      │
  │  Unterstützte Formate: SPDX 2.3 (JSON/TV), CycloneDX 1.5+    │
  │  [📁 Datei auswählen]                                          │
  │                                                                 │
  │  Option B: SBOM generieren lassen                               │
  │  Laden Sie Ihre Firmware-Datei oder Ihren Source-Code-          │
  │  Manifest hoch. Wir generieren die SBOM automatisch.            │
  │  Unterstützt: .bin, .elf, .img, package.json, requirements.txt │
  │  [📁 Firmware/Manifest hochladen]                               │
  └─────────────────────────────────────────────────────────────────┘
        │
        ▼ (file uploaded)
[Processing indicator]
  "SBOM wird verarbeitet... ⏳"
  (BullMQ job: parse SBOM or run Syft → store components → run Grype for vulns)
  (Takes 10-60 seconds depending on file size)
        │
        ▼ (processing complete — page auto-refreshes via polling or SSE)
[SBOM Component View]
  ┌────────────────────────────────────────────────────────────────────────┐
  │ SmartSensor Pro v3.2 — SBOM (CycloneDX 1.5)     147 Komponenten     │
  │ Generiert: 26.03.2026  |  Format: CycloneDX  |  [📥 SBOM Export]    │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 🔍 Suche...     Filter: Alle ▼    Sortierung: Name ▼                │
  ├──────────────────────┬─────────┬───────────┬──────────┬──────────────┤
  │ Komponente           │ Version │ Lizenz    │ Schwachst│ Status       │
  ├──────────────────────┼─────────┼───────────┼──────────┼──────────────┤
  │ busybox              │ 1.35.0  │ GPL-2.0   │ 3 🔴     │ Offen       │
  │ openssl              │ 1.1.1w  │ Apache-2  │ 5 🔴🟠   │ Offen       │
  │ linux-kernel         │ 5.15.0  │ GPL-2.0   │ 12 🔴🟠🟡│ In Arbeit   │
  │ libcurl              │ 7.88.1  │ MIT       │ 1 🟠     │ Offen       │
  │ zlib                 │ 1.2.13  │ Zlib      │ 0 🟢     │ —           │
  │ ...                  │         │           │          │              │
  └──────────────────────┴─────────┴───────────┴──────────┴──────────────┘
  │ Click on "openssl"
  ▼
[Component Detail Panel (slide-in from right)]
  ┌────────────────────────────────────────────────────────────┐
  │ openssl 1.1.1w                                            │
  │ CPE: cpe:2.3:a:openssl:openssl:1.1.1w:*:*:*:*:*:*:*     │
  │ Lizenz: Apache-2.0                                        │
  │                                                           │
  │ ⚠️ 5 Schwachstellen                                      │
  │ ┌──────────────┬────────┬──────────┬───────────────────┐  │
  │ │ CVE          │ CVSS   │ Exploit  │ Status            │  │
  │ ├──────────────┼────────┼──────────┼───────────────────┤  │
  │ │ CVE-2024-5535│ 9.1 🔴 │ Ja ⚡    │ [Offen ▼]        │  │
  │ │ CVE-2024-4741│ 8.1 🔴 │ Nein    │ [Offen ▼]        │  │
  │ │ CVE-2024-4603│ 5.3 🟠 │ Nein    │ [Akzeptiert ▼]   │  │
  │ │ ...          │        │          │                   │  │
  │ └──────────────┴────────┴──────────┴───────────────────┘  │
  │                                                           │
  │ Empfehlung: Update auf openssl 3.3.x                     │
  └────────────────────────────────────────────────────────────┘
```

### Flow 4: Incident Reporting (5-15 minutes urgent workflow)

```
[Vorfallmanagement > Vorfall melden]
        │
        ▼
[Incident Wizard — "Ist dies ein meldepflichtiger Vorfall?"]
  Decision tree (clickable cards):
  ┌──────────────────────────┐  ┌──────────────────────────┐
  │ 🦠 Ransomware /          │  │ 📧 Phishing-E-Mail      │
  │    Schadsoftware entdeckt │  │    angeklickt            │
  ├──────────────────────────┤  ├──────────────────────────┤
  │ 🔓 Unbefugter Zugriff    │  │ 💾 Datenverlust /        │
  │    auf Systeme            │  │    Datenleck vermutet    │
  ├──────────────────────────┤  ├──────────────────────────┤
  │ 🌐 DDoS-Angriff          │  │ 🏭 OT/Produktionssystem │
  │                           │  │    kompromittiert        │
  ├──────────────────────────┤  ├──────────────────────────┤
  │ 🔧 Schwachstelle in      │  │ ❓ Sonstiger Vorfall     │
  │    eigenem Produkt (CRA)  │  │                          │
  └──────────────────────────┘  └──────────────────────────┘
        │ User selects "Ransomware"
        ▼
[Severity Assessment]
  - "Hat der Vorfall den Geschäftsbetrieb beeinträchtigt?" → Ja/Nein
  - "Sind andere Organisationen betroffen?" → Ja/Nein
  - "Ist ein finanzieller Schaden entstanden oder zu erwarten?" → Ja/Nein
  - "Sind personenbezogene Daten betroffen?" → Ja/Nein
  → System classifies: "Meldepflichtig nach NIS2 Art. 23" / "Nicht meldepflichtig"
        │
        ▼
[Incident Detail Form]
  - Title (pre-filled based on selection)
  - Description (rich text)
  - Affected systems (multi-select from asset inventory)
  - Detection timestamp
  - Evidence upload (drag & drop: screenshots, logs, email headers)
        │
        ▼
[Timer Dashboard — CRITICAL]
  ┌──────────────────────────────────────────────────────────┐
  │  🚨 Vorfall #2026-003: Ransomware-Angriff               │
  │  Erkannt: 26.03.2026, 14:32 Uhr                         │
  │                                                          │
  │  ⏱️ Frühwarnung (24h):        21h 28min verbleibend     │
  │     ██████████████░░░░░░░░░░  [BSI-Meldung erstellen]   │
  │                                                          │
  │  ⏱️ Vollständige Meldung (72h): 69h 28min verbleibend   │
  │     ██░░░░░░░░░░░░░░░░░░░░░  noch nicht fällig          │
  │                                                          │
  │  ⏱️ Abschlussbericht (30d):    29d 21h verbleibend      │
  │     ░░░░░░░░░░░░░░░░░░░░░░░  noch nicht fällig          │
  │                                                          │
  │  Timeline:                                               │
  │  14:32  Vorfall erkannt (Max Müller)                     │
  │  14:45  Vorfall in SchutzKompass erfasst                 │
  │  14:50  IT-Leitung informiert                            │
  │         [+ Eintrag hinzufügen]                           │
  └──────────────────────────────────────────────────────────┘
        │ Click "BSI-Meldung erstellen"
        ▼
[Early Warning Report — Pre-filled Form]
  - Fields pre-filled from incident data
  - User reviews and completes missing fields
  - [Vorschau] shows formatted report
  - [Als PDF herunterladen] → downloads BSI-formatted PDF
  - [Als gesendet markieren] → records timestamp, starts 72h timer
```

### Flow 5: Supplier Questionnaire (External Supplier Perspective)

```
Supplier receives email:
  "Lieferanten-Sicherheitsbewertung von [Customer Name]"
  "Bitte füllen Sie den folgenden Fragebogen aus: [Link]"
        │
        ▼
[Supplier Portal — /fragebogen/{token}]
  (No login required — token-based access)
  (Clean, minimal layout — no sidebar, just the questionnaire)
  
  ┌──────────────────────────────────────────────────────────────┐
  │  SchutzKompass — Lieferanten-Sicherheitsbewertung            │
  │  Auftraggeber: Festo SE & Co. KG                             │
  │  Frist: 15.04.2026                                           │
  │                                                              │
  │  1. Zugriffskontrolle                                        │
  │  ─────────────────────────────────────────────                │
  │  1.1 Haben Sie eine dokumentierte Zugriffsrichtlinie?        │
  │      ○ Ja   ○ Teilweise   ○ Nein   ○ Nicht anwendbar        │
  │      Kommentar: [________________]                           │
  │      Nachweis: [📁 Datei hochladen]                          │
  │                                                              │
  │  1.2 Verwenden Sie Multi-Faktor-Authentifizierung (MFA)      │
  │      für den Zugriff auf kritische Systeme?                  │
  │      ○ Ja   ○ Teilweise   ○ Nein   ○ Nicht anwendbar        │
  │      ...                                                     │
  │                                                              │
  │  [Zwischenspeichern]                    [Fragebogen abgeben] │
  └──────────────────────────────────────────────────────────────┘

  Progress bar at top: ████████████░░░░░░ 65% abgeschlossen
  
  Available in German and English (toggle at top right)
```

---

## 8. Page-by-Page UI Specification

### Dashboard (Home)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Dashboard                                                    26.03.2026│
│                                                                         │
│ Willkommen, Herr Müller. Hier ist Ihr Compliance-Überblick.           │
│                                                                         │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐│
│ │ NIS2-Compli-  │ │ CRA-Compli-   │ │ Offene        │ │ Kritische    ││
│ │ ance-Score    │ │ ance-Score    │ │ Aufgaben      │ │ Schwachst.   ││
│ │               │ │               │ │               │ │              ││
│ │   ┌───┐      │ │   ┌───┐      │ │               │ │              ││
│ │   │73%│      │ │   │45%│      │ │     14        │ │      7       ││
│ │   └───┘      │ │   └───┘      │ │               │ │              ││
│ │  (donut)     │ │  (donut)     │ │  3 überfällig │ │  2 mit       ││
│ │              │ │              │ │               │ │  Exploit     ││
│ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────┘│
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ Nächste Schritte (personalisierte Empfehlungen)                     ││
│ │                                                                     ││
│ │ 1. ⚠️ Risikobewertung abschließen              [Fortsetzen →]     ││
│ │ 2. 🔴 3 kritische Schwachstellen in "SmartSensor Pro"  [Ansehen →]││
│ │ 3. 📋 Lieferant "Zulieferer GmbH" hat Fragebogen nicht beantwortet ││
│ │ 4. 📄 Informationssicherheits-Leitlinie erstellen     [Starten →] ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌──────────────────────────┐ ┌────────────────────────────────────────┐│
│ │ Compliance-Trend (6 Mon) │ │ Letzte Aktivitäten                     ││
│ │                          │ │                                        ││
│ │  100%                    │ │ Heute, 14:32 — Max Müller hat          ││
│ │   │        ╱──           │ │   Risikobewertung #3 erstellt          ││
│ │   │     ╱──              │ │ Gestern — Anna Schmidt hat             ││
│ │   │  ╱──                 │ │   Richtlinie "Backup-Policy" genehmigt ││
│ │   │╱──                   │ │ 24.03 — Schwachstellen-Scan:           ││
│ │   └──────────────        │ │   2 neue CVEs in openssl               ││
│ │   Okt Nov Dez Jan Feb Mär│ │ 23.03 — Lieferant "TechParts GmbH"   ││
│ │                          │ │   hat Fragebogen beantwortet            ││
│ └──────────────────────────┘ └────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Product Dashboard (per product)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 📦 SmartSensor Pro v3.2                          CRA-Kategorie: Default │
│ Konformitätsweg: Modul A (Selbstbewertung)                              │
│ Supportzeitraum: 01.01.2025 – 31.12.2030                               │
│                                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐│
│ │ CRA-Score    │ │ SBOM         │ │ Schwachst.   │ │ Konformität      ││
│ │   ┌───┐     │ │              │ │              │ │                  ││
│ │   │58%│     │ │ 147 Komp.    │ │ 21 gesamt    │ │ 8/15 Anford.    ││
│ │   └───┘     │ │ v3.2.1       │ │ 7 kritisch   │ │ erfüllt         ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘│
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────────┐
│ │ Tabs: [SBOM] [Schwachstellen] [Konformität] [Dokumentation] [Lifecycle]│
│ ├────────────────────────────────────────────────────────────────────────┤
│ │                                                                        │
│ │  (Tab content rendered here)                                           │
│ │                                                                        │
│ └────────────────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────┘
```

### Controls/Measures Tracker (Maßnahmen)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Maßnahmen-Tracker                              NIS2 Art. 21 Compliance  │
│                                                                          │
│ Gesamt-Fortschritt: ████████████████░░░░░░░░ 65%                        │
│                                                                          │
│ Filter: [Alle Bereiche ▼] [Alle Status ▼] [Alle Prioritäten ▼]  🔍    │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────── │
│ │ Art. 21(2)(a): Risikoanalyse und Informationssicherheit               │
│ │ ████████████████████████████░░ 87% — 7/8 Maßnahmen umgesetzt         │
│ │ ┌──────────────────────────────┬──────────┬──────────┬──────────────┐ │
│ │ │ Maßnahme                     │ Status   │ Priorität│ Verantwortl. │ │
│ │ ├──────────────────────────────┼──────────┼──────────┼──────────────┤ │
│ │ │ IS-Leitlinie erstellen       │ 🟢 Umges.│ Muss     │ M. Müller    │ │
│ │ │ Risikoanalyse durchführen    │ 🟢 Umges.│ Muss     │ M. Müller    │ │
│ │ │ Asset-Inventar erstellen     │ 🟡 Bearb.│ Muss     │ A. Schmidt   │ │
│ │ │ Risikobewertung dokumentieren│ 🟢 Umges.│ Muss     │ M. Müller    │ │
│ │ └──────────────────────────────┴──────────┴──────────┴──────────────┘ │
│ │                                                                       │
│ │ Art. 21(2)(b): Bewältigung von Sicherheitsvorfällen                  │
│ │ ██████████░░░░░░░░░░░░░░░░░░░░ 33% — 2/6 Maßnahmen umgesetzt       │
│ │ ┌──────────────────────────────┬──────────┬──────────┬──────────────┐ │
│ │ │ Incident-Response-Plan       │ 🔴 Offen │ Muss     │ —            │ │
│ │ │ Meldeprozess BSI einrichten  │ 🔴 Offen │ Muss     │ —            │ │
│ │ │ ...                          │          │          │              │ │
│ │ └──────────────────────────────┴──────────┴──────────┴──────────────┘ │
│ └───────────────────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────────────────┘

Click on a measure row → opens detail panel:
┌──────────────────────────────────────────────┐
│ Incident-Response-Plan erstellen             │
│ NIS2 Art. 21(2)(b) | BSI SYS.1.2.A          │
│ Priorität: Muss | Status: Offen             │
│                                              │
│ Was ist zu tun:                              │
│ Erstellen Sie einen Incident-Response-Plan,  │
│ der folgende Punkte abdeckt:                 │
│ • Verantwortlichkeiten und Kontaktpersonen   │
│ • Klassifizierung von Vorfällen              │
│ • Eskalationsstufen                          │
│ • Meldewege (intern + BSI)                   │
│ • Kommunikationsvorlagen                     │
│                                              │
│ Geschätzter Aufwand: 2-3 Tage               │
│                                              │
│ Nachweise:                                   │
│ [📁 Datei hochladen] oder [📝 Text eingeben]│
│                                              │
│ Verantwortlich: [Benutzer auswählen ▼]      │
│ Fällig bis:     [Datum auswählen]            │
│                                              │
│ [Vorlage herunterladen]  [Als umgesetzt markieren]│
└──────────────────────────────────────────────┘
```

### Supplier Security Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Lieferketten-Sicherheit                                                  │
│                                                                          │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ 47           │ │ 12 Kritisch  │ │ 8 Überfällig │ │ Ø Risiko-Score  │ │
│ │ Lieferanten  │ │ 20 Wichtig   │ │ Fragebögen   │ │      62/100     │ │
│ │ gesamt       │ │ 15 Standard  │ │              │ │                 │ │
│ └─────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘ │
│                                                                          │
│ [+ Lieferant hinzufügen]  [📤 CSV Import]  [📧 Fragebögen versenden]  │
│                                                                          │
│ 🔍 Suche...   Risiko: [Alle ▼]  Status: [Alle ▼]                       │
│ ┌──────────────────┬──────────┬───────────┬──────────┬─────────────────┐│
│ │ Lieferant        │ Risiko   │ Fragebogen│ ISO27001 │ Score           ││
│ ├──────────────────┼──────────┼───────────┼──────────┼─────────────────┤│
│ │ TechParts GmbH   │ Kritisch │ ✅ Fertig │ Gültig   │ ████████░░ 78  ││
│ │ Zulieferer AG     │ Kritisch │ ⏳ Offen  │ Abgelauf.│ ████░░░░░░ 34  ││
│ │ SupplyChain SE    │ Wichtig  │ ✅ Fertig │ Gültig   │ █████████░ 85  ││
│ │ ComponentWorks    │ Standard │ 📧 Gesendet│ Keins   │ —              ││
│ │ ...               │          │           │          │                 ││
│ └──────────────────┴──────────┴───────────┴──────────┴─────────────────┘│
│                                                                          │
│ Lieferanten-Risiko-Heatmap:                                             │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ (scatter plot: x = risk score, y = business criticality,            │ │
│ │  dot size = contract value, color = questionnaire status)           │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. SBOM Processing Pipeline

### Architecture

```
User uploads file (firmware.bin or package.json or SBOM.json)
        │
        ▼
Next.js API Route: POST /api/upload/sbom
  - Validate file type and size (max 500MB for firmware, 50MB for manifests/SBOMs)
  - Upload to MinIO (S3) under: /{orgId}/sboms/{productId}/{filename}
  - Create BullMQ job: { type: 'sbom_process', fileKey, productId, orgId }
  - Return: { jobId, status: 'processing' }
        │
        ▼
Worker Process (apps/worker)
  BullMQ consumer picks up job
        │
        ├── If file is SBOM (SPDX/CycloneDX JSON/XML):
        │     - Parse directly with custom parser
        │     - Validate format and completeness
        │     - Extract components: name, version, supplier, license, CPE, PURL
        │     - Store in sbom_components table
        │
        ├── If file is firmware binary (.bin, .elf, .img):
        │     - Download from MinIO to temp dir
        │     - Run: docker run --rm -v /tmp/fw:/input anchore/syft:latest \
        │              /input/firmware.bin -o cyclonedx-json > /tmp/sbom.json
        │     - Parse generated SBOM
        │     - Upload generated SBOM to MinIO
        │     - Extract components, store in DB
        │
        └── If file is source manifest (package.json, requirements.txt, etc.):
              - Download to temp dir
              - Run: docker run --rm -v /tmp/src:/input cyclonedx/cdxgen:latest \
                       -o /tmp/sbom.json /input
              - Parse, upload, extract, store
        │
        ▼
After SBOM stored → automatically trigger vulnerability scan job
  BullMQ job: { type: 'vuln_scan', sbomId, productId, orgId }
        │
        ▼
Vulnerability Scanner (in worker)
  For each component in SBOM:
  1. If CPE exists: query NVD API v2 with CPE match
  2. If PURL exists: query OSV.dev API
  3. If neither: fuzzy match by package name + version against NVD
  4. For each matched CVE:
     - Check if already exists in vulnerabilities table for this component
     - If new: insert with status 'open', send notification
     - If existing: update CVSS score if changed
     - Check CISA KEV list for known exploits → set exploitAvailable flag
  5. Update product.complianceScore
        │
        ▼
Send notifications (email + in-app) for new Critical/High vulnerabilities
```

### SBOM Tool Docker Images

```dockerfile
# docker/Dockerfile.worker
FROM node:20-slim

# Install Docker CLI for running SBOM tools in sibling containers
RUN apt-get update && apt-get install -y docker.io && rm -rf /var/lib/apt/lists/*

# Pre-pull SBOM tool images (done during build or init)
# These run as sibling containers via Docker socket mounting
# - anchore/syft:latest
# - aquasec/trivy:latest
# - anchore/grype:latest
# - cyclonedx/cdxgen:latest

WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "dist/index.js"]
```

### Nightly Vulnerability Re-Scan (Scheduled Job)

```
BullMQ Repeatable Job: runs daily at 02:00 UTC
        │
        ▼
1. Fetch all active SBOMs (latest per product)
2. For each SBOM:
   a. For each component: re-check NVD/OSV for new CVEs published since last scan
   b. Check if any existing "open" vulnerabilities have been patched upstream
3. New vulnerabilities → insert into DB, set status 'open'
4. Send daily digest email to org admins: "3 neue Schwachstellen in 2 Produkten"
```

---

## 10. Vulnerability Monitoring Pipeline

### NVD API v2 Integration

```typescript
// apps/worker/src/integrations/nvd.ts

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'

interface NvdSearchParams {
  cpeName?: string        // CPE match
  keywordSearch?: string  // fallback: package name
  lastModStartDate?: string
  lastModEndDate?: string
  resultsPerPage?: number
}

async function searchNvd(params: NvdSearchParams): Promise<NvdCve[]> {
  // Rate limiting: NVD allows 5 requests per 30 seconds (without API key)
  // With API key: 50 requests per 30 seconds
  // Use a rate limiter (p-limit or custom)
  
  const url = new URL(NVD_API_BASE)
  if (params.cpeName) url.searchParams.set('cpeName', params.cpeName)
  if (params.keywordSearch) url.searchParams.set('keywordSearch', params.keywordSearch)
  if (params.lastModStartDate) url.searchParams.set('lastModStartDate', params.lastModStartDate)
  if (params.lastModEndDate) url.searchParams.set('lastModEndDate', params.lastModEndDate)
  url.searchParams.set('resultsPerPage', String(params.resultsPerPage ?? 50))

  const response = await fetch(url.toString(), {
    headers: {
      'apiKey': process.env.NVD_API_KEY ?? '', // optional but recommended
    },
  })

  const data = await response.json()
  return data.vulnerabilities.map(v => parseCve(v))
}
```

### OSV.dev API Integration

```typescript
// apps/worker/src/integrations/osv.ts

const OSV_API = 'https://api.osv.dev/v1/query'

async function queryOsv(purl: string): Promise<OsvVulnerability[]> {
  const response = await fetch(OSV_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package: { purl },
    }),
  })

  const data = await response.json()
  return data.vulns ?? []
}

// Batch query (up to 1000 at once)
async function batchQueryOsv(purls: string[]): Promise<Map<string, OsvVulnerability[]>> {
  const response = await fetch('https://api.osv.dev/v1/querybatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queries: purls.map(purl => ({ package: { purl } })),
    }),
  })

  const data = await response.json()
  // Map results back to PURLs
  const result = new Map()
  purls.forEach((purl, i) => {
    result.set(purl, data.results[i]?.vulns ?? [])
  })
  return result
}
```

---

## 11. Document Generation System

### Two Approaches

**Approach 1: React-PDF (for simple, structured documents)**

Used for: EU Declaration of Conformity, applicability check report, supplier questionnaire summary, single-page checklists.

```typescript
// Rendered on the server as a Server Action or API route
import { renderToBuffer } from '@react-pdf/renderer'
import { DeclarationDocument } from '@/components/pdf/declaration-document'

export async function generateDeclaration(productId: string) {
  const product = await getProduct(productId)
  const org = await getOrganisation(product.organisationId)

  const buffer = await renderToBuffer(
    <DeclarationDocument product={product} organisation={org} />
  )

  // Upload to MinIO
  await uploadToS3(`${org.id}/documents/declaration_${product.id}.pdf`, buffer)
  
  return { url: getSignedUrl(...) }
}
```

**Approach 2: Puppeteer (for complex, multi-page documents with charts)**

Used for: Management compliance summary (includes charts), full audit evidence package, risk assessment report with heatmap.

```typescript
// apps/worker/src/jobs/pdf-generate.ts
import puppeteer from 'puppeteer'

export async function generateManagementReport(orgId: string) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()

  // Render an internal HTML template with the data
  // This HTML page is a special Next.js route: /api/reports/management/{orgId}?token=...
  await page.goto(`${INTERNAL_URL}/api/reports/management/${orgId}?token=${INTERNAL_TOKEN}`, {
    waitUntil: 'networkidle0',
  })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  })

  await browser.close()

  // Upload PDF to MinIO
  await uploadToS3(`${orgId}/reports/management_report_${Date.now()}.pdf`, pdf)
}
```

### Policy Template System

Policy templates are stored as `.docx` files in `packages/compliance-content/nis2/policies/templates/`. They contain placeholder variables:

```
{{COMPANY_NAME}} — Informationssicherheits-Leitlinie
Version {{VERSION}}, Stand: {{DATE}}

1. Geltungsbereich
Diese Leitlinie gilt für alle Mitarbeiter der {{COMPANY_NAME}} ...

Freigegeben durch:
{{APPROVER_NAME}}, {{APPROVER_ROLE}}
```

When a user downloads a template:
1. Server reads .docx from filesystem
2. Replaces placeholders with organisation data using `docxtemplater` library
3. Returns customized .docx for download
4. User edits in Word/LibreOffice, uploads final version as evidence

```typescript
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs'

export async function generatePolicyDocument(templateName: string, orgId: string) {
  const org = await getOrganisation(orgId)
  const templatePath = `packages/compliance-content/nis2/policies/templates/${templateName}.docx`
  const content = fs.readFileSync(templatePath, 'binary')
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

  doc.render({
    COMPANY_NAME: org.name,
    VERSION: '1.0',
    DATE: new Date().toLocaleDateString('de-DE'),
    APPROVER_NAME: '_______________',
    APPROVER_ROLE: '_______________',
  })

  return doc.getZip().generate({ type: 'nodebuffer' })
}
```

---

## 12. Authentication & Multi-Tenancy

### Auth Flow

```
Registration:
  1. User enters email + password + company name
  2. Server creates Organisation + User records
  3. Sends verification email
  4. User clicks verification link → account activated

Login:
  1. Email + password → server validates against bcrypt hash
  2. Creates session (stored in PostgreSQL or Redis)
  3. Sets HTTP-only, Secure, SameSite=Strict cookie
  4. Redirects to /dashboard

Session:
  - Session ID in cookie → lookup user + organisation from DB
  - Session expiry: 24 hours (sliding window)
  - CSRF protection via SameSite cookie + origin header check

Middleware (Next.js):
  - middleware.ts checks for valid session cookie on all /app/ routes
  - Redirects to /login if no valid session
  - Attaches user + org to request context

Role-Based Access:
  - admin: full access, user management, organisation settings
  - compliance_officer: full access to compliance modules, no user management
  - viewer: read-only access to dashboards and reports
  - auditor: read-only access to audit/evidence module only (used for external auditors)
```

### Multi-Tenancy Implementation

```typescript
// lib/db.ts — scoped database queries

import { db } from '@schutzkompass/db'

export function scopedDb(organisationId: string) {
  // Returns a proxy that automatically adds .where(eq(table.organisationId, orgId))
  // to all queries. This is the primary isolation mechanism.
  // PostgreSQL RLS is the secondary mechanism (defense in depth).
  return {
    query: <T>(table: any) =>
      db.select().from(table).where(eq(table.organisationId, organisationId)),
    insert: <T>(table: any, values: any) =>
      db.insert(table).values({ ...values, organisationId }),
    // ... update, delete with orgId scoping
  }
}

// Usage in Server Components:
export default async function RisikenPage() {
  const user = await getCurrentUser()
  const scoped = scopedDb(user.organisationId)
  const risks = await scoped.query(riskEntries)
  // ...
}
```

---

## 13. External Integrations

### Phase 1 Integrations (MVP)

| Integration | Direction | Method | Purpose |
|---|---|---|---|
| **NVD API v2** | Pull | REST API (nightly batch) | Vulnerability data for SBOM components |
| **OSV.dev API** | Pull | REST API (nightly batch) | Open-source vulnerability data |
| **Resend / Postmark** | Push | SDK | Transactional email (notifications, questionnaires, reports) |
| **MinIO (S3)** | Push/Pull | S3 SDK | File storage (SBOMs, evidence, PDFs) |

### Phase 2 Integrations (Post-MVP)

| Integration | Direction | Method | Purpose |
|---|---|---|---|
| **Microsoft 365 / Azure AD** | Pull | OAuth2 + Graph API | Automated evidence collection (user lists, MFA status, conditional access policies) |
| **Jira** | Push | REST API | Export tasks/measures as Jira tickets |
| **Azure DevOps** | Push | REST API | Export tasks as work items |
| **GitHub Advisory DB** | Pull | GraphQL API | Additional vulnerability data |
| **CISA KEV** | Pull | JSON feed (daily) | Known exploited vulnerabilities list |
| **BSI CERT-Bund** | Pull | RSS/Atom feed | German-specific advisories |

### Phase 3 Integrations (Scale)

| Integration | Direction | Method | Purpose |
|---|---|---|---|
| **ENISA Single Reporting Platform** | Push | API (TBD) | Direct CRA vulnerability reporting |
| **BSI Meldestelle** | Push | API (TBD) | Direct NIS2 incident reporting |
| **SAML/OIDC SSO** | Pull | SAML 2.0 / OIDC | Enterprise SSO (Azure AD, Okta, Google Workspace) |

---

## 14. Infrastructure & Deployment

### Production Setup (Hetzner Cloud)

```
Internet
    │
    ▼
Hetzner Load Balancer (€5/month)
    │
    ├── Web Server 1: CX31 (4 vCPU, 8GB RAM) — €10/month
    │   └── Docker: Next.js app + Nginx reverse proxy
    │
    ├── Web Server 2: CX31 (4 vCPU, 8GB RAM) — €10/month (Phase 2, for HA)
    │   └── Docker: Next.js app + Nginx reverse proxy
    │
    ├── Worker Server: CX31 (4 vCPU, 8GB RAM) — €10/month
    │   └── Docker: Worker process + Syft/Trivy/Grype containers
    │
    ├── Database Server: CX31 (4 vCPU, 8GB RAM) — €10/month
    │   └── PostgreSQL 16 (or Hetzner Managed Database: €19/month)
    │
    ├── Redis: CX11 (1 vCPU, 2GB RAM) — €4/month
    │   └── Redis 7 for sessions + BullMQ
    │
    └── Storage Server: CX11 + Volume — €4/month + volume costs
        └── MinIO (S3-compatible object storage)

Backup:
  - Daily PostgreSQL dump → encrypted → stored on Hetzner Storage Box (different DC)
  - MinIO replication to second server (Phase 2)

Total initial infrastructure cost: ~€40-€60/month
```

### Docker Compose (Production)

```yaml
# docker/docker-compose.prod.yml
version: '3.8'

services:
  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://schutzkompass:${DB_PASSWORD}@db:5432/schutzkompass
      REDIS_URL: redis://redis:6379
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      S3_SECRET_KEY: ${MINIO_SECRET_KEY}
      S3_BUCKET: schutzkompass
      EMAIL_API_KEY: ${RESEND_API_KEY}
      NEXTAUTH_SECRET: ${AUTH_SECRET}
      NEXTAUTH_URL: https://app.schutzkompass.de
    depends_on:
      - db
      - redis
      - minio
    restart: always

  worker:
    build:
      context: ..
      dockerfile: docker/Dockerfile.worker
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # for running Syft/Trivy containers
      - /tmp/schutzkompass-worker:/tmp/worker       # temp files for SBOM processing
    environment:
      DATABASE_URL: postgresql://schutzkompass:${DB_PASSWORD}@db:5432/schutzkompass
      REDIS_URL: redis://redis:6379
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      S3_SECRET_KEY: ${MINIO_SECRET_KEY}
      NVD_API_KEY: ${NVD_API_KEY}
    depends_on:
      - db
      - redis
      - minio
    restart: always

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: schutzkompass
      POSTGRES_USER: schutzkompass
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    restart: always

  minio:
    image: minio/minio:latest
    volumes:
      - miniodata:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - web
    restart: always

volumes:
  pgdata:
  redisdata:
  miniodata:
```

### Deployment Pipeline

```
Developer pushes to main branch
        │
        ▼
GitLab CI / GitHub Actions:
  1. Run TypeScript type checking (tsc --noEmit)
  2. Run ESLint
  3. Run unit tests (Vitest)
  4. Run integration tests (Vitest + Testcontainers for PostgreSQL)
  5. Build Next.js app (next build)
  6. Build worker (tsc)
  7. Build Docker images (web + worker)
  8. Push images to GitLab Container Registry / GitHub Packages
  9. SSH into Hetzner server
  10. docker compose pull && docker compose up -d
  11. Run database migrations (drizzle-kit migrate)
  12. Health check: curl https://app.schutzkompass.de/api/health

Total deployment time: ~5-8 minutes
```

### Domain & SSL

- Domain: `schutzkompass.de` (check availability, alternative: `schutzkompass.io`)
- SSL: Let's Encrypt via certbot (auto-renewal every 90 days)
- Subdomains:
  - `app.schutzkompass.de` — main application
  - `lieferanten.schutzkompass.de` — supplier portal (or use path-based: `app.schutzkompass.de/fragebogen/...`)
  - `www.schutzkompass.de` — marketing site (can be a separate static site)

---

## 15. Development Sprint Plan

### Sprint 0 (Week 1-2): Project Bootstrapping

| Task | Estimated Hours | Owner |
|---|---|---|
| Create Turborepo monorepo with pnpm workspaces | 4h | CTO |
| Set up Next.js app with App Router, Tailwind, shadcn/ui | 4h | Frontend Dev |
| Set up Drizzle ORM, PostgreSQL schema (core tables: organisations, users, audit_log) | 8h | CTO |
| Docker Compose for local development (PostgreSQL, Redis, MinIO) | 4h | CTO |
| Set up CI pipeline (type check, lint, test, build) | 4h | CTO |
| Design system: color tokens, typography, component primitives | 8h | Frontend Dev |
| Sidebar layout component, top bar, breadcrumbs | 8h | Frontend Dev |
| Auth system: registration, login, sessions, middleware | 12h | CTO |
| Deploy empty app to Hetzner Cloud (Docker Compose, Nginx, Let's Encrypt) | 8h | CTO |

**Sprint 0 Deliverable**: Running app at app.schutzkompass.de with login, empty dashboard, sidebar navigation.

### Sprint 1 (Week 3-4): Onboarding & NIS2 Applicability Check

| Task | Hours | Owner |
|---|---|---|
| Onboarding wizard UI (4-step form with Wizard component) | 12h | Frontend |
| Company profile data model + Server Actions | 6h | CTO |
| NIS2 sector decision tree logic (packages/compliance-content/nis2/sectors.json) | 8h | Compliance Lead |
| NIS2 applicability assessment engine (server/services/nis2-applicability.ts) | 8h | CTO |
| CRA applicability check (3 questions) | 4h | CTO |
| Result page with personalized recommendations | 6h | Frontend |
| PDF export of applicability result (@react-pdf) | 6h | Frontend |
| Public Betroffenheits-Check page (lead generation — no login) | 8h | Frontend + CTO |

**Sprint 1 Deliverable**: New users can register, go through onboarding, get their NIS2/CRA applicability result.

### Sprint 2 (Week 5-6): Asset Inventory & Risk Assessment (Part 1)

| Task | Hours | Owner |
|---|---|---|
| Assets table schema + CRUD Server Actions | 8h | CTO |
| Asset inventory page with DataTable (add, edit, delete, CSV import) | 12h | Frontend |
| Risk assessment data model (riskAssessments, riskEntries) | 6h | CTO |
| Industry-specific threat catalogs (manufacturing, logistics) as JSON content | 12h | Compliance Lead |
| Risk assessment wizard UI (3-step: select assets → rate threats → treatment) | 16h | Frontend |
| Risk scoring engine (5×5 matrix calculation) | 4h | CTO |
| BSI IT-Grundschutz Bausteine mapping (top 30 controls) | 12h | Compliance Lead |

**Sprint 2 Deliverable**: Users can manage asset inventory, start risk assessments with industry-specific threat catalogs.

### Sprint 3 (Week 7-8): Risk Assessment (Part 2) & Controls Tracker

| Task | Hours | Owner |
|---|---|---|
| Risk heatmap visualization (Recharts) | 8h | Frontend |
| Risk register table with filtering/sorting | 6h | Frontend |
| Risk treatment plan workflow | 6h | Frontend + CTO |
| Controls table schema + CRUD | 6h | CTO |
| Controls tracker page (grouped by NIS2 article, traffic-light status) | 12h | Frontend |
| Control detail panel (instructions, evidence upload, assign person, set deadline) | 10h | Frontend |
| Compliance score calculation service | 6h | CTO |
| Dashboard with compliance donut charts and stats cards | 8h | Frontend |

**Sprint 3 Deliverable**: Full risk assessment flow, controls tracker with progress visualization, compliance dashboard.

### Sprint 4 (Week 9-10): Policy Templates & Product Inventory

| Task | Hours | Owner |
|---|---|---|
| Policy template system (docxtemplater integration) | 8h | CTO |
| 20 policy templates in German (.docx files) | 40h | Compliance Lead |
| Policy library page (browse, preview, download, upload signed version) | 12h | Frontend |
| Products table schema + CRUD | 6h | CTO |
| Product registration form with CRA classification wizard | 12h | Frontend |
| CRA category classifier engine (packages/compliance-content/cra/product-categories.json) | 8h | Compliance Lead + CTO |
| Product portfolio overview page | 6h | Frontend |

**Sprint 4 Deliverable**: Users can browse and download policy templates. Manufacturers can register products and get CRA classification.

### Sprint 5 (Week 11-12): SBOM Manager

| Task | Hours | Owner |
|---|---|---|
| Worker process setup (BullMQ, Docker socket access) | 8h | Security Eng |
| SBOM upload API route (file validation, S3 upload, queue job) | 6h | CTO |
| SBOM parser: SPDX JSON + CycloneDX JSON | 12h | Security Eng |
| Syft integration (Docker CLI wrapper, firmware binary → SBOM) | 10h | Security Eng |
| SBOM components table schema + storage | 6h | CTO |
| SBOM viewer page (component table, search, filter) | 10h | Frontend |
| Component detail slide-in panel | 6h | Frontend |
| SBOM diff view (compare two SBOM versions) | 8h | Frontend |

**Sprint 5 Deliverable**: Users can upload or generate SBOMs, view components, compare versions.

### Sprint 6 (Week 13-14): Vulnerability Monitoring

| Task | Hours | Owner |
|---|---|---|
| NVD API v2 client with rate limiting | 8h | Security Eng |
| OSV.dev API client (single + batch query) | 6h | Security Eng |
| Vulnerability matching engine (CPE + PURL + fuzzy) | 12h | Security Eng |
| Nightly scan job (BullMQ repeatable) | 6h | Security Eng |
| Vulnerabilities table schema + storage | 4h | CTO |
| Vulnerability dashboard per product (severity breakdown, trend chart) | 10h | Frontend |
| Vulnerability triage workflow (status change, assign, accept with justification) | 8h | Frontend + CTO |
| Email notification for new Critical/High vulnerabilities | 4h | CTO |

**Sprint 6 Deliverable**: Automated nightly vulnerability scanning. Per-product vulnerability dashboard with triage workflow.

### Sprint 7 (Week 15-16): Incident Management

| Task | Hours | Owner |
|---|---|---|
| Incidents table schema + timeline schema | 6h | CTO |
| Incident detection wizard ("Is this an incident?" decision tree) | 10h | Frontend + Compliance |
| Incident severity classification engine | 6h | CTO |
| Incident detail page with timer dashboard (24h/72h/30d) | 12h | Frontend |
| Incident timeline component | 8h | Frontend |
| BSI early warning report template (pre-filled PDF) | 8h | Frontend + Compliance |
| CRA vulnerability reporting workflow (24h/72h/14d) | 8h | Frontend + CTO |
| Communication templates (board, employees, customers, press) | 6h | Compliance Lead |

**Sprint 7 Deliverable**: Full incident management with BSI/ENISA reporting timers. This is the critical module for CRA Sep 2026 deadline.

### Sprint 8 (Week 17-18): Supplier Management

| Task | Hours | Owner |
|---|---|---|
| Suppliers table schema + questionnaire response schema | 6h | CTO |
| Supplier inventory page (add, edit, import CSV, risk classification) | 10h | Frontend |
| Supplier security questionnaire content (30-40 questions, DE + EN) | 16h | Compliance Lead |
| Questionnaire email sending (Resend integration) | 4h | CTO |
| Supplier portal (token-based access, no login, separate layout) | 12h | Frontend + CTO |
| Questionnaire scoring algorithm | 6h | CTO |
| Supplier risk dashboard (heatmap, scores, overdue tracking) | 8h | Frontend |
| Bulk operations (send to 200+ suppliers, automatic reminders) | 6h | CTO |

**Sprint 8 Deliverable**: Full supplier security management with external questionnaire portal.

### Sprint 9 (Week 19-20): Conformity Documentation & Evidence Management

| Task | Hours | Owner |
|---|---|---|
| CRA Annex VII tech doc template (guided form) | 12h | Compliance + Frontend |
| EU Declaration of Conformity generator (React-PDF) | 8h | Frontend |
| Module A self-assessment workflow | 10h | Frontend + CTO |
| CE marking checklist | 4h | Compliance + Frontend |
| Evidence repository (upload, version, tag, search) | 10h | Frontend + CTO |
| Evidence-to-requirement mapping | 6h | CTO |
| Management summary PDF (Puppeteer, with charts) | 10h | Frontend + CTO |
| Auditor portal (read-only view, separate role) | 8h | Frontend + CTO |

**Sprint 9 Deliverable**: Full CRA conformity documentation workflow. Evidence management for auditors.

### Sprint 10 (Week 21-22): Polish, Testing, Launch Preparation

| Task | Hours | Owner |
|---|---|---|
| End-to-end testing (Playwright: critical flows) | 16h | CTO |
| Security review: SQL injection, XSS, CSRF, auth bypass checks | 8h | Security Eng |
| Performance testing (100 concurrent users) | 4h | CTO |
| German language review (all UI text, help text, error messages) | 8h | Compliance Lead |
| Help center content (FAQ, guided tours, video scripts) | 12h | Compliance Lead |
| Onboarding email sequence (welcome, day 3 tips, day 7 check-in) | 4h | Compliance Lead |
| Landing page / marketing site | 16h | Frontend |
| Legal: AGB, Datenschutzerklärung, Auftragsverarbeitungsvertrag (AVV) | External lawyer | — |
| Production deployment, monitoring (Grafana), error tracking (Sentry) | 8h | CTO |

**Sprint 10 Deliverable**: Production-ready product, marketing site, legal documents.

---

## Summary of Key Technical Decisions

| Decision | Choice | Key Reason |
|---|---|---|
| Web app vs. desktop vs. mobile | Web application | Multi-user collaboration, no installation, instant updates |
| Framework | Next.js (App Router) | Full-stack in one codebase, SSR, Server Actions, self-hostable |
| Separate backend? | No — Next.js handles everything | Small team, less infra to manage, shared types |
| UI library | shadcn/ui + Radix + Tailwind | Own the code, accessible, fast to build |
| Database | PostgreSQL + Drizzle ORM | Reliable, type-safe, good JSON support |
| File storage | MinIO (self-hosted S3) | German data residency, S3-compatible, free |
| Background jobs | BullMQ (Redis) | Reliable, retries, scheduled jobs, simple |
| SBOM tools | Syft, Trivy, Grype (Docker containers) | Open-source, well-maintained, industry standard |
| Auth | Better Auth or NextAuth.js | Self-hosted, no external dependency |
| Hosting | Hetzner Cloud (Nuremberg) | German, ISO 27001, cheap (~€50/month) |
| Deployment | Docker Compose → CI/CD push | Simple for small team, upgrade to K8s later |
| Email | Resend with React Email | Great DX, EU sending, React templates |
| PDF | React-PDF + Puppeteer | Simple docs + complex reports covered |
| Multi-tenancy | Row-level organisationId + PG RLS | Simple, effective, auditable |
| Monorepo | Turborepo + pnpm | Shared schema/types, coordinated builds |

---

*This document specifies exactly what to build and how. Every page, every table, every API endpoint, every background job, every deployment detail. A team of 3-4 developers can start implementing Sprint 0 tomorrow.*
