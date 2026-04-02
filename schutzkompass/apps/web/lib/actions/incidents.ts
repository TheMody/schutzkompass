'use server';

import { db, incidents as incidentsTable, incidentTimeline } from '@schutzkompass/db';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from './helpers';
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
  isReportable: boolean;
  isCraReportable: boolean;
  detectedAt: string;
  reportedAt?: string;
  resolvedAt?: string;
  affectedSystems: string[];
  assignee?: string;
  timeline: IncidentTimelineEntry[];
  earlyWarningDeadline?: string;
  incidentReportDeadline?: string;
  finalReportDeadline?: string;
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

// ── Operations ─────────────────────────────────────────────────────

export async function getIncidents(): Promise<Incident[]> {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(incidentsTable)
    .where(eq(incidentsTable.organisationId, orgId))
    .orderBy(desc(incidentsTable.detectedAt));

  const result: Incident[] = [];
  for (const row of rows) {
    const timelineRows = await db
      .select()
      .from(incidentTimeline)
      .where(eq(incidentTimeline.incidentId, row.id))
      .orderBy(incidentTimeline.timestamp);

    result.push(mapRowToIncident(row, timelineRows));
  }
  return result;
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const [row] = await db
    .select()
    .from(incidentsTable)
    .where(eq(incidentsTable.id, id))
    .limit(1);

  if (!row) return null;

  const timelineRows = await db
    .select()
    .from(incidentTimeline)
    .where(eq(incidentTimeline.incidentId, id))
    .orderBy(incidentTimeline.timestamp);

  return mapRowToIncident(row, timelineRows);
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const orgId = await getOrgId();
  const now = new Date();

  // Calculate NIS2 deadlines
  const earlyWarningDeadline = input.isReportable
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
    : null;
  const notificationDeadline = input.isReportable
    ? new Date(now.getTime() + 72 * 60 * 60 * 1000)
    : null;
  const finalReportDeadline = input.isReportable
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  const [row] = await db
    .insert(incidentsTable)
    .values({
      organisationId: orgId,
      type: input.isCraReportable ? 'cra_vulnerability' : 'nis2_organisational',
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: 'detected',
      detectedAt: now,
      affectedProductIds: input.affectedSystems,
      // Store deadlines and extra data in the columns we have:
      earlyWarningSentAt: null,
      notificationSentAt: null,
      finalReportSentAt: null,
    })
    .returning();

  // Create initial timeline entry
  const [tlEntry] = await db
    .insert(incidentTimeline)
    .values({
      incidentId: row.id,
      timestamp: now,
      action: 'Vorfall erstellt',
      description: `Kategorie: ${INCIDENT_CATEGORY_LABELS[input.category]}`,
    })
    .returning();

  // Create notification
  await createNotification({
    title: 'Neuer Sicherheitsvorfall',
    message: `Vorfall "${input.title}" wurde erfasst (Kategorie: ${INCIDENT_CATEGORY_LABELS[input.category]}).`,
    icon: 'alert',
    category: 'incident',
  });

  return {
    id: row.id,
    title: input.title,
    description: input.description,
    category: input.category,
    severity: input.severity,
    status: 'detected',
    isReportable: input.isReportable,
    isCraReportable: input.isCraReportable,
    detectedAt: now.toISOString(),
    affectedSystems: input.affectedSystems,
    timeline: [{
      id: tlEntry.id,
      timestamp: now.toISOString(),
      action: 'Vorfall erstellt',
      user: 'System',
      details: `Kategorie: ${INCIDENT_CATEGORY_LABELS[input.category]}`,
    }],
    earlyWarningDeadline: earlyWarningDeadline?.toISOString(),
    incidentReportDeadline: notificationDeadline?.toISOString(),
    finalReportDeadline: finalReportDeadline?.toISOString(),
  };
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
  _user: string,
  details?: string,
): Promise<Incident> {
  const now = new Date();

  const updateValues: Record<string, unknown> = { status };
  if (status === 'resolved' || status === 'closed') {
    updateValues.finalReportSentAt = now;
  }
  if (status === 'reported') {
    updateValues.earlyWarningSentAt = now;
  }

  await db
    .update(incidentsTable)
    .set(updateValues)
    .where(eq(incidentsTable.id, id));

  // Add timeline entry
  await db.insert(incidentTimeline).values({
    incidentId: id,
    timestamp: now,
    action: `Status geändert: ${INCIDENT_STATUS_LABELS[status]}`,
    description: details,
  });

  const result = await getIncidentById(id);
  if (!result) throw new Error('Incident not found');
  return result;
}

