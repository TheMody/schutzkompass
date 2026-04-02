# DB Migration TODO

## Phase 1: Core DB Migration
- [x] 1.1 Create helper `getOrgId()` / `getUserId()` in `helpers.ts`
- [x] 1.2 Migrate `assets.ts` to Drizzle
- [x] 1.3 Migrate `risks.ts` to Drizzle
- [x] 1.4 Migrate `incidents.ts` to Drizzle (+ communication templates)

## Phase 2: Kommunikationsvorlagen UI
- [x] 2.1 Add `generateCommunicationTemplate()` server action in incidents.ts
- [x] 2.2 Wire up TemplateButton in vorfaelle/page.tsx to open template modal

## Phase 3: Remaining Action Files
- [x] 3.1 Migrate `controls.ts` to Drizzle (with BSI auto-seed)
- [x] 3.2 Migrate `suppliers.ts` to Drizzle
- [x] 3.3 Migrate `products.ts` to Drizzle
- [x] 3.4 Migrate `sbom.ts` to Drizzle
- [x] 3.5 Migrate `vulnerabilities.ts` to Drizzle
- [x] 3.6 Migrate `conformity.ts` to Drizzle
- [ ] 3.7 `notifications.ts` — keep in-memory (no DB table)

## Phase 4: Verification
- [ ] 4.1 Build succeeds (`pnpm build`)
- [ ] 4.2 Dev server runs, test all 3 original bugs
- [ ] 4.3 Push to GitHub
