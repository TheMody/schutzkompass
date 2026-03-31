# TODO: Bug Fix & Feature Review

## User-Reported Issues
- [x] 1. Asset dialog see-through: Fix transparent modal overlay so dialog background is opaque (root cause: missing @theme in Tailwind v4 CSS — fixed globals.css + all modal overlays across entire app)
- [x] 2. Notification bell not clickable: Added onClick handler with dropdown to TopBar bell (with mock notifications, dismiss, mark-all-read, click-outside-close)
- [x] 3. Compliance donut text overflow: Fixed percentage text positioning using absolute inset-0 centering instead of fragile negative margin

## Full Feature Review (Visual + Functional)

### Code Review Status
- [x] 4. Start dev server ✓ (running)
- [x] 5. Auth pages (Login, Register, Passwort-Vergessen) — ✓ clean, theme-consistent
- [x] 6. Root redirect (/) → dashboard — ✓ working
- [x] 7. Dashboard page — ✓ clean, uses bg-card/text-muted-foreground properly
- [x] 8. Onboarding wizard — ✓ reviewed (877 lines, complex wizard, clean)
- [x] 9. Betroffenheits-Check — ✓ redirects to onboarding
- [x] 10. Asset-Inventar — ✓ fixed in previous pass (modals bg-card)
- [x] 11. Risikobewertung — ✓ clean, uses bg-card/bg-muted/text-muted-foreground properly
- [x] 12. Maßnahmen-Tracker — ✓ clean, no gray/white issues
- [x] 13. Richtlinien-Bibliothek — ✓ clean, no gray/white issues
- [x] 25. Sidebar + TopBar — ✓ clean, notification dropdown added

### Theme Consistency Fixes Needed
- [x] 14. Fix: Lieferketten-Sicherheit — bg-white/bg-gray-*/text-gray-* → theme tokens ✓
- [x] 15. Fix: Vorfallmanagement — bg-white/bg-gray-*/text-gray-* → theme tokens ✓
- [x] 16. Fix: Audit & Nachweise — bg-white/bg-gray-*/text-gray-* → theme tokens ✓
- [x] 17. Fix: Produkt pages (sbom, schwachstellen already clean):
  - [x] 17a. Meldewesen (/produkte/meldungen) — bg-gray-*/text-gray-* → theme tokens ✓
  - [x] 17b. Konformitäts-Dokumentation (/produkte/konformitaet) — bg-gray-*/text-gray-* → theme tokens ✓
  - [x] 17c. Produkt-Lebenszyklus (/produkte/lebenszyklus) — bg-gray-*/text-gray-* → theme tokens ✓
- [x] 18. Fix: Einstellungen pages:
  - [x] 18a. Profil — text-gray-400 → text-muted-foreground, hover:bg-gray-50 → hover:bg-muted ✓
  - [x] 18b. Benutzer & Rollen — bg-gray-*/text-gray-* → theme tokens ✓
  - [x] 18c. Organisation — text-gray-400 → text-muted-foreground ✓
  - [x] 18d. Integrationen — bg-gray-*/text-gray-* → theme tokens ✓
- [x] 19. Fix: Hilfe & Support — bg-white/bg-gray-*/text-gray-* → theme tokens ✓
- [x] 20. Verified: Zero remaining bg-white, text-gray-*, bg-gray-* references in app pages ✓

---

# DONE: Single-command dev startup

