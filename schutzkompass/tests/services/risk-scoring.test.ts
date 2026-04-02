/**
 * F19: Risk Scoring Engine — Unit Tests
 *
 * Tests for the 5×5 risk matrix implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateRiskScore,
  adjustImpactByCriticality,
  getRiskMatrix,
  computeRiskStatistics,
} from '@/lib/services/risk-scoring';

describe('calculateRiskScore', () => {
  it('returns negligible for lowest inputs (1,1)', () => {
    const result = calculateRiskScore({ likelihood: 1, impact: 1 });
    expect(result.riskLevel).toBe('negligible');
    expect(result.riskScore).toBe(1);
    expect(result.likelihood).toBe(1);
    expect(result.impact).toBe(1);
  });

  it('returns critical for highest inputs (5,5)', () => {
    const result = calculateRiskScore({ likelihood: 5, impact: 5 });
    expect(result.riskLevel).toBe('critical');
    expect(result.riskScore).toBe(25);
  });

  it('returns critical for (5,4)', () => {
    const result = calculateRiskScore({ likelihood: 5, impact: 4 });
    expect(result.riskLevel).toBe('critical');
    expect(result.riskScore).toBe(20);
  });

  it('returns critical for (4,5)', () => {
    const result = calculateRiskScore({ likelihood: 4, impact: 5 });
    expect(result.riskLevel).toBe('critical');
    expect(result.riskScore).toBe(20);
  });

  it('returns medium for middle inputs (3,3)', () => {
    const result = calculateRiskScore({ likelihood: 3, impact: 3 });
    expect(result.riskLevel).toBe('medium');
    expect(result.riskScore).toBe(9);
  });

  it('returns high for (3,4)', () => {
    const result = calculateRiskScore({ likelihood: 3, impact: 4 });
    expect(result.riskLevel).toBe('high');
    expect(result.riskScore).toBe(12);
  });

  it('returns low for (2,2)', () => {
    const result = calculateRiskScore({ likelihood: 2, impact: 2 });
    expect(result.riskLevel).toBe('low');
    expect(result.riskScore).toBe(4);
  });

  it('clamps values above 5', () => {
    const result = calculateRiskScore({ likelihood: 10, impact: 7 });
    expect(result.likelihood).toBe(5);
    expect(result.impact).toBe(5);
    expect(result.riskLevel).toBe('critical');
  });

  it('clamps values below 1', () => {
    const result = calculateRiskScore({ likelihood: 0, impact: -1 });
    expect(result.likelihood).toBe(1);
    expect(result.impact).toBe(1);
    expect(result.riskLevel).toBe('negligible');
  });

  it('rounds fractional values', () => {
    const result = calculateRiskScore({ likelihood: 2.7, impact: 3.3 });
    expect(result.likelihood).toBe(3);
    expect(result.impact).toBe(3);
  });

  it('includes German labels', () => {
    const result = calculateRiskScore({ likelihood: 1, impact: 1 });
    expect(result.likelihoodLabel).toBe('Sehr gering');
    expect(result.impactLabel).toBe('Vernachlässigbar');
    expect(result.riskLevelLabel).toBe('Vernachlässigbar');
  });

  it('includes color codes', () => {
    const result = calculateRiskScore({ likelihood: 5, impact: 5 });
    expect(result.color).toBe('#dc2626'); // red for critical
  });

  // Verify all matrix corners
  it.each([
    { l: 1, i: 5, expected: 'medium' },
    { l: 5, i: 1, expected: 'medium' },
    { l: 2, i: 5, expected: 'high' },
    { l: 5, i: 2, expected: 'high' },
  ])('returns $expected for ($l, $i)', ({ l, i, expected }) => {
    expect(calculateRiskScore({ likelihood: l, impact: i }).riskLevel).toBe(expected);
  });
});

describe('adjustImpactByCriticality', () => {
  it('increases impact by 1 for critical assets', () => {
    expect(adjustImpactByCriticality(3, 'critical')).toBe(4);
  });

  it('does not change impact for high assets', () => {
    expect(adjustImpactByCriticality(3, 'high')).toBe(3);
  });

  it('does not change impact for medium assets', () => {
    expect(adjustImpactByCriticality(3, 'medium')).toBe(3);
  });

  it('decreases impact by 1 for low assets', () => {
    expect(adjustImpactByCriticality(3, 'low')).toBe(2);
  });

  it('does not change impact for null criticality', () => {
    expect(adjustImpactByCriticality(3, null)).toBe(3);
  });

  it('clamps critical adjustment to max 5', () => {
    expect(adjustImpactByCriticality(5, 'critical')).toBe(5);
  });

  it('clamps low adjustment to min 1', () => {
    expect(adjustImpactByCriticality(1, 'low')).toBe(1);
  });
});

describe('getRiskMatrix', () => {
  it('returns exactly 25 matrix entries', () => {
    const { matrix } = getRiskMatrix();
    expect(matrix).toHaveLength(25);
  });

  it('has all likelihood/impact combinations', () => {
    const { matrix } = getRiskMatrix();
    const combinations = new Set(matrix.map((m) => `${m.likelihood}-${m.impact}`));
    expect(combinations.size).toBe(25);
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        expect(combinations.has(`${l}-${i}`)).toBe(true);
      }
    }
  });

  it('returns all 5 likelihood and impact labels', () => {
    const { likelihoodLabels, impactLabels } = getRiskMatrix();
    expect(Object.keys(likelihoodLabels)).toHaveLength(5);
    expect(Object.keys(impactLabels)).toHaveLength(5);
  });

  it('each entry has a valid risk level', () => {
    const { matrix } = getRiskMatrix();
    const validLevels = ['critical', 'high', 'medium', 'low', 'negligible'];
    for (const entry of matrix) {
      expect(validLevels).toContain(entry.level);
      expect(entry.label).toBeTruthy();
      expect(entry.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('computeRiskStatistics', () => {
  it('returns empty stats for no entries', () => {
    const stats = computeRiskStatistics([]);
    expect(stats.total).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.highestRiskLevel).toBe('negligible');
  });

  it('computes correct distribution for mixed risks', () => {
    const entries = [
      { likelihood: 5, impact: 5 }, // critical
      { likelihood: 3, impact: 4 }, // high
      { likelihood: 1, impact: 1 }, // negligible
      { likelihood: 3, impact: 3 }, // medium
    ];
    const stats = computeRiskStatistics(entries);
    expect(stats.total).toBe(4);
    expect(stats.distribution.critical).toBe(1);
    expect(stats.distribution.high).toBe(1);
    expect(stats.distribution.medium).toBe(1);
    expect(stats.distribution.negligible).toBe(1);
    expect(stats.highestRiskLevel).toBe('critical');
  });

  it('computes correct average score', () => {
    const entries = [
      { likelihood: 2, impact: 2 }, // 4
      { likelihood: 4, impact: 4 }, // 16
    ];
    const stats = computeRiskStatistics(entries);
    expect(stats.averageScore).toBe(10); // (4+16)/2
  });
});
