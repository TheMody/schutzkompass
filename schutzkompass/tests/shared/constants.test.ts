/**
 * F51/F52: Shared Constants & Types Package — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
  RISK_LEVELS,
  SEVERITY_LEVELS,
  USER_ROLES,
  NIS2_ENTITY_TYPES,
  CRA_CATEGORIES,
  CONFORMITY_PATHWAYS,
  ASSET_TYPES,
  CRITICALITY_LEVELS,
  RISK_TREATMENTS,
  CONTROL_STATUSES,
  VULNERABILITY_STATUSES,
  INCIDENT_STATUSES,
  SUPPLIER_RISK_CLASSES,
  QUESTIONNAIRE_STATUSES,
  SBOM_FORMATS,
  PRODUCT_TYPES,
  ASSESSMENT_STATUSES,
  CONTROL_PRIORITIES,
  AUDIT_ACTIONS,
  QUESTIONNAIRE_ANSWERS,
  calculateRiskLevel,
  COLORS,
} from '@schutzkompass/shared';

describe('Shared Constants', () => {
  it('RISK_LEVELS has 5 levels', () => {
    expect(RISK_LEVELS).toHaveLength(5);
    expect(RISK_LEVELS).toContain('critical');
    expect(RISK_LEVELS).toContain('negligible');
  });

  it('SEVERITY_LEVELS has 5 levels', () => {
    expect(SEVERITY_LEVELS).toHaveLength(5);
    expect(SEVERITY_LEVELS).toContain('critical');
    expect(SEVERITY_LEVELS).toContain('info');
  });

  it('USER_ROLES contains standard roles', () => {
    expect(USER_ROLES).toContain('admin');
    expect(USER_ROLES).toContain('viewer');
    expect(USER_ROLES).toContain('compliance_officer');
    expect(USER_ROLES).toContain('auditor');
  });

  it('NIS2_ENTITY_TYPES has 3 types', () => {
    expect(NIS2_ENTITY_TYPES).toContain('essential');
    expect(NIS2_ENTITY_TYPES).toContain('important');
    expect(NIS2_ENTITY_TYPES).toContain('not_applicable');
  });

  it('CRA_CATEGORIES has 5 categories', () => {
    expect(CRA_CATEGORIES).toContain('default');
    expect(CRA_CATEGORIES).toContain('important_class_I');
    expect(CRA_CATEGORIES).toContain('important_class_II');
    expect(CRA_CATEGORIES).toContain('critical');
    expect(CRA_CATEGORIES).toContain('out_of_scope');
  });

  it('CONFORMITY_PATHWAYS has 3 pathways', () => {
    expect(CONFORMITY_PATHWAYS).toContain('module_a');
    expect(CONFORMITY_PATHWAYS).toContain('module_b_c');
    expect(CONFORMITY_PATHWAYS).toContain('module_h');
  });

  it('ASSET_TYPES has common IT asset types', () => {
    expect(ASSET_TYPES).toContain('server');
    expect(ASSET_TYPES).toContain('network');
    expect(ASSET_TYPES).toContain('application');
  });

  it('CRITICALITY_LEVELS has 4 levels', () => {
    expect(CRITICALITY_LEVELS).toHaveLength(4);
    expect(CRITICALITY_LEVELS).toContain('critical');
    expect(CRITICALITY_LEVELS).toContain('low');
  });

  it('RISK_TREATMENTS has standard ISO 27005 treatments', () => {
    expect(RISK_TREATMENTS).toContain('mitigate');
    expect(RISK_TREATMENTS).toContain('accept');
    expect(RISK_TREATMENTS).toContain('transfer');
    expect(RISK_TREATMENTS).toContain('avoid');
  });

  it('CONTROL_STATUSES covers lifecycle', () => {
    expect(CONTROL_STATUSES).toContain('not_started');
    expect(CONTROL_STATUSES).toContain('in_progress');
    expect(CONTROL_STATUSES).toContain('implemented');
  });

  it('VULNERABILITY_STATUSES has triage states', () => {
    expect(VULNERABILITY_STATUSES).toContain('open');
    expect(VULNERABILITY_STATUSES).toContain('fixed');
    expect(VULNERABILITY_STATUSES).toContain('false_positive');
    expect(VULNERABILITY_STATUSES).toContain('triaged');
  });

  it('INCIDENT_STATUSES has NIS2-aligned states', () => {
    expect(INCIDENT_STATUSES).toContain('detected');
    expect(INCIDENT_STATUSES).toContain('early_warning_sent');
    expect(INCIDENT_STATUSES).toContain('closed');
  });

  it('SUPPLIER_RISK_CLASSES has 3 classes', () => {
    expect(SUPPLIER_RISK_CLASSES).toHaveLength(3);
  });

  it('QUESTIONNAIRE_STATUSES has workflow states', () => {
    expect(QUESTIONNAIRE_STATUSES).toContain('not_sent');
    expect(QUESTIONNAIRE_STATUSES).toContain('completed');
  });

  it('SBOM_FORMATS has standard formats', () => {
    expect(SBOM_FORMATS).toContain('cyclonedx');
    expect(SBOM_FORMATS).toContain('spdx');
  });

  it('PRODUCT_TYPES has product categories', () => {
    expect(PRODUCT_TYPES.length).toBeGreaterThan(0);
  });

  it('ASSESSMENT_STATUSES has workflow states', () => {
    expect(ASSESSMENT_STATUSES.length).toBeGreaterThan(0);
  });

  it('CONTROL_PRIORITIES has priority levels', () => {
    expect(CONTROL_PRIORITIES).toContain('must');
    expect(CONTROL_PRIORITIES).toContain('should');
    expect(CONTROL_PRIORITIES).toContain('nice_to_have');
  });

  it('AUDIT_ACTIONS has audit action types', () => {
    expect(AUDIT_ACTIONS.length).toBeGreaterThan(0);
  });

  it('QUESTIONNAIRE_ANSWERS has standard answers', () => {
    expect(QUESTIONNAIRE_ANSWERS).toContain('yes');
    expect(QUESTIONNAIRE_ANSWERS).toContain('no');
    expect(QUESTIONNAIRE_ANSWERS).toContain('partial');
    expect(QUESTIONNAIRE_ANSWERS).toContain('not_applicable');
  });
});

describe('calculateRiskLevel', () => {
  it('returns critical for score >= 20 (e.g. 5*5)', () => {
    expect(calculateRiskLevel(5, 5)).toBe('critical');
    expect(calculateRiskLevel(4, 5)).toBe('critical');
  });

  it('returns high for score >= 12 (e.g. 3*4)', () => {
    expect(calculateRiskLevel(3, 5)).toBe('high');
    expect(calculateRiskLevel(4, 3)).toBe('high');
  });

  it('returns medium for score >= 6 (e.g. 2*3)', () => {
    expect(calculateRiskLevel(3, 3)).toBe('medium');
    expect(calculateRiskLevel(2, 3)).toBe('medium');
  });

  it('returns low for score >= 3 (e.g. 1*3)', () => {
    expect(calculateRiskLevel(1, 4)).toBe('low');
    expect(calculateRiskLevel(1, 3)).toBe('low');
  });

  it('returns negligible for score < 3 (e.g. 1*2)', () => {
    expect(calculateRiskLevel(1, 2)).toBe('negligible');
    expect(calculateRiskLevel(1, 1)).toBe('negligible');
  });
});

describe('COLORS', () => {
  it('has primary and accent colors', () => {
    expect(COLORS.primary).toBeTruthy();
    expect(COLORS.accent).toBeTruthy();
  });

  it('has status colors', () => {
    expect(COLORS.destructive).toBeTruthy();
    expect(COLORS.warning).toBeTruthy();
    expect(COLORS.success).toBeTruthy();
    expect(COLORS.info).toBeTruthy();
  });

  it('has background colors', () => {
    expect(COLORS.background).toBeTruthy();
    expect(COLORS.backgroundMuted).toBeTruthy();
  });
});
