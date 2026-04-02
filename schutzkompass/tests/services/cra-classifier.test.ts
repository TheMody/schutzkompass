/**
 * F08: CRA Classification Engine — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import { classifyCraProduct, type CraClassificationInput } from '@/lib/services/cra-classifier';

function makeInput(overrides: Partial<CraClassificationInput> = {}): CraClassificationInput {
  return {
    hasDigitalElements: true,
    productType: 'Test Product',
    isPlacedOnEuMarket: true,
    characteristics: {},
    ...overrides,
  };
}

describe('classifyCraProduct', () => {
  // ── Non-applicable cases ─────────────────────────────────────
  it('not applicable if product has no digital elements', () => {
    const result = classifyCraProduct(makeInput({ hasDigitalElements: false }));
    expect(result.applicable).toBe(false);
    expect(result.category).toBe('not_applicable');
    expect(result.conformityPathways).toHaveLength(0);
    expect(result.minimumSupportPeriodYears).toBe(0);
  });

  it('not applicable if product is not placed on EU market', () => {
    const result = classifyCraProduct(makeInput({ isPlacedOnEuMarket: false }));
    expect(result.applicable).toBe(false);
    expect(result.category).toBe('not_applicable');
  });

  // ── Default category ─────────────────────────────────────────
  it('classifies as default when no special characteristics', () => {
    const result = classifyCraProduct(makeInput());
    expect(result.applicable).toBe(true);
    expect(result.category).toBe('default');
    expect(result.categoryLabel).toContain('Standard');
    expect(result.conformityPathways).toHaveLength(1);
    expect(result.conformityPathways[0].id).toBe('self_assessment');
    expect(result.minimumSupportPeriodYears).toBe(5);
  });

  // ── Important Class I ────────────────────────────────────────
  it.each([
    { char: 'isIamSystem', label: 'IAM' },
    { char: 'isPasswordManager', label: 'Password Manager' },
    { char: 'isVpn', label: 'VPN' },
    { char: 'isSiemOrSecurityMonitoring', label: 'SIEM' },
    { char: 'isPkiOrCertManagement', label: 'PKI' },
    { char: 'isRouterOrModem', label: 'Router' },
    { char: 'isSmartHomeOrIoT', label: 'IoT' },
    { char: 'isRobot', label: 'Robot' },
  ])('classifies $label as important_class_1', ({ char }) => {
    const result = classifyCraProduct(makeInput({
      characteristics: { [char]: true },
    }));
    expect(result.applicable).toBe(true);
    expect(result.category).toBe('important_class_1');
    expect(result.categoryLabel).toContain('Klasse I');
    expect(result.minimumSupportPeriodYears).toBe(5);
  });

  it('important_class_1 offers harmonised standard and third-party pathways', () => {
    const result = classifyCraProduct(makeInput({ characteristics: { isVpn: true } }));
    const pathwayIds = result.conformityPathways.map((p) => p.id);
    expect(pathwayIds).toContain('harmonised_standard');
    expect(pathwayIds).toContain('third_party_assessment');
    expect(pathwayIds).toContain('eu_certification');
    expect(pathwayIds).not.toContain('self_assessment');
  });

  // ── Important Class II ───────────────────────────────────────
  it.each([
    { char: 'isOsOrHypervisor', label: 'OS/Hypervisor' },
    { char: 'isNetworkSecurityDevice', label: 'Network Security' },
    { char: 'isIndustrialControlSystem', label: 'ICS/SCADA' },
    { char: 'isBootManager', label: 'Boot Manager' },
  ])('classifies $label as important_class_2', ({ char }) => {
    const result = classifyCraProduct(makeInput({
      characteristics: { [char]: true },
    }));
    expect(result.applicable).toBe(true);
    expect(result.category).toBe('important_class_2');
    expect(result.categoryLabel).toContain('Klasse II');
  });

  it('important_class_2 requires third-party or EU certification', () => {
    const result = classifyCraProduct(makeInput({ characteristics: { isOsOrHypervisor: true } }));
    const pathwayIds = result.conformityPathways.map((p) => p.id);
    expect(pathwayIds).toContain('third_party_assessment');
    expect(pathwayIds).toContain('eu_certification');
    expect(pathwayIds).not.toContain('self_assessment');
    expect(pathwayIds).not.toContain('harmonised_standard');
  });

  // ── Critical ─────────────────────────────────────────────────
  it.each([
    { char: 'isHardwareSecurityModule', label: 'HSM' },
    { char: 'isSmartcard', label: 'Smartcard' },
    { char: 'isSecureMicroprocessor', label: 'Secure Microprocessor' },
  ])('classifies $label as critical', ({ char }) => {
    const result = classifyCraProduct(makeInput({
      characteristics: { [char]: true },
    }));
    expect(result.applicable).toBe(true);
    expect(result.category).toBe('critical');
    expect(result.categoryLabel).toContain('Kritisch');
    expect(result.minimumSupportPeriodYears).toBe(10);
  });

  it('critical requires EU certification as recommended pathway', () => {
    const result = classifyCraProduct(makeInput({ characteristics: { isHardwareSecurityModule: true } }));
    expect(result.recommendedPathway.id).toBe('eu_certification');
  });

  // ── Obligations ──────────────────────────────────────────────
  it('default products have core CRA obligations', () => {
    const result = classifyCraProduct(makeInput());
    expect(result.obligations.length).toBeGreaterThanOrEqual(7);
    const joined = result.obligations.join(' ');
    expect(joined).toContain('SBOM');
    expect(joined).toContain('Meldepflicht');
    expect(joined).toContain('CE-Kennzeichnung');
  });

  it('important/critical products have additional obligations', () => {
    const defaultResult = classifyCraProduct(makeInput());
    const importantResult = classifyCraProduct(makeInput({ characteristics: { isVpn: true } }));
    expect(importantResult.obligations.length).toBeGreaterThan(defaultResult.obligations.length);
  });

  it('critical infrastructure adds extra obligation', () => {
    const result = classifyCraProduct(makeInput({ characteristics: { isUsedInCriticalInfrastructure: true } }));
    const joined = result.obligations.join(' ');
    expect(joined).toContain('Kritische Infrastruktur');
  });

  it('personal data processing adds DSGVO obligation', () => {
    const result = classifyCraProduct(makeInput({ characteristics: { processesPersonalData: true } }));
    const joined = result.obligations.join(' ');
    expect(joined).toContain('DSGVO');
  });

  // ── Reasoning ────────────────────────────────────────────────
  it('always provides reasoning in German', () => {
    const result = classifyCraProduct(makeInput());
    expect(result.reasoning.length).toBeGreaterThan(0);
    const combined = result.reasoning.join(' ');
    expect(combined).toMatch(/Produkt|CRA|anwendbar/);
  });

  // ── Priority: Critical > Class II > Class I > Default ────────
  it('critical takes precedence over class I characteristics', () => {
    const result = classifyCraProduct(makeInput({
      characteristics: {
        isHardwareSecurityModule: true, // critical
        isVpn: true, // class I
      },
    }));
    expect(result.category).toBe('critical');
  });

  it('class II takes precedence over class I', () => {
    const result = classifyCraProduct(makeInput({
      characteristics: {
        isOsOrHypervisor: true, // class II
        isVpn: true, // class I
      },
    }));
    expect(result.category).toBe('important_class_2');
  });
});
