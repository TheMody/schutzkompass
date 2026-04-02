# SchutzKompass — Comprehensive Feature Review & Testing

> Systematic review of every feature: working? ✓  UX sensible? ✓  Improvements? ✓  Automated test? ✓

---

## Feature Checklist

### A. Authentication & User Management

- [x] **F01: Login (email/password)** ✅
  - **Working:** Yes — email/password form with loading state, error display, `loginUser` server action.
  - **UX:** Good — clear German labels, loading spinner, error messages, link to register.
  - **Improvements:** Missing "Passwort vergessen?" link on login page.
  - **Test:** `tests/auth/auth-actions.test.ts` ✅

- [x] **F02: Registration (name, company, email, password → auto-login)** ✅
  - **Working:** Yes — 4 fields, auto-login after registration, fallback redirect to `/login`.
  - **UX:** Good — `minLength={8}` validation, auto-login is smooth.
  - **Improvements:** No password strength indicator or confirm-password field.
  - **Test:** `tests/auth/auth-actions.test.ts` ✅

- [x] **F03: Password Reset page** ✅
  - **Working:** Partial — UI exists but backend is a `TODO` stub (just `setTimeout`).
  - **UX:** Sensible two-state design (form → confirmation).
  - **Improvements:** Needs actual email sending implementation.
  - **Test:** `tests/auth/auth-actions.test.ts` ✅

- [x] **F04: Session Management (top-bar user menu, logout)** ✅
  - **Working:** Yes — `useSession()` from next-auth, user name/email, `signOut()`.
  - **UX:** Good — dropdown with user info, outside-click to close.
  - **Improvements:** Consider user avatar/initials.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F05: Root redirect (/ → /dashboard)** ✅
  - **Working:** Yes — `redirect('/dashboard')`.
  - **Test:** `tests/auth/auth-actions.test.ts` ✅

### B. Onboarding & Compliance Check

- [x] **F06: Onboarding Wizard (4-step)** ✅
  - **Working:** Yes — 876-line page: Unternehmen → NIS2-Check → CRA-Check → Ergebnis.
  - **UX:** Good — progress bar, back/next nav, results with badges.
  - **Improvements:** Wizard doesn't save progress mid-way.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F07: NIS2 Applicability Engine** ✅ 27 tests
  - **Test:** `tests/services/nis2-applicability.test.ts` ✅

- [x] **F08: CRA Classification Engine** ✅ 28 tests
  - **Test:** `tests/services/cra-classifier.test.ts` ✅

- [x] **F09: Onboarding Results Persistence & Dashboard Integration** ✅
  - **Working:** Yes — `saveOnboardingResults()` / `getOnboardingStatus()` with in-memory store. Dashboard shows dynamic next steps.
  - **Improvements:** Data is in-memory (lost on restart). Should persist to database.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### C. Dashboard

- [x] **F10: Dashboard Overview Cards** ✅
  - **Working:** Yes — 4 cards (compliance %, assets, open controls, critical risks) from server actions.
  - **UX:** Good — icons, linked to detail pages, fallback "—" for missing data.
  - **Improvements:** Consider trend indicators (↑↓).
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F11: Compliance Donut Chart** ✅
  - **Working:** Yes — SVG donut, percentage center, status legend.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F12: Risk Heatmap Chart** ✅
  - **Working:** Yes — 5×5 grid with risk entry dots.
  - **Improvements:** Consider adding axis labels.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F13: Risk Distribution Bar Chart** ✅
  - **Working:** Yes — 5 risk level bars with counts.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F14: Next Steps (dynamic/static)** ✅
  - **Working:** Yes — dynamic from onboarding results or 5 static defaults with links.
  - **UX:** Excellent — `stepToLink()` maps steps to pages, NIS2/CRA badges.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### D. Asset Management

- [x] **F15: Asset Inventory (CRUD table + search/filter)** ✅
  - **Working:** Yes — full CRUD, search, category/criticality filters, stats cards.
  - **Improvements:** No pagination for large lists.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F16: Asset CSV Import** ✅
  - **Working:** Yes — `importAssetsFromCsv()`, drag-and-drop upload.
  - **Improvements:** No sample CSV template. No preview/validation.
  - **Test:** `tests/actions/action-structure.test.ts` ✅

- [x] **F17: Asset Types & Criticality Classification** ✅
  - **Working:** Yes — 8 types, 4 criticality levels with German labels.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### E. Risk Management

- [x] **F18: Risk Assessment Wizard (3-step)** ✅
  - **Working:** Yes — Identify (threat catalog) → Evaluate (L×I sliders) → Treat (assignment).
  - **Improvements:** No custom threat option. No residual risk assessment.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F19: Risk Scoring Engine (5×5 matrix)** ✅ 30 tests
  - **Test:** `tests/services/risk-scoring.test.ts` ✅

- [x] **F20: Risk Register Table** ✅
  - **Working:** Yes — entries with level badges, treatments, grouped by assessment.
  - **Improvements:** No column sorting. No export.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F21: Risk Heatmap Mini Visualization** ✅
  - **Working:** Yes — same component on dashboard and risk page.
  - **Test:** Covered by F12. ✅

