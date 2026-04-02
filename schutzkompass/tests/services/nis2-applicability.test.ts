/**
 * F07: NIS2 Applicability Engine — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import { checkNis2Applicability, type Nis2ApplicabilityInput } from '@/lib/services/nis2-applicability';

function makeInput(overrides: Partial<Nis2ApplicabilityInput> = {}): Nis2ApplicabilityInput {
  return {
    sectors: [],
    employeeCount: 100,
    annualRevenue: 20_000_000,
    ...overrides,
  };
}

describe('checkNis2Applicability', () => {
  // ── Size classification ──────────────────────────────────────
  it('classifies large enterprise (≥250 employees)', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 250 }));
    expect(result.sizeCategory).toBe('large');
  });

  it('classifies large enterprise (≥50M revenue)', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], annualRevenue: 50_000_000 }));
    expect(result.sizeCategory).toBe('large');
  });

  it('classifies medium enterprise (≥50 employees)', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 50, annualRevenue: 5_000_000 }));
    expect(result.sizeCategory).toBe('medium');
  });

  it('classifies medium enterprise (≥10M revenue)', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 30, annualRevenue: 10_000_000 }));
    expect(result.sizeCategory).toBe('medium');
  });

  it('classifies small enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 10, annualRevenue: 2_000_000 }));
    expect(result.sizeCategory).toBe('small');
  });

  it('classifies micro enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 5, annualRevenue: 500_000 }));
    expect(result.sizeCategory).toBe('micro');
  });

  // ── Basic applicability ──────────────────────────────────────
  it('not applicable when no sectors and medium size', () => {
    const result = checkNis2Applicability(makeInput({ sectors: [] }));
    expect(result.applicable).toBe(false);
    expect(result.entityType).toBe('not_applicable');
  });

  it('applicable as essential for Annex I + large enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 300 }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('essential');
  });

  it('applicable as important for Annex I + medium enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 100, annualRevenue: 15_000_000 }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('important');
  });

  it('applicable as important for Annex II + medium enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['food'], employeeCount: 100 }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('important');
  });

  it('applicable as important for Annex II + large enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['food'], employeeCount: 300 }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('important');
  });

  it('not applicable for Annex I sector but small enterprise', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 10, annualRevenue: 2_000_000 }));
    expect(result.applicable).toBe(false);
  });

  // ── Sector matching ──────────────────────────────────────────
  it('correctly matches Annex I sectors', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy', 'health'], employeeCount: 300 }));
    expect(result.matchedSectors).toHaveLength(2);
    expect(result.matchedSectors.every((s) => s.annex === 'I')).toBe(true);
  });

  it('correctly matches Annex II sectors', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['food', 'chemicals'] }));
    expect(result.matchedSectors).toHaveLength(2);
    expect(result.matchedSectors.every((s) => s.annex === 'II')).toBe(true);
  });

  it('matches mixed Annex I and II sectors', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy', 'food'] }));
    const annexes = result.matchedSectors.map((s) => s.annex);
    expect(annexes).toContain('I');
    expect(annexes).toContain('II');
  });

  it('all matched sectors have German labels', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy', 'food', 'health'] }));
    for (const s of result.matchedSectors) {
      expect(s.label).toBeTruthy();
      expect(s.label).not.toBe(s.sector); // label should be German, not the sector ID
    }
  });

  // ── Special cases (size-independent) ─────────────────────────
  it('DNS/TLD provider → essential regardless of size', () => {
    const result = checkNis2Applicability(makeInput({
      sectors: [],
      employeeCount: 5,
      annualRevenue: 100_000,
      providesDnsOrTldServices: true,
    }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('essential');
  });

  it('trust service provider → essential regardless of size', () => {
    const result = checkNis2Applicability(makeInput({
      sectors: [],
      employeeCount: 5,
      annualRevenue: 100_000,
      isTrustServiceProvider: true,
    }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('essential');
  });

  it('CER critical entity → essential regardless of size', () => {
    const result = checkNis2Applicability(makeInput({
      sectors: [],
      employeeCount: 5,
      annualRevenue: 100_000,
      wasCriticalUnderCer: true,
    }));
    expect(result.applicable).toBe(true);
    expect(result.entityType).toBe('essential');
  });

  it('public administration → applicable', () => {
    const result = checkNis2Applicability(makeInput({
      sectors: ['public_administration'],
      employeeCount: 100,
      isPublicAdministration: true,
    }));
    expect(result.applicable).toBe(true);
  });

  it('sole provider of critical service → applicable', () => {
    const result = checkNis2Applicability(makeInput({
      sectors: [],
      employeeCount: 5,
      annualRevenue: 100_000,
      isSoleProviderOfCriticalService: true,
    }));
    expect(result.applicable).toBe(true);
  });

  it('explicitly designated → applicable', () => {
    const result = checkNis2Applicability(makeInput({
      sectors: [],
      employeeCount: 5,
      annualRevenue: 100_000,
      isExplicitlyDesignated: true,
    }));
    expect(result.applicable).toBe(true);
  });

  // ── Confidence ───────────────────────────────────────────────
  it('low confidence when no sectors selected', () => {
    const result = checkNis2Applicability(makeInput({ sectors: [] }));
    expect(result.confidence).toBe('low');
  });

  it('high confidence for clear large+Annex I case', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 300 }));
    expect(result.confidence).toBe('high');
  });

  it('medium confidence for small enterprise in NIS2 sector', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 15, annualRevenue: 3_000_000 }));
    expect(result.confidence).toBe('medium');
  });

  // ── Reasoning ────────────────────────────────────────────────
  it('always provides reasoning array', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 300 }));
    expect(Array.isArray(result.reasoning)).toBe(true);
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it('reasoning is in German', () => {
    const result = checkNis2Applicability(makeInput({ sectors: ['energy'], employeeCount: 300 }));
    // Check for common German words
    const combined = result.reasoning.join(' ');
    expect(combined).toMatch(/Ihre Organisation|Sektor|Einrichtung|Größen/);
  });
});