- [x] 1. Create a `scripts/dev.sh` script that starts Docker, waits for services, pushes DB schema, and runs turbo dev
- [x] 2. Add `start:dev` script to root `package.json` pointing to the shell script
- [x] 3. Make the worker gracefully handle missing Redis (don't crash the entire turbo pipeline)
- [x] 4. Update `docs/DEVELOPER_GUIDE.md` — fix `docker compose` → `docker-compose`, document new single-command workflow

---

# TODO: Fix onboarding → dashboard next steps update

- [x] 1. Add `saveOnboardingResults` server action in `onboarding.ts` that persists results to the `organisations` table
- [x] 2. Add `getOnboardingStatus` server action to fetch the org's onboarding status & next steps
- [x] 3. Update onboarding page `handleComplete` to call `saveOnboardingResults` before redirecting
- [x] 4. Update dashboard to load onboarding status and show dynamic next steps

---

# SchutzKompass Implementation TODO

## Sprint 0: Project Bootstrapping

### Monorepo & Tooling Setup
- [x] Initialize Turborepo monorepo with pnpm workspaces
- [x] Create root `package.json`, `turbo.json`, `pnpm-workspace.yaml`
- [x] Create `.env.example` with all required environment variables

### Next.js Web App (`apps/web`)
- [x] Set up Next.js 16 app with App Router and TypeScript
- [x] Install and configure Tailwind CSS v4
- [x] Install and configure shadcn/ui (button, card, dialog, form, sidebar, etc.)
- [x] Set up root layout (`app/layout.tsx`) with Inter font, globals.css, providers
- [x] Set up route groups: `(auth)`, `(app)`, `(supplier)`, `(public)`
- [x] Create app shell layout (`(app)/layout.tsx`): sidebar + top bar + breadcrumbs
- [x] Build sidebar navigation component with full nav structure (Dashboard, Organisation, Produkte, Einstellungen, Hilfe)
- [x] Build top bar component (logo, breadcrumbs, notification bell, user avatar)
- [x] Create placeholder pages for all routes (dashboard, organisation/*, produkte/*, einstellungen/*, hilfe)

### Database (`packages/db`)
- [x] Set up `packages/db` package with Drizzle ORM and drizzle-kit
- [x] Create core schema: `organisations.ts`
- [x] Create core schema: `users.ts`
- [x] Create core schema: `assets.ts`
- [x] Create core schema: `risks.ts` (riskAssessments + riskEntries)
- [x] Create core schema: `products.ts`
- [x] Create core schema: `sboms.ts` (sboms + sbomComponents)
- [x] Create core schema: `vulnerabilities.ts`
- [x] Create core schema: `suppliers.ts` (suppliers + questionnaireResponses)
- [x] Create core schema: `incidents.ts` (incidents + incidentTimeline)
- [x] Create core schema: `controls.ts`
- [x] Create core schema: `audit-log.ts`
- [x] Create core schema: `conformity-documents.ts`
- [x] Create schema index re-exporting all schemas
- [x] Create Drizzle client factory (`client.ts`)
- [x] Create migration runner (`migrate.ts`)
- [ ] Generate initial migration

### Shared Packages
- [x] Set up `packages/shared` (types, constants, validators)
- [x] Define shared TypeScript types (`types.ts`)
- [x] Define shared constants: risk levels, severity levels, statuses (`constants.ts`)
- [x] Define shared Zod validators (`validators.ts`)
- [x] Set up `packages/ui` with shadcn/ui base components
- [x] Set up `packages/compliance-content` package structure (nis2/, cra/)

### Worker (`apps/worker`)
- [x] Set up `apps/worker` package with BullMQ
- [x] Create worker entry point (`src/index.ts`)
- [ ] Create placeholder job handlers (sbom-generate, sbom-parse, vuln-scan, pdf-generate, email-send, reminder)

### Docker & Infrastructure
- [x] Create `docker/docker-compose.yml` for local development (PostgreSQL, Redis, MinIO)
- [x] Create `docker/Dockerfile.web` for Next.js standalone build
- [x] Create `docker/Dockerfile.worker` for background worker
- [x] Create `docker/nginx.conf` reverse proxy config
- [x] Create `docker/docker-compose.prod.yml` for production

### Authentication
- [x] Install and configure auth library (NextAuth.js v5)
- [x] Set up auth configuration (`lib/auth.ts`)
- [x] Create registration page (`(auth)/register/page.tsx`)
- [x] Create login page (`(auth)/login/page.tsx`)
- [x] Create forgot-password page
- [x] Set up auth middleware (`middleware.ts`) — protect `(app)` routes
- [x] Implement session management (JWT-based)
- [x] Set up role-based access control (admin, compliance_officer, viewer, auditor)

### CI/CD
- [x] Set up GitHub Actions CI pipeline (type check, lint, test, build)

---

## Sprint 1: Onboarding & NIS2 Applicability Check
- [x] Build multi-step Wizard component (`packages/ui/src/wizard.tsx`)
- [x] Build onboarding wizard UI (4 steps)
- [x] Step 1: Company profile form (name, address, NACE codes, employees, revenue)
- [x] Step 2: NIS2 applicability decision tree (6-8 questions)
- [x] Step 3: CRA applicability check (3 questions)
- [x] Step 4: Result & recommendation page
- [x] Create NIS2 sector definitions JSON (`packages/compliance-content/nis2/sectors.json`)
- [x] Implement NIS2 applicability engine (`lib/services/nis2-applicability.ts`)
- [x] Implement CRA applicability check logic (`lib/services/cra-classifier.ts`)
- [x] Create Server Actions for onboarding data (`lib/actions/onboarding.ts`)
- [x] Build result card with personalized recommendations
- [ ] PDF export of applicability result (React-PDF)
- [ ] Public Betroffenheits-Check page (no login, lead generation)

---

## Sprint 2: Asset Inventory & Risk Assessment (Part 1)
- [x] Asset CRUD Server Actions (`lib/actions/assets.ts`)
- [x] Asset inventory page with DataTable (add, edit, delete, CSV import) (`organisation/assets/page.tsx`)
- [x] Risk assessment wizard UI (3 steps: assets → threats → treatment) (`organisation/risiken/page.tsx`)
- [x] Industry-specific threat catalogs as JSON content (`compliance-content/threats/threat-catalog.json`)
- [x] Risk scoring engine (5×5 matrix) (`lib/services/risk-scoring.ts`)
- [x] BSI IT-Grundschutz Bausteine mapping (top 30 controls) (`compliance-content/bsi/grundschutz-controls.json`)

---

## Sprint 3: Risk Assessment (Part 2) & Controls Tracker
- [x] Risk heatmap visualization (Recharts)
- [x] Risk register table with filtering/sorting
- [x] Risk treatment plan workflow
- [x] Controls tracker page (grouped by NIS2 article)
- [x] Control detail panel (instructions, evidence upload, assign, deadline)
- [x] Compliance score calculation service
- [x] Dashboard stats cards & donut charts

---

## Sprint 4: Policy Templates & Product Inventory
- [x] Policy template system (docxtemplater integration)
- [x] Policy library page (browse, preview, download, upload)
- [x] Product registration form with CRA classification wizard
- [x] CRA category classifier engine
- [x] Product portfolio overview page

---

## Sprint 5: SBOM Manager
- [x] Worker process setup (BullMQ, Docker socket access)
- [x] SBOM upload API route (validation, S3 upload, queue job)
- [x] SBOM parser: SPDX JSON + CycloneDX JSON
- [x] Syft integration (Docker CLI wrapper)
- [x] SBOM viewer page (component table, search, filter)
- [x] Component detail slide-in panel
- [x] SBOM diff view (compare versions)

---

## Sprint 6: Vulnerability Monitoring
- [x] NVD API v2 client with rate limiting
- [x] OSV.dev API client (single + batch query)
- [x] Vulnerability matching engine (CPE + PURL + fuzzy)
- [x] Nightly scan job (BullMQ repeatable)
- [x] Vulnerability dashboard per product
- [x] Vulnerability triage workflow
- [x] Email notification for new Critical/High vulnerabilities

---

## Sprint 7: Incident Management
- [x] Incident detection wizard (decision tree)
- [x] Incident severity classification engine
- [x] Incident detail page with timer dashboard (24h/72h/30d)
- [x] Incident timeline component
- [x] BSI early warning report template (pre-filled PDF)
- [x] CRA vulnerability reporting workflow (24h/72h/14d)
- [x] Communication templates

---

## Sprint 8: Supplier Management
- [x] Supplier inventory page (add, edit, CSV import, risk classification)
- [x] Supplier security questionnaire content (30-40 questions, DE + EN)
- [x] Questionnaire email sending (Resend integration)
- [x] Supplier portal (token-based, no login, separate layout)
- [x] Questionnaire scoring algorithm
- [x] Supplier risk dashboard (heatmap, scores, overdue tracking)

---

## Sprint 9: Conformity Documentation & Evidence Management
- [x] CRA Annex VII tech doc template (guided form)
- [x] EU Declaration of Conformity generator (React-PDF)
- [x] Module A self-assessment workflow
- [x] Evidence repository (upload, version, tag, search)
- [x] Management summary PDF (Puppeteer)
- [x] Auditor portal (read-only view)

---

## Sprint 10: Polish, Testing, Launch
- [x] End-to-end testing (Playwright)
- [x] Security review
- [x] Performance testing
- [x] German language review (all UI text)
- [x] Help center content
- [x] Landing page / marketing site
- [x] Production deployment, monitoring (Grafana), error tracking (Sentry)