### F. Controls & Measures

- [x] **F22: Controls Tracker (BSI/NIS2)** ✅
  - **Working:** Yes — BSI controls by NIS2 article, status tracking, search/filter.
  - **Improvements:** No priority/deadline. No audit trail.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F23: Control Status Workflow** ✅
  - **Working:** Yes — not_started → in_progress → implemented → verified.
  - **Improvements:** No workflow enforcement.
  - **Test:** `tests/actions/action-structure.test.ts` ✅

- [x] **F24: Compliance Score Calculation** ✅
  - **Working:** Yes — `getControlsStatistics()` calculates from status ratios.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F25: Control Detail Panel** ✅
  - **Working:** Yes — inline edit for assignee/notes.
  - **Improvements:** No deadline field visible.
  - **Test:** Covered by F22/F23. ✅

### G. Policy Library

- [x] **F26: Policy Library (12 templates)** ✅
  - **Working:** Yes — 12 policies with full German document content (6-11 sections each), categories, search.
  - **Test:** `tests/shared/constants.test.ts` + `tests/pages/page-structure.test.ts` ✅

- [x] **F27: Policy Detail Modal** ✅
  - **Working:** Yes — Info/Dokument tabs, accordion sections, expand/collapse all, table of contents.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F28: Policy Markdown Download** ✅
  - **Working:** Yes — generates Markdown with metadata + all sections + disclaimer.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### H. Supply Chain Security

- [x] **F29: Supplier Management** ✅
  - **Working:** Yes — create/read with risk class, score, questionnaire status.
  - **Improvements:** No edit/delete for existing suppliers.
  - **Test:** `tests/pages/page-structure.test.ts` + `tests/actions/action-structure.test.ts` ✅

- [x] **F30: Supplier Questionnaire System** ✅
  - **Working:** Yes — 30 questions, 7 categories, weighted scoring, send/score actions.
  - **Improvements:** Public page (`/fragebogen/[token]`) is placeholder stub.
  - **Test:** `tests/constants/extracted-constants.test.ts` ✅

- [x] **F31: Supplier Score Tracking** ✅
  - **Working:** Yes — score 0-100, status badges.
  - **Improvements:** No historical tracking.
  - **Test:** Covered by F29/F30. ✅

### I. Incident Management

- [x] **F32: Incident Reporting Wizard** ✅
  - **Working:** Yes — title, 8 categories, 4 severities, description, affected systems, CRA flag.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F33: Incident List & Filtering** ✅
  - **Working:** Yes — search, category filter, severity/status badges.
  - **Improvements:** No date range filter.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F34: Incident Detail Panel & Status Workflow** ✅
  - **Working:** Yes — timeline, communication templates (BSI Frühwarnung/Vorfallmeldung/Abschlussbericht), deadline cards.
  - **UX:** Excellent — NIS2 Art. 23 templates, color-coded urgency.
  - **Improvements:** Templates are UI-only (no document generation).
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F35: NIS2 Reporting Deadline Tracking** ✅
  - **Working:** Yes — 24h/72h/30d automatic deadlines with countdown.
  - **UX:** Excellent — `DeadlineCard` with overdue warnings.
  - **Improvements:** No reminder/notification system.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### J. Audit & Evidence

- [x] **F36: Audit & Evidence Management** ✅
  - **Working:** Yes — evidence repository with search, tags, file metadata, auditor portal link.
  - **Improvements:** Upload is UI-only. Auditor link is placeholder.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F37: Compliance Readiness Check** ✅
  - **Working:** Yes — checks Annex VII, EU Declaration, Module A status (missing/in progress/approved).
  - **Improvements:** Add more criteria (controls, SBOM status).
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### K. Product Management (CRA)

- [x] **F38: Product Inventory (CRUD + CRA category)** ✅
  - **Working:** Yes — create/read with auto-CRA classification, lifecycle status.
  - **Improvements:** No edit/delete.
  - **Test:** `tests/pages/page-structure.test.ts` + `tests/actions/action-structure.test.ts` ✅

- [x] **F39: Product Statistics** ✅
  - **Working:** Yes — stats cards (total, by category, active/EOL).
  - **Test:** Covered by F38. ✅

- [x] **F40: SBOM Manager** ✅
  - **Working:** Yes — list, component tree, license display, upload/delete.
  - **Improvements:** No actual CycloneDX/SPDX parsing.
  - **Test:** `tests/actions/action-structure.test.ts` ✅

- [x] **F41: Vulnerability Monitor & Triage** ✅
  - **Working:** Yes — vulnerability list, severity, CVSS, triage workflow.
  - **Improvements:** No CVE auto-lookup. No SBOM correlation.
  - **Test:** `tests/actions/action-structure.test.ts` ✅

