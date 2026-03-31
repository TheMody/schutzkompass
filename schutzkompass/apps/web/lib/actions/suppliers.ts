'use server';

// ── Types ──────────────────────────────────────────────────────────

export type SupplierRiskClass = 'critical' | 'important' | 'standard';
export type QuestionnaireStatus = 'not_sent' | 'sent' | 'in_progress' | 'completed' | 'overdue';

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

export interface QuestionnaireQuestion {
  key: string;
  category: string;
  textDe: string;
  textEn: string;
  weight: number; // 1-5
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

// ── Labels ─────────────────────────────────────────────────────────

export const RISK_CLASS_LABELS: Record<SupplierRiskClass, string> = {
  critical: 'Kritisch',
  important: 'Wichtig',
  standard: 'Standard',
};

export const QUESTIONNAIRE_STATUS_LABELS: Record<QuestionnaireStatus, string> = {
  not_sent: 'Nicht gesendet',
  sent: 'Gesendet',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  overdue: 'Überfällig',
};

// ── Security Questionnaire Content (30 questions, DE + EN) ─────────

export const QUESTIONNAIRE: QuestionnaireQuestion[] = [
  // Governance & Organisation (6 questions)
  { key: 'gov-01', category: 'Governance & Organisation', textDe: 'Existiert eine dokumentierte Informationssicherheitsrichtlinie?', textEn: 'Does a documented information security policy exist?', weight: 5 },
  { key: 'gov-02', category: 'Governance & Organisation', textDe: 'Gibt es einen benannten Informationssicherheitsbeauftragten (CISO)?', textEn: 'Is there a designated Chief Information Security Officer (CISO)?', weight: 4 },
  { key: 'gov-03', category: 'Governance & Organisation', textDe: 'Werden regelmäßige Management-Reviews zur Informationssicherheit durchgeführt?', textEn: 'Are regular management reviews of information security conducted?', weight: 3 },
  { key: 'gov-04', category: 'Governance & Organisation', textDe: 'Ist Ihr Unternehmen ISO 27001 oder vergleichbar zertifiziert?', textEn: 'Is your company ISO 27001 certified or equivalent?', weight: 5 },
  { key: 'gov-05', category: 'Governance & Organisation', textDe: 'Werden Sicherheitsanforderungen in Verträgen mit Subunternehmern berücksichtigt?', textEn: 'Are security requirements included in contracts with subcontractors?', weight: 4 },
  { key: 'gov-06', category: 'Governance & Organisation', textDe: 'Gibt es ein dokumentiertes Asset-Management für IT-Systeme?', textEn: 'Is there documented asset management for IT systems?', weight: 3 },

  // Zugriffskontrolle (5 questions)
  { key: 'acc-01', category: 'Zugriffskontrolle', textDe: 'Werden Multi-Faktor-Authentifizierung (MFA) für kritische Systeme eingesetzt?', textEn: 'Is multi-factor authentication (MFA) used for critical systems?', weight: 5 },
  { key: 'acc-02', category: 'Zugriffskontrolle', textDe: 'Gibt es ein rollenbasiertes Zugriffskonzept (RBAC)?', textEn: 'Is role-based access control (RBAC) implemented?', weight: 4 },
  { key: 'acc-03', category: 'Zugriffskontrolle', textDe: 'Werden privilegierte Zugänge separat verwaltet und überwacht?', textEn: 'Are privileged accounts managed and monitored separately?', weight: 5 },
  { key: 'acc-04', category: 'Zugriffskontrolle', textDe: 'Werden Zugriffsrechte regelmäßig überprüft und entzogen?', textEn: 'Are access rights regularly reviewed and revoked?', weight: 3 },
  { key: 'acc-05', category: 'Zugriffskontrolle', textDe: 'Werden Passwortrichtlinien durchgesetzt?', textEn: 'Are password policies enforced?', weight: 3 },

  // Netzwerksicherheit (4 questions)
  { key: 'net-01', category: 'Netzwerksicherheit', textDe: 'Sind Netzwerke segmentiert (z.B. DMZ, interne Netze)?', textEn: 'Are networks segmented (e.g., DMZ, internal networks)?', weight: 4 },
  { key: 'net-02', category: 'Netzwerksicherheit', textDe: 'Werden Firewalls und IDS/IPS-Systeme eingesetzt?', textEn: 'Are firewalls and IDS/IPS systems in use?', weight: 4 },
  { key: 'net-03', category: 'Netzwerksicherheit', textDe: 'Werden Daten bei der Übertragung verschlüsselt (TLS/VPN)?', textEn: 'Is data encrypted in transit (TLS/VPN)?', weight: 5 },
  { key: 'net-04', category: 'Netzwerksicherheit', textDe: 'Gibt es ein Verfahren zur Erkennung und Behandlung von Netzwerkanomalien?', textEn: 'Is there a process for detecting and handling network anomalies?', weight: 3 },

  // Datenschutz & Verschlüsselung (4 questions)
  { key: 'dat-01', category: 'Datenschutz & Verschlüsselung', textDe: 'Werden personenbezogene Daten gemäß DSGVO verarbeitet?', textEn: 'Is personal data processed in accordance with GDPR?', weight: 5 },
  { key: 'dat-02', category: 'Datenschutz & Verschlüsselung', textDe: 'Werden Daten im Ruhezustand verschlüsselt (at rest)?', textEn: 'Is data encrypted at rest?', weight: 4 },
  { key: 'dat-03', category: 'Datenschutz & Verschlüsselung', textDe: 'Gibt es ein Backup-Konzept mit regelmäßigen Tests?', textEn: 'Is there a backup concept with regular testing?', weight: 4 },
  { key: 'dat-04', category: 'Datenschutz & Verschlüsselung', textDe: 'Werden Daten innerhalb der EU/EWR gespeichert und verarbeitet?', textEn: 'Is data stored and processed within the EU/EEA?', weight: 3 },

  // Incident Management (4 questions)
  { key: 'inc-01', category: 'Incident Management', textDe: 'Gibt es einen dokumentierten Incident-Response-Plan?', textEn: 'Is there a documented incident response plan?', weight: 5 },
  { key: 'inc-02', category: 'Incident Management', textDe: 'Können Sicherheitsvorfälle innerhalb von 24h gemeldet werden?', textEn: 'Can security incidents be reported within 24 hours?', weight: 5 },
  { key: 'inc-03', category: 'Incident Management', textDe: 'Werden Sicherheitsvorfälle dokumentiert und ausgewertet?', textEn: 'Are security incidents documented and analyzed?', weight: 3 },
  { key: 'inc-04', category: 'Incident Management', textDe: 'Werden betroffene Kunden bei Sicherheitsvorfällen informiert?', textEn: 'Are affected customers notified of security incidents?', weight: 4 },

  // Schwachstellenmanagement (4 questions)
  { key: 'vul-01', category: 'Schwachstellenmanagement', textDe: 'Werden regelmäßige Schwachstellenscans durchgeführt?', textEn: 'Are regular vulnerability scans performed?', weight: 4 },
  { key: 'vul-02', category: 'Schwachstellenmanagement', textDe: 'Gibt es einen Patch-Management-Prozess mit definierten SLAs?', textEn: 'Is there a patch management process with defined SLAs?', weight: 5 },
  { key: 'vul-03', category: 'Schwachstellenmanagement', textDe: 'Werden sicherheitsrelevante Updates zeitnah eingespielt?', textEn: 'Are security-relevant updates applied in a timely manner?', weight: 4 },
  { key: 'vul-04', category: 'Schwachstellenmanagement', textDe: 'Werden Penetrationstests durchgeführt?', textEn: 'Are penetration tests performed?', weight: 3 },

  // Mitarbeitersicherheit (3 questions)
  { key: 'hr-01', category: 'Mitarbeitersicherheit', textDe: 'Werden Security-Awareness-Schulungen regelmäßig durchgeführt?', textEn: 'Are security awareness trainings conducted regularly?', weight: 4 },
  { key: 'hr-02', category: 'Mitarbeitersicherheit', textDe: 'Werden Mitarbeitende bei Eintritt und Austritt sicherheitsrelevant eingewiesen?', textEn: 'Are employees briefed on security during onboarding and offboarding?', weight: 3 },
  { key: 'hr-03', category: 'Mitarbeitersicherheit', textDe: 'Gibt es Vertraulichkeitsvereinbarungen (NDAs) mit Mitarbeitenden?', textEn: 'Are confidentiality agreements (NDAs) in place with employees?', weight: 3 },
];

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
