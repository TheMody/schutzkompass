'use server';

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
  riskScore: number | null; // 0-100
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

// ── In-Memory Store ────────────────────────────────────────────────

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

let suppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'TechParts GmbH',
    contactEmail: 'security@techparts.de',
    contactName: 'Dr. Anna Weber',
    riskClass: 'critical',
    riskScore: 72,
    questionnaireStatus: 'completed',
    questionnaireToken: 'tok-abc123',
    questionnaireSentAt: '2026-01-15T10:00:00Z',
    questionnaireCompletedAt: '2026-02-01T14:30:00Z',
    iso27001CertExpiry: '2027-06-30',
    notes: 'Hauptlieferant für IoT-Sensorik. ISO 27001 zertifiziert.',
    createdAt: '2025-11-01T09:00:00Z',
  },
  {
    id: 'sup-2',
    name: 'CloudServe AG',
    contactEmail: 'compliance@cloudserve.eu',
    contactName: 'Michael Braun',
    riskClass: 'critical',
    riskScore: 85,
    questionnaireStatus: 'completed',
    questionnaireToken: 'tok-def456',
    questionnaireSentAt: '2026-01-10T08:00:00Z',
    questionnaireCompletedAt: '2026-01-25T16:00:00Z',
    iso27001CertExpiry: '2026-12-31',
    notes: 'Cloud-Infrastruktur-Provider. SOC 2 Type II + ISO 27001.',
    createdAt: '2025-10-15T09:00:00Z',
  },
  {
    id: 'sup-3',
    name: 'FirmwareFactory Ltd.',
    contactEmail: 'info@firmwarefactory.co.uk',
    contactName: 'James Smith',
    riskClass: 'important',
    riskScore: null,
    questionnaireStatus: 'sent',
    questionnaireToken: 'tok-ghi789',
    questionnaireSentAt: '2026-03-20T09:00:00Z',
    questionnaireCompletedAt: null,
    iso27001CertExpiry: null,
    notes: 'Firmware-Entwicklung für Embedded-Systeme.',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'sup-4',
    name: 'BüroSupply KG',
    contactEmail: 'einkauf@buerosupply.de',
    contactName: 'Petra Müller',
    riskClass: 'standard',
    riskScore: null,
    questionnaireStatus: 'not_sent',
    questionnaireToken: null,
    questionnaireSentAt: null,
    questionnaireCompletedAt: null,
    iso27001CertExpiry: null,
    notes: 'Büromaterial-Lieferant. Kein Zugriff auf IT-Systeme.',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'sup-5',
    name: 'SecureChip Inc.',
    contactEmail: 'security@securechip.com',
    contactName: 'Sarah Johnson',
    riskClass: 'important',
    riskScore: 58,
    questionnaireStatus: 'completed',
    questionnaireToken: 'tok-jkl012',
    questionnaireSentAt: '2026-02-01T10:00:00Z',
    questionnaireCompletedAt: '2026-03-05T11:00:00Z',
    iso27001CertExpiry: null,
    notes: 'Hardware-Sicherheitschips. Kein ISO 27001, aber SOC 2.',
    createdAt: '2025-12-01T09:00:00Z',
  },
];

// ── Operations ─────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  return [...suppliers].sort((a, b) => {
    const classOrder: Record<SupplierRiskClass, number> = { critical: 0, important: 1, standard: 2 };
    return classOrder[a.riskClass] - classOrder[b.riskClass];
  });
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  return suppliers.find((s) => s.id === id) ?? null;
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const supplier: Supplier = {
    id: `sup-${Date.now()}`,
    ...input,
    notes: input.notes || '',
    riskScore: null,
    questionnaireStatus: 'not_sent',
    questionnaireToken: null,
    questionnaireSentAt: null,
    questionnaireCompletedAt: null,
    iso27001CertExpiry: null,
    createdAt: new Date().toISOString(),
  };
  suppliers = [...suppliers, supplier];
  return supplier;
}

export async function updateSupplier(id: string, updates: Partial<CreateSupplierInput>): Promise<Supplier> {
  const idx = suppliers.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Supplier not found');
  const updated = { ...suppliers[idx], ...updates };
  suppliers = suppliers.map((s) => (s.id === id ? updated : s));
  return updated;
}

export async function sendQuestionnaire(supplierId: string): Promise<Supplier> {
  const idx = suppliers.findIndex((s) => s.id === supplierId);
  if (idx === -1) throw new Error('Supplier not found');

  const updated: Supplier = {
    ...suppliers[idx],
    questionnaireStatus: 'sent',
    questionnaireToken: generateToken(),
    questionnaireSentAt: new Date().toISOString(),
  };
  suppliers = suppliers.map((s) => (s.id === supplierId ? updated : s));
  return updated;
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
        totalWeight -= q.weight; // exclude from calculation
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

  for (const s of suppliers) {
    byRiskClass[s.riskClass]++;
    byQStatus[s.questionnaireStatus]++;
    if (s.riskScore !== null) {
      totalScore += s.riskScore;
      scoredCount++;
    }
  }

  return {
    total: suppliers.length,
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
  const supplier = suppliers.find((s) => s.questionnaireToken === token);
  if (!supplier) return null;
  return { supplierName: supplier.name, status: supplier.questionnaireStatus };
}

export async function submitQuestionnaireResponses(
  token: string,
  responses: QuestionnaireResponse[]
): Promise<{ success: boolean; score: number; error?: string }> {
  const idx = suppliers.findIndex((s) => s.questionnaireToken === token);
  if (idx === -1) return { success: false, score: 0, error: 'Ungültiger Token' };

  const supplier = suppliers[idx];
  if (supplier.questionnaireStatus === 'completed') {
    return { success: false, score: 0, error: 'Fragebogen wurde bereits eingereicht' };
  }

  const score = await scoreQuestionnaire(responses);

  const updated: Supplier = {
    ...supplier,
    questionnaireStatus: 'completed',
    questionnaireCompletedAt: new Date().toISOString(),
    riskScore: score,
  };
  suppliers = suppliers.map((s) => (s.id === updated.id ? updated : s));

  // Create notification for questionnaire completion
  await createNotification({
    title: 'Lieferanten-Fragebogen eingegangen',
    message: `Lieferant "${supplier.name}" hat den Sicherheitsfragebogen beantwortet (Score: ${score}%).`,
    icon: 'info',
    category: 'supplier',
  });

  return { success: true, score };
}
