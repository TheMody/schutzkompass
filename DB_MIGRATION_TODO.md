# Database Migration & Feature Fix TODO

## Issues to Fix
1. **Assets vanish** — `assets.ts` uses in-memory array, data lost between navigations
2. **Risikobewertungen not saved** — `risks.ts` uses in-memory arrays, entries lost
3. **Kommunikationsvorlagen not implemented** — TemplateButton does nothing on click
4. **All other actions** — incidents, suppliers, controls, products, sbom, vulnerabilities, conformity, notifications — all in-memory

## Implementation Plan

### Phase 1: Core DB migration (fixes issues 1 & 2)
- [ ] 1.1 Create helper `getOrgId()` to extract organisationId from session
- [ ] 1.2 Migrate `assets.ts` actions to Drizzle (getAssets, createAsset, updateAsset, deleteAsset)
- [ ] 1.3 Migrate `risks.ts` actions to Drizzle (assessments + entries)
- [ ] 1.4 Migrate `incidents.ts` actions to Drizzle 

### Phase 2: Fix Kommunikationsvorlagen (issue 3)
- [ ] 2.1 Create communication templates data + generate function in incidents.ts
- [ ] 2.2 Make TemplateButton open a modal/panel with pre-filled template content

### Phase 3: Remaining actions
- [ ] 3.1 Migrate `controls.ts` to Drizzle
- [ ] 3.2 Migrate `suppliers.ts` to Drizzle
- [ ] 3.3 Migrate `products.ts` to Drizzle
- [ ] 3.4 Migrate `sbom.ts` to Drizzle
- [ ] 3.5 Migrate `vulnerabilities.ts` to Drizzle
- [ ] 3.6 Migrate `conformity.ts` to Drizzle
- [ ] 3.7 Migrate `notifications.ts` to Drizzle

### Phase 4: Verification
- [ ] 4.1 Test all pages work with DB persistence
- [ ] 4.2 Update tests for DB-backed actions
- [ ] 4.3 Run full test suite
