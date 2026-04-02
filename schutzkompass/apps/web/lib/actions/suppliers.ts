'use server';

import { db, suppliers as suppliersTable, questionnaireResponses as qrTable } from '@schutzkompass/db';
import { eq } from 'drizzle-orm';
import { getOrgId } from './helpers';
import {
  QUESTIONNAIRE,
  type SupplierRiskClass,
  type QuestionnaireStatus,
  type QuestionnaireQuestion,
} from '@/lib/constants/suppliers';
import { createNotification } from './notifications';

// ── Types ──────────────────────────────────────────────────────────

export type { SupplierRiskClass, QuestionnaireStatus, QuestionnaireQuestion };

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  contactName: string;
  riskClass: SupplierRiskClass;
  riskScore: number | null;
  questionnaireStatus: QuestionnaireStatus;
  questionnaireToken: string | null;
  questionnaireSentAt: string | null;
  questionnaireCompletedAt: string | null;
  iso27001CertExpiry: string | null;
  notes: string;
  createdAt: string;
}

export interface QuestionnaireResponse {
  questionKey: string;
  answer: 'yes' | 'no' | 'partial' | 'not_applicable';
  comment: string;
}

export interface CreateSupplierInput {
  name: string;
  contactEmail: string;
  contactName: string;
  riskClass: SupplierRiskClass;
  notes?: string;
}

// ── Mapper ─────────────────────────────────────────────────────────

function mapRow(row: typeof suppliersTable.$inferSelect): Supplier {
  return {
    id: row.id,
    name: row.name,
    contactEmail: row.contactEmail ?? '',
    contactName: row.contactName ?? '',
    riskClass: (row.riskClass ?? 'standard') as SupplierRiskClass,
    riskScore: row.riskScore,
    questionnaireStatus: (row.questionnaireStatus ?? 'not_sent') as QuestionnaireStatus,
    questionnaireToken: row.questionnaireToken,
    questionnaireSentAt: row.questionnaireSentAt?.toISOString() ?? null,
    questionnaireCompletedAt: row.questionnaireCompletedAt?.toISOString() ?? null,
    iso27001CertExpiry: row.iso27001CertExpiry ?? null,
    notes: row.notes ?? '',
    createdAt: row.createdAt.toISOString(),
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ── Operations ─────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.organisationId, orgId));

  const suppliers = rows.map(mapRow);
  const classOrder: Record<SupplierRiskClass, number> = { critical: 0, important: 1, standard: 2 };
  return suppliers.sort((a, b) => classOrder[a.riskClass] - classOrder[b.riskClass]);
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const [row] = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.id, id))
    .limit(1);

  return row ? mapRow(row) : null;
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const orgId = await getOrgId();
  const [row] = await db
    .insert(suppliersTable)
    .values({
      organisationId: orgId,
      name: input.name,
      contactEmail: input.contactEmail,
      contactName: input.contactName,
      riskClass: input.riskClass,
      notes: input.notes ?? '',
      questionnaireStatus: 'not_sent',
    })
    .returning();

  return mapRow(row);
}

export async function updateSupplier(id: string, updates: Partial<CreateSupplierInput>): Promise<Supplier> {
  const setValues: Record<string, unknown> = {};
  if (updates.name !== undefined) setValues.name = updates.name;
  if (updates.contactEmail !== undefined) setValues.contactEmail = updates.contactEmail;
  if (updates.contactName !== undefined) setValues.contactName = updates.contactName;
  if (updates.riskClass !== undefined) setValues.riskClass = updates.riskClass;
  if (updates.notes !== undefined) setValues.notes = updates.notes;

  if (Object.keys(setValues).length > 0) {
    await db.update(suppliersTable).set(setValues).where(eq(suppliersTable.id, id));
  }

  const result = await getSupplierById(id);
  if (!result) throw new Error('Supplier not found');
  return result;
}

