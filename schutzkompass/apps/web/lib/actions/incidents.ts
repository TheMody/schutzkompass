'use server';

import { INCIDENT_CATEGORY_LABELS, INCIDENT_STATUS_LABELS } from '@/lib/constants/incidents';
import type { IncidentCategory, IncidentSeverity, IncidentStatus } from '@/lib/constants/incidents';
import { createNotification } from './notifications';

// ── Types ──────────────────────────────────────────────────────────

export type { IncidentCategory, IncidentSeverity, IncidentStatus };

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  isReportable: boolean; // NIS2 meldepflichtig
  isCraReportable: boolean; // CRA meldepflichtig
  detectedAt: string;
  reportedAt?: string;
  resolvedAt?: string;
  affectedSystems: string[];
  assignee?: string;
  timeline: IncidentTimelineEntry[];
  // NIS2 deadlines
  earlyWarningDeadline?: string; // 24h
  incidentReportDeadline?: string; // 72h
  finalReportDeadline?: string; // 30d
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  affectedSystems: string[];
  isReportable: boolean;
  isCraReportable: boolean;
}

// ── In-Memory Store ────────────────────────────────────────────────

let incidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Ransomware-Angriff auf Dateiserver',
    description: 'Am 25.03.2026 wurde ein verschlüsselter Dateiserver entdeckt. Ransomware-Notiz fordert 2 BTC.',
    category: 'ransomware',
    severity: 'critical',
    status: 'containing',
    isReportable: true,
    isCraReportable: false,
    detectedAt: '2026-03-25T08:30:00Z',
    reportedAt: '2026-03-25T10:15:00Z',
    affectedSystems: ['Dateiserver FS-01', 'Backup-Server BAK-01'],
    assignee: 'Lisa S.',
    earlyWarningDeadline: '2026-03-26T08:30:00Z',
    incidentReportDeadline: '2026-03-28T08:30:00Z',
    finalReportDeadline: '2026-04-24T08:30:00Z',
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-03-25T08:30:00Z',
        action: 'Vorfall erkannt',
        user: 'IT-Monitoring',
        details: 'Automatische Erkennung durch EDR-System. Dateiserver FS-01 nicht erreichbar.',
      },
      {
        id: 'tl-2',
        timestamp: '2026-03-25T09:00:00Z',
        action: 'Incident Response Team aktiviert',
        user: 'Lisa S.',
        details: 'IR-Team benachrichtigt, erste Analyse gestartet.',
      },
      {
        id: 'tl-3',
        timestamp: '2026-03-25T09:45:00Z',
        action: 'Betroffene Systeme isoliert',
        user: 'Max M.',
        details: 'Netzwerksegment isoliert, Backup-Status geprüft.',
      },
      {
        id: 'tl-4',
        timestamp: '2026-03-25T10:15:00Z',
        action: 'Frühwarnung an BSI gesendet',
        user: 'Lisa S.',
        details: 'Frühwarnung gemäß NIS2 Art. 23 Abs. 4 lit. a übermittelt.',
      },
    ],
  },
];

// ── Operations ─────────────────────────────────────────────────────

