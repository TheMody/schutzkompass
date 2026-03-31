'use server';

import { calculateRiskScore, computeRiskStatistics } from '@/lib/services/risk-scoring';
import type { RiskLevel, RiskTreatment } from '@schutzkompass/shared';

// ── Types ───────────────────────────────────────────────────────────

export interface RiskAssessment {
  id: string;
  organisationId: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  assessorId: string | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface RiskEntry {
  id: string;
  assessmentId: string;
  assetId: string | null;
  assetName: string | null;
  threatId: string | null;
  threatDescription: string;
  threatCategory: string | null;
  likelihood: number;
  impact: number;
  riskLevel: RiskLevel;
  riskScore: number;
  treatment: RiskTreatment | null;
  treatmentDescription: string | null;
  controlIds: string[];
  createdAt: Date;
}

export interface CreateRiskAssessmentInput {
  title: string;
}

export interface CreateRiskEntryInput {
  assessmentId: string;
  assetId?: string;
  assetName?: string;
  threatId?: string;
  threatDescription: string;
  threatCategory?: string;
  likelihood: number;
  impact: number;
  treatment?: RiskTreatment;
  treatmentDescription?: string;
  controlIds?: string[];
}

// ── In-Memory Store ─────────────────────────────────────────────────

let assessments: RiskAssessment[] = [
  {
    id: 'ra-1',
    organisationId: 'org-1',
    title: 'Initiale Risikobewertung 2025',
    status: 'in_progress',
    assessorId: null,
    completedAt: null,
    createdAt: new Date('2025-01-10'),
  },
];

let riskEntries: RiskEntry[] = [];
let nextAssessmentId = 2;
let nextEntryId = 1;

// ── Server Actions: Assessments ─────────────────────────────────────

export async function getRiskAssessments(): Promise<RiskAssessment[]> {
  return assessments;
}

export async function getRiskAssessment(id: string): Promise<RiskAssessment | undefined> {
  return assessments.find((a) => a.id === id);
}

export async function createRiskAssessment(input: CreateRiskAssessmentInput): Promise<RiskAssessment> {
  const assessment: RiskAssessment = {
    id: `ra-${nextAssessmentId++}`,
    organisationId: 'org-1',
    title: input.title,
    status: 'draft',
    assessorId: null,
    completedAt: null,
    createdAt: new Date(),
  };
  assessments.push(assessment);
  return assessment;
}

export async function completeRiskAssessment(id: string): Promise<RiskAssessment | null> {
  const index = assessments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  assessments[index] = {
    ...assessments[index],
    status: 'completed',
    completedAt: new Date(),
  };
  return assessments[index];
}

// ── Server Actions: Risk Entries ────────────────────────────────────

export async function getRiskEntries(assessmentId: string): Promise<RiskEntry[]> {
  return riskEntries.filter((e) => e.assessmentId === assessmentId);
}

export async function createRiskEntry(input: CreateRiskEntryInput): Promise<RiskEntry> {
  const score = calculateRiskScore({
    likelihood: input.likelihood,
    impact: input.impact,
  });

  const entry: RiskEntry = {
    id: `re-${nextEntryId++}`,
    assessmentId: input.assessmentId,
    assetId: input.assetId || null,
    assetName: input.assetName || null,
    threatId: input.threatId || null,
    threatDescription: input.threatDescription,
    threatCategory: input.threatCategory || null,
    likelihood: score.likelihood,
    impact: score.impact,
    riskLevel: score.riskLevel,
    riskScore: score.riskScore,
    treatment: input.treatment || null,
    treatmentDescription: input.treatmentDescription || null,
    controlIds: input.controlIds || [],
    createdAt: new Date(),
  };

  riskEntries.push(entry);

  // Update assessment status
  const aIdx = assessments.findIndex((a) => a.id === input.assessmentId);
  if (aIdx !== -1 && assessments[aIdx].status === 'draft') {
    assessments[aIdx] = { ...assessments[aIdx], status: 'in_progress' };
  }

  return entry;
}

export async function updateRiskEntryTreatment(
  id: string,
  treatment: RiskTreatment,
  treatmentDescription?: string,
  controlIds?: string[],
): Promise<RiskEntry | null> {
  const index = riskEntries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  riskEntries[index] = {
    ...riskEntries[index],
    treatment,
    treatmentDescription: treatmentDescription || riskEntries[index].treatmentDescription,
    controlIds: controlIds || riskEntries[index].controlIds,
  };

  return riskEntries[index];
}

export async function deleteRiskEntry(id: string): Promise<boolean> {
  const before = riskEntries.length;
  riskEntries = riskEntries.filter((e) => e.id !== id);
  return riskEntries.length < before;
}

// ── Server Actions: Statistics ──────────────────────────────────────

export async function getRiskStatistics(assessmentId: string) {
  const entries = riskEntries.filter((e) => e.assessmentId === assessmentId);
  const inputs = entries.map((e) => ({ likelihood: e.likelihood, impact: e.impact }));
  return computeRiskStatistics(inputs);
}