export async function sendQuestionnaire(supplierId: string): Promise<Supplier> {
  const token = generateToken();
  await db
    .update(suppliersTable)
    .set({
      questionnaireStatus: 'sent',
      questionnaireToken: token,
      questionnaireSentAt: new Date(),
    })
    .where(eq(suppliersTable.id, supplierId));

  const result = await getSupplierById(supplierId);
  if (!result) throw new Error('Supplier not found');
  return result;
}

/**
 * Score questionnaire responses (0-100)
 */
export async function scoreQuestionnaire(responses: QuestionnaireResponse[]): Promise<number> {
  let totalWeight = 0;
  let earnedPoints = 0;

  for (const q of QUESTIONNAIRE) {
    const response = responses.find((r) => r.questionKey === q.key);
    totalWeight += q.weight;

    if (!response) continue;

    switch (response.answer) {
      case 'yes':
        earnedPoints += q.weight;
        break;
      case 'partial':
        earnedPoints += q.weight * 0.5;
        break;
      case 'not_applicable':
        totalWeight -= q.weight;
        break;
      case 'no':
      default:
        break;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((earnedPoints / totalWeight) * 100);
}

export async function getSupplierStatistics() {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.organisationId, orgId));

  const byRiskClass: Record<SupplierRiskClass, number> = { critical: 0, important: 0, standard: 0 };
  const byQStatus: Record<QuestionnaireStatus, number> = {
    not_sent: 0,
    sent: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  };

  let totalScore = 0;
  let scoredCount = 0;

  for (const row of rows) {
    const rc = (row.riskClass ?? 'standard') as SupplierRiskClass;
    const qs = (row.questionnaireStatus ?? 'not_sent') as QuestionnaireStatus;
    if (byRiskClass[rc] !== undefined) byRiskClass[rc]++;
    if (byQStatus[qs] !== undefined) byQStatus[qs]++;
    if (row.riskScore !== null) {
      totalScore += row.riskScore;
      scoredCount++;
    }
  }

  return {
    total: rows.length,
    byRiskClass,
    byQuestionnaireStatus: byQStatus,
    averageScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : null,
    completedQuestionnaires: byQStatus.completed,
    pendingQuestionnaires: byQStatus.sent + byQStatus.in_progress + byQStatus.overdue,
  };
}

export async function getQuestionnaireContent(): Promise<QuestionnaireQuestion[]> {
  return QUESTIONNAIRE;
}

// ── Public Questionnaire Actions (token-based, no auth) ────────────

export async function getSupplierByToken(token: string): Promise<{ supplierName: string; status: QuestionnaireStatus } | null> {
  const [row] = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.questionnaireToken, token))
    .limit(1);

  if (!row) return null;
  return {
    supplierName: row.name,
    status: (row.questionnaireStatus ?? 'not_sent') as QuestionnaireStatus,
  };
}

export async function submitQuestionnaireResponses(
  token: string,
  responses: QuestionnaireResponse[],
): Promise<{ success: boolean; score: number; error?: string }> {
  const [row] = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.questionnaireToken, token))
    .limit(1);

  if (!row) return { success: false, score: 0, error: 'Ungültiger Token' };
  if (row.questionnaireStatus === 'completed') {
    return { success: false, score: 0, error: 'Fragebogen wurde bereits eingereicht' };
  }

  const score = await scoreQuestionnaire(responses);

  // Save individual responses
  for (const r of responses) {
    await db.insert(qrTable).values({
      supplierId: row.id,
      questionKey: r.questionKey,
      answer: r.answer,
      comment: r.comment,
      answeredAt: new Date(),
    });
  }

  // Update supplier
  await db
    .update(suppliersTable)
    .set({
      questionnaireStatus: 'completed',
      questionnaireCompletedAt: new Date(),
      riskScore: score,
    })
    .where(eq(suppliersTable.id, row.id));

  await createNotification({
    title: 'Lieferanten-Fragebogen eingegangen',
    message: `Lieferant "${row.name}" hat den Sicherheitsfragebogen beantwortet (Score: ${score}%).`,
    icon: 'info',
    category: 'supplier',
  });

  return { success: true, score };
}