export async function getIncidents(): Promise<Incident[]> {
  return [...incidents].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
  );
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  return incidents.find((i) => i.id === id) ?? null;
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const now = new Date();
  const incident: Incident = {
    id: `inc-${Date.now()}`,
    ...input,
    status: 'detected',
    detectedAt: now.toISOString(),
    timeline: [
      {
        id: `tl-${Date.now()}`,
        timestamp: now.toISOString(),
        action: 'Vorfall erstellt',
        user: 'System',
        details: `Kategorie: ${INCIDENT_CATEGORY_LABELS[input.category]}`,
      },
    ],
    earlyWarningDeadline: input.isReportable
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    incidentReportDeadline: input.isReportable
      ? new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString()
      : undefined,
    finalReportDeadline: input.isReportable
      ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };
  incidents = [...incidents, incident];

  // Create notification
  await createNotification({
    title: 'Neuer Sicherheitsvorfall',
    message: `Vorfall "${input.title}" wurde erfasst (Kategorie: ${INCIDENT_CATEGORY_LABELS[input.category]}).`,
    icon: 'alert',
    category: 'incident',
  });

  return incident;
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
  user: string,
  details?: string,
): Promise<Incident> {
  const idx = incidents.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Incident not found');

  const now = new Date().toISOString();
  const updated: Incident = {
    ...incidents[idx],
    status,
    resolvedAt: status === 'resolved' || status === 'closed' ? now : incidents[idx].resolvedAt,
    timeline: [
      ...incidents[idx].timeline,
      {
        id: `tl-${Date.now()}`,
        timestamp: now,
        action: `Status geändert: ${INCIDENT_STATUS_LABELS[status]}`,
        user,
        details,
      },
    ],
  };

  incidents = incidents.map((i) => (i.id === id ? updated : i));
  return updated;
}

export async function getIncidentStatistics() {
  const byStatus: Record<IncidentStatus, number> = {
    detected: 0,
    reported: 0,
    analyzing: 0,
    containing: 0,
    resolved: 0,
    closed: 0,
  };

  const bySeverity: Record<IncidentSeverity, number> = {
    critical: 0,
    major: 0,
    minor: 0,
    informational: 0,
  };

  let reportableCount = 0;

  for (const i of incidents) {
    byStatus[i.status]++;
    bySeverity[i.severity]++;
    if (i.isReportable) reportableCount++;
  }

  const activeCount = incidents.filter(
    (i) => !['resolved', 'closed'].includes(i.status),
  ).length;

  return {
    total: incidents.length,
    active: activeCount,
    reportable: reportableCount,
    byStatus,
    bySeverity,
  };
}

/**
 * Determine if an incident is NIS2-reportable based on category and impact
 */
export async function classifyIncidentSeverity(
  category: IncidentCategory,
  affectedSystemCount: number,
  dataBreachSuspected: boolean,
): Promise<{ severity: IncidentSeverity; isReportable: boolean; reasoning: string }> {
  // NIS2 Art. 23: "erheblicher Sicherheitsvorfall"
  if (category === 'ransomware' || category === 'ot_compromise') {
    return {
      severity: 'critical',
      isReportable: true,
      reasoning: 'Ransomware/OT-Kompromittierung ist grundsätzlich ein erheblicher Sicherheitsvorfall nach NIS2 Art. 23.',
    };
  }

  if (dataBreachSuspected) {
    return {
      severity: 'critical',
      isReportable: true,
      reasoning: 'Datenleck/-verlust ist ein erheblicher Sicherheitsvorfall (NIS2 Art. 23 + ggf. DSGVO Art. 33).',
    };
  }

  if (category === 'ddos' && affectedSystemCount >= 3) {
    return {
      severity: 'major',
      isReportable: true,
      reasoning: 'DDoS mit wesentlicher Auswirkung auf mehrere Systeme ist meldepflichtig.',
    };
  }

  if (category === 'unauthorized_access') {
    return {
      severity: affectedSystemCount >= 2 ? 'major' : 'minor',
      isReportable: affectedSystemCount >= 2,
      reasoning: affectedSystemCount >= 2
        ? 'Unbefugter Zugriff auf mehrere Systeme — meldepflichtig.'
        : 'Einzelner unbefugter Zugriff — Meldepflicht abhängig von Auswirkung.',
    };
  }

  if (category === 'product_vulnerability') {
    return {
      severity: 'major',
      isReportable: false,
      reasoning: 'Schwachstelle in eigenem Produkt: CRA-Meldepflicht prüfen (24h Frühwarnung an ENISA).',
    };
  }

  return {
    severity: 'minor',
    isReportable: false,
    reasoning: 'Kein erheblicher Sicherheitsvorfall identifiziert. Dokumentation empfohlen.',
  };
}
