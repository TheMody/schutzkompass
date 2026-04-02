'use server';

import { db, controls as controlsTable } from '@schutzkompass/db';
import { eq } from 'drizzle-orm';
import { getOrgId } from './helpers';
import type { ControlStatus } from '@schutzkompass/shared';
import { bsiControls } from '@schutzkompass/compliance-content';

// ── Types ───────────────────────────────────────────────────────────

export interface Control {
  id: string;
  organisationId: string;
  bsiId: string;
  nis2Articles: string[];
  title: string;
  description: string;
  status: ControlStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  deadline: string | null;
  evidence: string[];
  notes: string | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateControlInput {
  id: string;
  status?: ControlStatus;
  assigneeName?: string;
  deadline?: string;
  notes?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

type BsiControl = (typeof bsiControls)[number];

/** Look up BSI control metadata by its grundschutz ID */
function findBsiControl(bsiId: string | null): BsiControl | undefined {
  if (!bsiId) return undefined;
  return (bsiControls as BsiControl[]).find((b) => b.id === bsiId);
}

function mapRowToControl(row: typeof controlsTable.$inferSelect): Control {
  const bsi = findBsiControl(row.bsiGrundschutzId);
  return {
    id: row.id,
    organisationId: row.organisationId,
    bsiId: row.bsiGrundschutzId ?? '',
    nis2Articles: row.nis2Article ? [row.nis2Article] : (bsi?.nis2_articles ?? []),
    title: row.title,
    description: row.description ?? bsi?.description_de ?? '',
    status: row.status as ControlStatus,
    assigneeId: row.assignedTo ?? null,
    assigneeName: null, // TODO: join user table
    deadline: row.dueDate ?? null,
    evidence: row.evidence ? [row.evidence] : [],
    notes: null,
    priority: bsi?.priority ?? 3,
    createdAt: row.createdAt,
    updatedAt: row.createdAt,
  };
}

// ── Seed logic ──────────────────────────────────────────────────────

async function ensureControlsSeeded(orgId: string): Promise<void> {
  const existing = await db
    .select({ id: controlsTable.id })
    .from(controlsTable)
    .where(eq(controlsTable.organisationId, orgId))
    .limit(1);

  if (existing.length > 0) return; // already seeded

  const values = (bsiControls as BsiControl[]).map((bsi) => ({
    organisationId: orgId,
    bsiGrundschutzId: bsi.id,
    nis2Article: bsi.nis2_articles?.[0] ?? null,
    title: bsi.title_de,
    description: bsi.description_de,
    status: 'not_started' as const,
    priority: String(bsi.priority) as any,
  }));

  if (values.length > 0) {
    await db.insert(controlsTable).values(values);
  }
}

// ── Server Actions ──────────────────────────────────────────────────

export async function getControls(): Promise<Control[]> {
  const orgId = await getOrgId();
  await ensureControlsSeeded(orgId);

  const rows = await db
    .select()
    .from(controlsTable)
    .where(eq(controlsTable.organisationId, orgId))
    .orderBy(controlsTable.title);

  return rows.map(mapRowToControl).sort((a, b) => a.priority - b.priority);
}

export async function getControl(id: string): Promise<Control | undefined> {
  const [row] = await db
    .select()
    .from(controlsTable)
    .where(eq(controlsTable.id, id))
    .limit(1);

  if (!row) return undefined;
  return mapRowToControl(row);
}

export async function updateControl(input: UpdateControlInput): Promise<Control | null> {
  const [row] = await db
    .select()
    .from(controlsTable)
    .where(eq(controlsTable.id, input.id))
    .limit(1);

  if (!row) return null;

  const updates: Record<string, unknown> = {};
  if (input.status !== undefined) updates.status = input.status;
  if (input.deadline !== undefined) updates.dueDate = input.deadline;
  if (input.notes !== undefined) updates.evidence = input.notes; // store notes in evidence text field
  if (input.status === 'implemented' || input.status === 'verified') {
    updates.completedAt = new Date();
  }

  if (Object.keys(updates).length > 0) {
    await db
      .update(controlsTable)
      .set(updates)
      .where(eq(controlsTable.id, input.id));
  }

  return (await getControl(input.id)) ?? null;
}

export async function getControlsStatistics() {
  const orgId = await getOrgId();
  await ensureControlsSeeded(orgId);

  const rows = await db
    .select()
    .from(controlsTable)
    .where(eq(controlsTable.organisationId, orgId));

  const total = rows.length;
  const byStatus: Record<ControlStatus, number> = {
    not_started: 0,
    in_progress: 0,
    implemented: 0,
    verified: 0,
  };
  for (const row of rows) {
    const s = row.status as ControlStatus;
    if (byStatus[s] !== undefined) byStatus[s]++;
  }

  const completed = byStatus.implemented + byStatus.verified;
  const complianceScore = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by NIS2 article
  const byArticle: Record<string, { total: number; completed: number }> = {};
  for (const row of rows) {
    const bsi = findBsiControl(row.bsiGrundschutzId);
    const articles = row.nis2Article ? [row.nis2Article] : (bsi?.nis2_articles ?? []);
    for (const article of articles) {
      if (!byArticle[article]) byArticle[article] = { total: 0, completed: 0 };
      byArticle[article].total++;
      const s = row.status as ControlStatus;
      if (s === 'implemented' || s === 'verified') {
        byArticle[article].completed++;
      }
    }
  }

  return { total, byStatus, complianceScore, byArticle };
}
