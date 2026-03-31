// ─── Risk Levels ──────────────────────────────────────
export const RISK_LEVELS = ['critical', 'high', 'medium', 'low', 'negligible'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Gering',
  negligible: 'Vernachlässigbar',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#22c55e',
  negligible: '#94a3b8',
};

// ─── Severity Levels ──────────────────────────────────
export const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low', 'info'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Gering',
  info: 'Info',
};

// ─── User Roles ───────────────────────────────────────
export const USER_ROLES = ['admin', 'compliance_officer', 'viewer', 'auditor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  compliance_officer: 'Compliance-Beauftragter',
  viewer: 'Betrachter',
  auditor: 'Auditor',
};

// ─── NIS2 Entity Types ───────────────────────────────
export const NIS2_ENTITY_TYPES = ['essential', 'important', 'not_applicable'] as const;
export type Nis2EntityType = (typeof NIS2_ENTITY_TYPES)[number];

export const NIS2_ENTITY_TYPE_LABELS: Record<Nis2EntityType, string> = {
  essential: 'Wesentliche Einrichtung',
  important: 'Wichtige Einrichtung',
  not_applicable: 'Nicht betroffen',
};

// ─── CRA Categories ──────────────────────────────────
export const CRA_CATEGORIES = ['default', 'important_class_I', 'important_class_II', 'critical', 'out_of_scope'] as const;
export type CraCategory = (typeof CRA_CATEGORIES)[number];

export const CRA_CATEGORY_LABELS: Record<CraCategory, string> = {
  default: 'Standard (Default)',
  important_class_I: 'Wichtig Klasse I',
  important_class_II: 'Wichtig Klasse II',
  critical: 'Kritisch',
  out_of_scope: 'Nicht im Anwendungsbereich',
};

// ─── Conformity Pathways ─────────────────────────────
export const CONFORMITY_PATHWAYS = ['module_a', 'module_b_c', 'module_h'] as const;
export type ConformityPathway = (typeof CONFORMITY_PATHWAYS)[number];

export const CONFORMITY_PATHWAY_LABELS: Record<ConformityPathway, string> = {
  module_a: 'Modul A (Selbstbewertung)',
  module_b_c: 'Modul B+C (EU-Baumusterprüfung)',
  module_h: 'Modul H (Umfassende Qualitätssicherung)',
};

// ─── Asset Types ──────────────────────────────────────
export const ASSET_TYPES = ['server', 'endpoint', 'network', 'cloud', 'ot_device', 'application'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  server: 'Server',
  endpoint: 'Endgerät',
  network: 'Netzwerk',
  cloud: 'Cloud-Dienst',
  ot_device: 'OT-Gerät',
  application: 'Anwendung',
};

// ─── Criticality Levels ──────────────────────────────
export const CRITICALITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;
export type CriticalityLevel = (typeof CRITICALITY_LEVELS)[number];

export const CRITICALITY_LABELS: Record<CriticalityLevel, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Gering',
};

// ─── Risk Treatment Options ──────────────────────────
export const RISK_TREATMENTS = ['accept', 'mitigate', 'transfer', 'avoid'] as const;
export type RiskTreatment = (typeof RISK_TREATMENTS)[number];

export const RISK_TREATMENT_LABELS: Record<RiskTreatment, string> = {
  accept: 'Akzeptieren',
  mitigate: 'Reduzieren',
  transfer: 'Übertragen',
  avoid: 'Vermeiden',
};

// ─── Control Status ──────────────────────────────────
export const CONTROL_STATUSES = ['not_started', 'in_progress', 'implemented', 'verified'] as const;
export type ControlStatus = (typeof CONTROL_STATUSES)[number];

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  not_started: 'Offen',
  in_progress: 'In Bearbeitung',
  implemented: 'Umgesetzt',
  verified: 'Verifiziert',
};

// ─── Vulnerability Status ────────────────────────────
export const VULNERABILITY_STATUSES = ['open', 'triaged', 'in_progress', 'fixed', 'accepted', 'false_positive'] as const;
export type VulnerabilityStatus = (typeof VULNERABILITY_STATUSES)[number];

export const VULNERABILITY_STATUS_LABELS: Record<VulnerabilityStatus, string> = {
  open: 'Offen',
  triaged: 'Gesichtet',
  in_progress: 'In Bearbeitung',
  fixed: 'Behoben',
  accepted: 'Akzeptiert',
  false_positive: 'Falsch-Positiv',
};

