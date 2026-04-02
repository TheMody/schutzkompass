// ── Incident Labels & Constants ─────────────────────────────────────
// Extracted from actions/incidents.ts to avoid "use server" export restriction.

// Types duplicated here to avoid circular dependency with 'use server' file
export type IncidentCategory =
  | 'ransomware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_breach'
  | 'ddos'
  | 'ot_compromise'
  | 'product_vulnerability'
  | 'other';

export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'informational';
export type IncidentStatus = 'detected' | 'reported' | 'analyzing' | 'containing' | 'resolved' | 'closed';

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  ransomware: 'Ransomware / Schadsoftware',
  phishing: 'Phishing-Angriff',
  unauthorized_access: 'Unbefugter Zugriff',
  data_breach: 'Datenverlust / Datenleck',
  ddos: 'DDoS-Angriff',
  ot_compromise: 'OT/Produktionssystem kompromittiert',
  product_vulnerability: 'Schwachstelle in eigenem Produkt (CRA)',
  other: 'Sonstiger Vorfall',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  critical: 'Kritisch',
  major: 'Schwerwiegend',
  minor: 'Gering',
  informational: 'Informativ',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  detected: 'Erkannt',
  reported: 'Gemeldet',
  analyzing: 'In Analyse',
  containing: 'Eindämmung',
  resolved: 'Behoben',
  closed: 'Geschlossen',
};

export const INCIDENT_CATEGORY_ICONS: Record<IncidentCategory, string> = {
  ransomware: '🦠',
  phishing: '📧',
  unauthorized_access: '🔓',
  data_breach: '💾',
  ddos: '🌐',
  ot_compromise: '🏭',
  product_vulnerability: '🔧',
  other: '❓',
};