- [x] **F42: Meldewesen (Regulatory Reports)** ✅
  - **Working:** Yes — report management for NIS2/CRA/BSI/ENISA.
  - **Improvements:** No document generation.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F43: Conformity Documentation** ✅
  - **Working:** Yes — 8 Annex VII sections, EU declaration, Module A self-assessment.
  - **Improvements:** No document export. Section content is structure only.
  - **Test:** `tests/constants/extracted-constants.test.ts` ✅

- [x] **F44: Product Lifecycle Management** ✅
  - **Working:** Yes — timeline (Development → Active → Maintenance → EOL), support periods.
  - **Improvements:** No EOL notifications. No CRA Art. 10 tracking.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### L. Settings & Help

- [x] **F45: Organisation Settings** ✅
  - **Working:** Partial — form UI works but save is local state only (not persisted).
  - **Improvements:** Needs database persistence.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F46: User & Role Management** ✅
  - **Working:** Partial — hardcoded member list, invite UI but no backend.
  - **UX:** Good — role descriptions (Admin/Bearbeiter/Betrachter).
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F47: Integrations Page** ✅
  - **Working:** UI-only — 6 integrations listed, 2 shown "connected", none functional.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F48: Help & FAQ Page** ✅
  - **Working:** Yes — 7 FAQ items with accordion, 4 guide links, support contact.
  - **UX:** Excellent — category filters, collapsible answers.
  - **Improvements:** Guide links are `#` (dead). Should link to actual docs.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### M. Navigation & Layout

- [x] **F49: App Sidebar** ✅
  - **Working:** Yes — 3 nav groups + Dashboard + Help. Active highlighting.
  - **UX:** Excellent — clean hierarchy, Lucide icons.
  - **Improvements:** No collapse/mobile toggle.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F50: Top Bar (notifications, user menu)** ✅
  - **Working:** Yes — notification bell with badge, user dropdown with signOut.
  - **Improvements:** Notifications are MOCK_NOTIFICATIONS. No real-time system.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

### N. Infrastructure & Known Issues

- [x] **F51: Compliance Content Package** ✅
  - **Test:** `tests/shared/constants.test.ts` ✅

- [x] **F52: Shared Types Package** ✅ 28 tests
  - **Test:** `tests/shared/constants.test.ts` ✅

- [x] **F53: BUG — "use server" const exports** ✅ FIXED
  - **Fix:** Extracted 4 constant files. Regression guard tests in place.
  - **Test:** `tests/actions/action-structure.test.ts` — 8 regression + validation tests. ✅

- [x] **F54: Betroffenheits-Check Page** ✅
  - **Working:** Yes — CTA linking to `/onboarding`.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

- [x] **F55: Supplier Questionnaire Public Page (placeholder)** ✅
  - **Working:** Placeholder only — "Sprint 8 implementiert."
  - **Improvements:** Needs full 30-question form, token validation, response submission.
  - **Test:** `tests/pages/page-structure.test.ts` ✅

---

## Test Summary

| Test File | Tests | Description |
|-----------|-------|-------------|
| `tests/pages/page-structure.test.ts` | 55 | All 26 pages — structure, imports, German labels |
| `tests/actions/action-structure.test.ts` | 32 | All 12 action files — exports, F53 regression guards |
| `tests/services/risk-scoring.test.ts` | 30 | Risk scoring engine (5×5 matrix, levels, treatment) |
| `tests/services/cra-classifier.test.ts` | 28 | CRA product classification (4 categories, precedence) |
| `tests/shared/constants.test.ts` | 28 | Shared package — types, labels, risk levels, colors |
| `tests/services/nis2-applicability.test.ts` | 27 | NIS2 applicability check (sectors, sizes, entities) |
| `tests/constants/extracted-constants.test.ts` | 16 | Extracted constants — incidents, suppliers, conformity, vuln |
| `tests/auth/auth-actions.test.ts` | 9 | Auth — login/register/reset, middleware, root redirect |
| **Total** | **225** | **All passing ✅ (754ms)** |

---

## Cross-Cutting UX Findings

1. **Hardcoded Colors**: 10 files still use `bg-[#1e3a5f]` instead of `bg-primary` (audit, hilfe, vorfaelle, lieferkette, konformitaet, meldungen, 4 settings pages)
2. **In-Memory Data**: All server actions use in-memory arrays — data lost on restart
3. **UI-Only Features**: Password reset, file upload, integrations, report generation, notifications
4. **No Pagination**: Tables will be slow with many records
5. **No Mobile**: Fixed 240px sidebar, no hamburger toggle

---

## Improvement Priorities

1. 🔴 **Database persistence** — Replace in-memory stores with DB operations
2. 🔴 **Supplier questionnaire public page** — Implement full 30-question form (F55)
3. 🟡 **Password reset** — Connect to email service (F03)
4. 🟡 **Fix hardcoded colors** — Replace `bg-[#1e3a5f]` with `bg-primary` in 10 files
5. 🟡 **File upload** — SBOM parsing, evidence upload
6. 🟢 **Pagination** — All table views
7. 🟢 **Mobile sidebar** — Collapsible with hamburger
8. 🟢 **Real notifications** — WebSocket/SSE for live alerts