export async function getIncidentStatistics() {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(incidentsTable)
    .where(eq(incidentsTable.organisationId, orgId));

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

  for (const row of rows) {
    const s = row.status as IncidentStatus;
    const sev = row.severity as IncidentSeverity;
    if (byStatus[s] !== undefined) byStatus[s]++;
    if (bySeverity[sev] !== undefined) bySeverity[sev]++;
    if (row.type === 'nis2_organisational') reportableCount++;
  }

  const activeCount = rows.filter(
    (r) => !['resolved', 'closed'].includes(r.status),
  ).length;

  return {
    total: rows.length,
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

// ── Communication Templates ────────────────────────────────────────

export interface CommunicationTemplate {
  id: string;
  label: string;
  recipient: string;
  subject: string;
  body: string;
}

export async function generateCommunicationTemplate(
  incidentId: string,
  templateType: 'bsi_early_warning' | 'incident_report' | 'final_report' | 'cra_enisa',
): Promise<CommunicationTemplate> {
  const incident = await getIncidentById(incidentId);
  if (!incident) throw new Error('Vorfall nicht gefunden');

  const now = new Date();
  const detectedDate = new Date(incident.detectedAt).toLocaleString('de-DE');
  const systems = incident.affectedSystems.join(', ') || 'Keine angegeben';

  switch (templateType) {
    case 'bsi_early_warning':
      return {
        id: `tpl-${Date.now()}`,
        label: 'BSI Frühwarnung (24h)',
        recipient: 'BSI — Bundesamt für Sicherheit in der Informationstechnik',
        subject: `[Frühwarnung] Erheblicher Sicherheitsvorfall — ${incident.title}`,
        body: `Sehr geehrte Damen und Herren,

hiermit melden wir gemäß NIS2 Art. 23 Abs. 4 lit. a einen erheblichen Sicherheitsvorfall im Sinne der NIS2-Richtlinie.

**Frühwarnung**

Datum der Erkennung: ${detectedDate}
Datum dieser Meldung: ${now.toLocaleString('de-DE')}

Kurzbeschreibung des Vorfalls:
${incident.description}

Schweregrad: ${incident.severity}
Betroffene Systeme: ${systems}

Verdacht auf böswillige/rechtswidrige Handlung: Wird geprüft
Grenzüberschreitende Auswirkungen: Wird geprüft

Eine aktualisierte Vorfallmeldung gemäß Art. 23 Abs. 4 lit. b folgt innerhalb von 72 Stunden.

Mit freundlichen Grüßen`,
      };

    case 'incident_report':
      return {
        id: `tpl-${Date.now()}`,
        label: 'Vorfallmeldung (72h)',
        recipient: 'BSI — Bundesamt für Sicherheit in der Informationstechnik',
        subject: `[Vorfallmeldung] Aktualisierung — ${incident.title}`,
        body: `Sehr geehrte Damen und Herren,

in Ergänzung zur Frühwarnung vom ${detectedDate} übermitteln wir hiermit die aktualisierte Vorfallmeldung gemäß NIS2 Art. 23 Abs. 4 lit. b.

**Vorfallmeldung — Aktualisierte Bewertung**

Vorfallbezeichnung: ${incident.title}
Beschreibung: ${incident.description}
Schweregrad: ${incident.severity}
Aktueller Status: ${INCIDENT_STATUS_LABELS[incident.status]}

Betroffene Systeme und Dienste:
${systems}

Erste Bewertung des Vorfalls:
- Art des Vorfalls: [Hier ergänzen]
- Vermutete Ursache: [Hier ergänzen]
- Anzahl betroffener Nutzer: [Hier ergänzen]
- Auswirkung auf die Diensteerbringung: [Hier ergänzen]

Ergriffene Sofortmaßnahmen:
[Hier ergänzen]

Empfohlene Maßnahmen:
[Hier ergänzen]

Ein Abschlussbericht gemäß Art. 23 Abs. 4 lit. d folgt innerhalb von 30 Tagen.

Mit freundlichen Grüßen`,
      };

    case 'final_report':
      return {
        id: `tpl-${Date.now()}`,
        label: 'Abschlussbericht (30d)',
        recipient: 'BSI — Bundesamt für Sicherheit in der Informationstechnik',
        subject: `[Abschlussbericht] ${incident.title}`,
        body: `Sehr geehrte Damen und Herren,

hiermit übermitteln wir den Abschlussbericht gemäß NIS2 Art. 23 Abs. 4 lit. d.

**Abschlussbericht**

Vorfallbezeichnung: ${incident.title}
Erkannt am: ${detectedDate}

1. Detaillierte Beschreibung des Vorfalls:
${incident.description}

2. Schweregrad und Auswirkungen:
- Schweregrad: ${incident.severity}
- Betroffene Systeme: ${systems}
- Auswirkung auf Diensteerbringung: [Hier ergänzen]
- Dauer der Beeinträchtigung: [Hier ergänzen]

3. Art der Bedrohung / Ursachenanalyse:
[Hier ergänzen]

4. Ergriffene Abhilfemaßnahmen:
[Hier ergänzen]

5. Grenzüberschreitende Auswirkungen:
[Hier ergänzen]

6. Lessons Learned und präventive Maßnahmen:
[Hier ergänzen]

Mit freundlichen Grüßen`,
      };

    case 'cra_enisa':
      return {
        id: `tpl-${Date.now()}`,
        label: 'CRA Schwachstellenmeldung (ENISA)',
        recipient: 'ENISA — European Union Agency for Cybersecurity',
        subject: `[CRA Art. 14] Meldung aktiv ausgenutzter Schwachstelle — ${incident.title}`,
        body: `Dear Sir or Madam,

We hereby report an actively exploited vulnerability in accordance with CRA Article 14.

**Vulnerability Notification**

Date of Detection: ${detectedDate}
Date of Notification: ${now.toLocaleString('de-DE')}

Product/Component: [Hier ergänzen]
Vulnerability Description:
${incident.description}

Severity: ${incident.severity}
Affected Systems/Products: ${systems}

Exploitability: Actively exploited
CVE ID (if available): [Hier ergänzen]

Mitigation measures taken:
[Hier ergänzen]

Expected timeline for security update:
[Hier ergänzen]

An updated notification will follow within 72 hours.

Best regards`,
      };
  }
}

// ── Row mapper ─────────────────────────────────────────────────────

function mapRowToIncident(
  row: typeof incidentsTable.$inferSelect,
  tlRows: (typeof incidentTimeline.$inferSelect)[],
): Incident {
  const isNis2 = row.type === 'nis2_organisational';
  const isCra = row.type === 'cra_vulnerability' || row.type === 'cra_incident';

  // Calculate deadlines from detectedAt
  const detected = row.detectedAt;
  const earlyWarningDeadline = isNis2
    ? new Date(detected.getTime() + 24 * 60 * 60 * 1000).toISOString()
    : undefined;
  const incidentReportDeadline = isNis2
    ? new Date(detected.getTime() + 72 * 60 * 60 * 1000).toISOString()
    : undefined;
  const finalReportDeadline = isNis2
    ? new Date(detected.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  // Map type back to category
  let category: IncidentCategory = 'other';
  if (row.type === 'cra_vulnerability') category = 'product_vulnerability';

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category,
    severity: (row.severity ?? 'minor') as IncidentSeverity,
    status: row.status as IncidentStatus,
    isReportable: isNis2,
    isCraReportable: isCra,
    detectedAt: detected.toISOString(),
    reportedAt: row.earlyWarningSentAt?.toISOString(),
    resolvedAt: row.finalReportSentAt?.toISOString(),
    affectedSystems: (row.affectedProductIds as string[]) ?? [],
    timeline: tlRows.map((tl) => ({
      id: tl.id,
      timestamp: tl.timestamp.toISOString(),
      action: tl.action,
      user: 'System',
      details: tl.description ?? undefined,
    })),
    earlyWarningDeadline,
    incidentReportDeadline,
    finalReportDeadline,
  };
}
