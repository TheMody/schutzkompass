'use server';

import { db, riskAssessments, riskEntries as riskEntriesTable } from '@schutzkompass/db';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from './helpers';
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

// ── Server Actions: Assessments ─────────────────────────────────────

export async function getRiskAssessments(): Promise<RiskAssessment[]> {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(riskAssessments)
    .where(eq(riskAssessments.organisationId, orgId))
    .orderBy(desc(riskAssessments.createdAt));

  return rows.map(mapAssessmentRow);
}

export async function getRiskAssessment(id: string): Promise<RiskAssessment | undefined> {
  const orgId = await getOrgId();
  const [row] = await db
    .select()
    .from(riskAssessments)
    .where(eq(riskAssessments.id, id))
    .limit(1);

  if (!row || row.organisationId !== orgId) return undefined;
  return mapAssessmentRow(row);
}

export async function createRiskAssessment(input: CreateRiskAssessmentInput): Promise<RiskAssessment> {
  const orgId = await getOrgId();
  const [row] = await db
    .insert(riskAssessments)
    .values({
      organisationId: orgId,
      title: input.title,
      status: 'draft',
    })
    .returning();

  return mapAssessmentRow(row);
}

export async function completeRiskAssessment(id: string): Promise<RiskAssessment | null> {
  const orgId = await getOrgId();
  const [existing] = await db.select().from(riskAssessments).where(eq(riskAssessments.id, id)).limit(1);
  if (!existing || existing.organisationId !== orgId) return null;

  const [row] = await db
    .update(riskAssessments)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(riskAssessments.id, id))
    .returning();

  return mapAssessmentRow(row);
}

// ── Server Actions: Risk Entries ────────────────────────────────────

export async function getRiskEntries(assessmentId: string): Promise<RiskEntry[]> {
  const rows = await db
    .select()
    .from(riskEntriesTable)
    .where(eq(riskEntriesTable.assessmentId, assessmentId))
    .orderBy(desc(riskEntriesTable.createdAt));

  return rows.map(mapEntryRow);
}

export async function createRiskEntry(input: CreateRiskEntryInput): Promise<RiskEntry> {
  const score = calculateRiskScore({
    likelihood: input.likelihood,
    impact: input.impact,
  });

  const [row] = await db
    .insert(riskEntriesTable)
    .values({
      assessmentId: input.assessmentId,
      assetId: input.assetId ?? null,
      threatDescription: input.threatDescription,
      threatCategory: input.threatCategory ?? null,
      likelihood: score.likelihood,
      impact: score.impact,
      riskLevel: score.riskLevel,
      treatment: input.treatment ?? null,
      treatmentDescription: input.treatmentDescription ?? null,
      controlIds: input.controlIds ?? [],
    })
    .returning();

  // Update assessment status to in_progress if it was draft
  await db
    .update(riskAssessments)
    .set({ status: 'in_progress' })
    .where(eq(riskAssessments.id, input.assessmentId));

  return mapEntryRow(row);
}

export async function updateRiskEntryTreatment(
  id: string,
  treatment: RiskTreatment,
  treatmentDescription?: string,
  controlIds?: string[],
): Promise<RiskEntry | null> {
  const [existing] = await db.select().from(riskEntriesTable).where(eq(riskEntriesTable.id, id)).limit(1);
  if (!existing) return null;

  const values: Record<string, unknown> = { treatment };
  if (treatmentDescription !== undefined) values.treatmentDescription = treatmentDescription;
  if (controlIds !== undefined) values.controlIds = controlIds;

  const [row] = await db
    .update(riskEntriesTable)
    .set(values)
    .where(eq(riskEntriesTable.id, id))
    .returning();

  return mapEntryRow(row);
}

export async function deleteRiskEntry(id: string): Promise<boolean> {
  const [existing] = await db.select().from(riskEntriesTable).where(eq(riskEntriesTable.id, id)).limit(1);
  if (!existing) return false;
  await db.delete(riskEntriesTable).where(eq(riskEntriesTable.id, id));
  return true;
}

// ── Server Actions: Statistics ──────────────────────────────────────

export async function getRiskStatistics(assessmentId: string) {
  const entries = await getRiskEntries(assessmentId);
  const inputs = entries.map((e) => ({ likelihood: e.likelihood, impact: e.impact }));
  return computeRiskStatistics(inputs);
}

// ── Row mappers ─────────────────────────────────────────────────────

function mapAssessmentRow(row: typeof riskAssessments.$inferSelect): RiskAssessment {
  return {
    id: row.id,
    organisationId: row.organisationId,
    title: row.title,
    status: row.status as RiskAssessment['status'],
    assessorId: row.assessorId,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
  };
}

function mapEntryRow(row: typeof riskEntriesTable.$inferSelect): RiskEntry {
  const score = calculateRiskScore({
    likelihood: row.likelihood,
    impact: row.impact,
  });

  return {
    id: row.id,
    assessmentId: row.assessmentId,
    assetId: row.assetId,
    assetName: null, // Joined from assets table if needed
    threatId: null,
    threatDescription: row.threatDescription,
    threatCategory: row.threatCategory,
    likelihood: row.likelihood,
    impact: row.impact,
    riskLevel: (row.riskLevel as RiskLevel) ?? score.riskLevel,
    riskScore: score.riskScore,
    treatment: row.treatment as RiskTreatment | null,
    treatmentDescription: row.treatmentDescription,
    controlIds: (row.controlIds as string[]) ?? [],
    createdAt: row.createdAt,
  };
}
