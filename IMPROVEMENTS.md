# Improvement Implementation Plan

Working through each improvement priority from the feature review.

---

## Improvement 1: Fix Hardcoded Colors (QUICK WIN)
> Replace `bg-[#1e3a5f]` / `hover:bg-[#2a4f7f]` / `border-[#1e3a5f]` with semantic `bg-primary` / `hover:bg-primary/80` / `border-primary` in 10 files.

- [x] 1.1 `organisation/audit/page.tsx` — 3 bg + 1 text ✅
- [x] 1.2 `organisation/vorfaelle/page.tsx` — 4 bg + 1 text ✅
- [x] 1.3 `organisation/lieferkette/page.tsx` — 5 bg ✅
- [x] 1.4 `produkte/konformitaet/page.tsx` — 3 bg + 2 text ✅
- [x] 1.5 `produkte/meldungen/page.tsx` — 1 bg ✅
- [x] 1.6 `einstellungen/organisation/page.tsx` — 1 bg ✅
- [x] 1.7 `einstellungen/benutzer/page.tsx` — 2 bg ✅
- [x] 1.8 `einstellungen/profil/page.tsx` — 1 bg ✅
- [x] 1.9 `einstellungen/integrationen/page.tsx` — 1 bg + 1 text ✅
- [x] 1.10 `hilfe/page.tsx` — 3 bg + 1 text ✅
- [x] 1.11 Verify: `grep -rn '[#' apps/web/app/` returns 0 results ✅

## Improvement 2: Supplier Questionnaire Public Page (F55)
> Build the full 30-question form at `/fragebogen/[token]` for external suppliers.

- [x] 2.1 Create token validation server action (`getSupplierByToken`) ✅
- [x] 2.2 Build full questionnaire page with all 30 questions grouped by 7 categories ✅
- [x] 2.3 Add response submission server action (`submitQuestionnaireResponses`) ✅
- [x] 2.4 Show completion/thank-you state after submission ✅
- [x] 2.5 Wire up score calculation on submission ✅

## Improvement 3: Password Reset (F03)
> Implement token-based password reset flow (no real email, but full backend logic).

- [x] 3.1 Add `requestPasswordReset` action with token generation & storage ✅
- [x] 3.2 Add `resetPassword` action with token validation & password update ✅
- [x] 3.3 Update password-reset page to call real action ✅
- [x] 3.4 Add "Passwort vergessen?" link on login page ✅

## Improvement 4: Pagination
> Add pagination to all table views.

- [x] 4.1 Create reusable `Pagination` component + `usePagination` hook ✅
- [x] 4.2 Add pagination to Assets page ✅
- [x] 4.3 Add pagination to Incidents (Vorfälle) page ✅
- [x] 4.4 Add pagination to Suppliers (Lieferkette) page ✅
- [x] 4.5 Add pagination to Products page ✅
- [x] 4.6 Add pagination to Vulnerabilities (Schwachstellen) page ✅
- [x] 4.7 Add pagination to Meldungen page ✅
- [x] 4.8 Add pagination to Audit page ✅
- [x] 4.9 Add pagination to SBOM page ✅

## Improvement 5: Mobile Sidebar
> Make sidebar collapsible with hamburger toggle for mobile.

- [x] 5.1 Add sidebar context provider (`SidebarProvider` + `useSidebar` hook) ✅
- [x] 5.2 Add mobile overlay mode (hamburger in top-bar, overlay backdrop) ✅
- [x] 5.3 Add responsive breakpoints (hidden < lg, static ≥ lg) ✅
- [x] 5.4 Close sidebar on route change (mobile) ✅
- [x] 5.5 Add close button (X) in sidebar header on mobile ✅

## Improvement 6: Real Notifications
> Replace mock notifications with a notification store + real events.

- [x] 6.1 Create notification store (`apps/web/lib/actions/notifications.ts`) with CRUD actions ✅
- [x] 6.2 Generate real notifications from incident creation + questionnaire submission ✅
- [x] 6.3 Mark as read / dismiss functionality (server-side) ✅
- [x] 6.4 Update top-bar bell to use real notification store + live loading ✅
- [x] 6.5 Add `formatTimeAgo` helper for relative timestamps ✅

## Improvement 7: Login Page — "Passwort vergessen?" Link
> Already handled in Improvement 3.4

## Improvement 8: Registration — Password Strength Indicator
- [x] 8.1 Create `PasswordStrengthMeter` component with visual strength bar + checklist ✅
- [x] 8.2 Integrate into registration page with live updates ✅

---

## Progress
- ✅ All improvements completed!
