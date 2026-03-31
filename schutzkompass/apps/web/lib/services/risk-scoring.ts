/**
 * Risk Scoring Engine
 *
 * Implements a 5×5 risk matrix for likelihood × impact assessment.
 * Follows BSI IT-Grundschutz and ISO 27005 methodology.
 */

import type { RiskLevel, CriticalityLevel } from '@schutzkompass/shared';

// ── 5×5 Risk Matrix ─────────────────────────────────────────────────
// Rows: likelihood (1=very low → 5=very high)
// Cols: impact (1=negligible → 5=catastrophic)

const RISK_MATRIX: RiskLevel[][] = [
  // Impact:  1(negl.)    2(low)      3(med)      4(high)     5(catastr.)
  /*L=1*/   ['negligible','negligible','low',      'low',      'medium'],
  /*L=2*/   ['negligible','low',      'low',      'medium',   'high'],
  /*L=3*/   ['low',       'low',      'medium',   'high',     'high'],
  /*L=4*/   ['low',       'medium',   'high',     'high',     'critical'],
  /*L=5*/   ['medium',    'high',     'high',     'critical', 'critical'],
];

export interface RiskScoreInput {
  likelihood: number; // 1–5
  impact: number;     // 1–5
}

export interface RiskScoreResult {
  riskLevel: RiskLevel;
  riskScore: number; // likelihood × impact (1–25)
  likelihood: number;
  impact: number;
  likelihoodLabel: string;
  impactLabel: string;
  riskLevelLabel: string;
  color: string;
}

const LIKELIHOOD_LABELS: Record<number, string> = {
  1: 'Sehr gering',
  2: 'Gering',
  3: 'Mittel',
  4: 'Hoch',
  5: 'Sehr hoch',
};

const IMPACT_LABELS: Record<number, string> = {
  1: 'Vernachlässigbar',
  2: 'Gering',
  3: 'Mittel',
  4: 'Hoch',
  5: 'Katastrophal',
};

const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Gering',
  negligible: 'Vernachlässigbar',
};

const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  negligible: '#94a3b8',
};

export function calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
  const l = Math.max(1, Math.min(5, Math.round(input.likelihood)));
  const i = Math.max(1, Math.min(5, Math.round(input.impact)));

  const riskLevel = RISK_MATRIX[l - 1][i - 1];

  return {
    riskLevel,
    riskScore: l * i,
    likelihood: l,
    impact: i,
    likelihoodLabel: LIKELIHOOD_LABELS[l],
    impactLabel: IMPACT_LABELS[i],
    riskLevelLabel: RISK_LEVEL_LABELS[riskLevel],
    color: RISK_LEVEL_COLORS[riskLevel],
  };
}

/**
 * Adjusts impact based on asset criticality.
 * Critical assets get +1 impact, low assets get -1 impact.
 */
export function adjustImpactByCriticality(
  baseImpact: number,
  criticality: CriticalityLevel | null,
): number {
  if (!criticality) return baseImpact;

  const adjustments: Record<CriticalityLevel, number> = {
    critical: 1,
    high: 0,
    medium: 0,
    low: -1,
  };

  return Math.max(1, Math.min(5, baseImpact + (adjustments[criticality] || 0)));
}

/**
 * Returns the full 5×5 risk matrix for visualization.
 */
export function getRiskMatrix(): {
  matrix: { likelihood: number; impact: number; level: RiskLevel; label: string; color: string }[];
  likelihoodLabels: typeof LIKELIHOOD_LABELS;
  impactLabels: typeof IMPACT_LABELS;
} {
  const matrix: { likelihood: number; impact: number; level: RiskLevel; label: string; color: string }[] = [];

  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      const level = RISK_MATRIX[l - 1][i - 1];
      matrix.push({
        likelihood: l,
        impact: i,
        level,
        label: RISK_LEVEL_LABELS[level],
        color: RISK_LEVEL_COLORS[level],
      });
    }
  }

  return { matrix, likelihoodLabels: LIKELIHOOD_LABELS, impactLabels: IMPACT_LABELS };
}

/**
 * Compute aggregate risk statistics for a set of risk entries.
 */
export function computeRiskStatistics(entries: RiskScoreInput[]) {
  const results = entries.map(calculateRiskScore);

  const distribution: Record<RiskLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    negligible: 0,
  };

  for (const r of results) {
    distribution[r.riskLevel]++;
  }

  const totalScore = results.reduce((sum, r) => sum + r.riskScore, 0);
  const avgScore = results.length > 0 ? totalScore / results.length : 0;

  return {
    total: results.length,
    distribution,
    averageScore: Math.round(avgScore * 10) / 10,
    highestRiskLevel: results.length > 0
      ? results.reduce((highest, r) => (r.riskScore > highest.riskScore ? r : highest)).riskLevel
      : ('negligible' as RiskLevel),
  };
}