// ─── Incident Status ─────────────────────────────────
export const INCIDENT_STATUSES = ['detected', 'early_warning_sent', 'notification_sent', 'final_report_sent', 'closed'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  detected: 'Erkannt',
  early_warning_sent: 'Frühwarnung gesendet',
  notification_sent: 'Meldung gesendet',
  final_report_sent: 'Abschlussbericht gesendet',
  closed: 'Geschlossen',
};

// ─── Incident Types ──────────────────────────────────
export const INCIDENT_TYPES = ['nis2_organisational', 'cra_vulnerability', 'cra_incident'] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  nis2_organisational: 'NIS2 Sicherheitsvorfall',
  cra_vulnerability: 'CRA Schwachstelle',
  cra_incident: 'CRA Sicherheitsvorfall',
};

// ─── Supplier Risk Classes ───────────────────────────
export const SUPPLIER_RISK_CLASSES = ['critical', 'important', 'standard'] as const;
export type SupplierRiskClass = (typeof SUPPLIER_RISK_CLASSES)[number];

export const SUPPLIER_RISK_CLASS_LABELS: Record<SupplierRiskClass, string> = {
  critical: 'Kritisch',
  important: 'Wichtig',
  standard: 'Standard',
};

// ─── Questionnaire Status ────────────────────────────
export const QUESTIONNAIRE_STATUSES = ['not_sent', 'sent', 'in_progress', 'completed', 'overdue'] as const;
export type QuestionnaireStatus = (typeof QUESTIONNAIRE_STATUSES)[number];

export const QUESTIONNAIRE_STATUS_LABELS: Record<QuestionnaireStatus, string> = {
  not_sent: 'Nicht gesendet',
  sent: 'Gesendet',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  overdue: 'Überfällig',
};

// ─── SBOM Formats ────────────────────────────────────
export const SBOM_FORMATS = ['spdx', 'cyclonedx'] as const;
export type SbomFormat = (typeof SBOM_FORMATS)[number];

// ─── SBOM Sources ────────────────────────────────────
export const SBOM_SOURCES = ['uploaded', 'generated_syft', 'generated_trivy', 'generated_cdxgen', 'manual'] as const;
export type SbomSource = (typeof SBOM_SOURCES)[number];

// ─── Product Types ───────────────────────────────────
export const PRODUCT_TYPES = ['hardware', 'software', 'combined'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  hardware: 'Hardware',
  software: 'Software',
  combined: 'Kombiniert (HW + SW)',
};

// ─── Assessment Status ───────────────────────────────
export const ASSESSMENT_STATUSES = ['draft', 'in_progress', 'completed', 'archived'] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Entwurf',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  archived: 'Archiviert',
};

// ─── Control Priorities ──────────────────────────────
export const CONTROL_PRIORITIES = ['must', 'should', 'nice_to_have'] as const;
export type ControlPriority = (typeof CONTROL_PRIORITIES)[number];

export const CONTROL_PRIORITY_LABELS: Record<ControlPriority, string> = {
  must: 'Muss',
  should: 'Sollte',
  nice_to_have: 'Kann',
};

// ─── Audit Log Actions ───────────────────────────────
export const AUDIT_ACTIONS = ['create', 'update', 'delete', 'export', 'login'] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// ─── Questionnaire Answers ───────────────────────────
export const QUESTIONNAIRE_ANSWERS = ['yes', 'no', 'partial', 'not_applicable'] as const;
export type QuestionnaireAnswer = (typeof QUESTIONNAIRE_ANSWERS)[number];

export const QUESTIONNAIRE_ANSWER_LABELS: Record<QuestionnaireAnswer, string> = {
  yes: 'Ja',
  no: 'Nein',
  partial: 'Teilweise',
  not_applicable: 'Nicht anwendbar',
};

// ─── Risk Matrix ─────────────────────────────────────
export function calculateRiskLevel(likelihood: number, impact: number): RiskLevel {
  const score = likelihood * impact;
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  if (score >= 3) return 'low';
  return 'negligible';
}

// ─── Design System Colors ────────────────────────────
export const COLORS = {
  primary: '#1e3a5f',
  accent: '#0d9488',
  background: '#ffffff',
  backgroundMuted: '#f8fafc',
  destructive: '#dc2626',
  warning: '#f59e0b',
  success: '#16a34a',
  info: '#2563eb',
} as const;
