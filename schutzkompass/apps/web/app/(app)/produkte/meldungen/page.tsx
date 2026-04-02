'use client';

import { useState } from 'react';
import {
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  ExternalLink,
  Shield,
  Timer,
} from 'lucide-react';
import { Pagination, usePagination } from '@/components/shared/pagination';

// ── Types ──────────────────────────────────────────────────────────

type ReportType = 'nis2_early_warning' | 'nis2_incident_report' | 'nis2_final_report' | 'cra_vulnerability' | 'cra_updated' | 'cra_final';
type ReportStatus = 'draft' | 'submitted' | 'acknowledged' | 'pending';

interface Report {
  id: string;
  type: ReportType;
  title: string;
  recipientAuthority: string;
  relatedIncident?: string;
  relatedProduct?: string;
  status: ReportStatus;
  deadline: string;
  submittedAt?: string;
  createdAt: string;
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  nis2_early_warning: 'NIS2 Frühwarnung (24h)',
  nis2_incident_report: 'NIS2 Vorfallmeldung (72h)',
  nis2_final_report: 'NIS2 Abschlussbericht (30d)',
  cra_vulnerability: 'CRA Schwachstellenmeldung (24h)',
  cra_updated: 'CRA Aktualisierte Meldung (72h)',
  cra_final: 'CRA Abschlussbericht (14d)',
};

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Entwurf',
  submitted: 'Übermittelt',
  acknowledged: 'Bestätigt',
  pending: 'Ausstehend',
};

// ── Sample Data ────────────────────────────────────────────────────

const sampleReports: Report[] = [
  {
    id: 'rpt-1',
    type: 'nis2_early_warning',
    title: 'Frühwarnung – Ransomware-Angriff auf Dateiserver',
    recipientAuthority: 'BSI',
    relatedIncident: 'Ransomware-Angriff auf Dateiserver',
    status: 'submitted',
    deadline: '2026-03-26T08:30:00Z',
    submittedAt: '2026-03-25T10:15:00Z',
    createdAt: '2026-03-25T09:00:00Z',
  },
  {
    id: 'rpt-2',
    type: 'nis2_incident_report',
    title: 'Vorfallmeldung – Ransomware-Angriff (Bewertung)',
    recipientAuthority: 'BSI',
    relatedIncident: 'Ransomware-Angriff auf Dateiserver',
    status: 'pending',
    deadline: '2026-03-28T08:30:00Z',
    createdAt: '2026-03-25T10:30:00Z',
  },
  {
    id: 'rpt-3',
    type: 'cra_vulnerability',
    title: 'CRA Schwachstellenmeldung – CVE-2026-0042 in SmartSensor Firmware',
    recipientAuthority: 'ENISA / BSI',
    relatedProduct: 'SmartSensor v3.2',
    status: 'draft',
    deadline: '2026-04-02T14:00:00Z',
    createdAt: '2026-04-01T14:00:00Z',
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function statusColor(s: ReportStatus) {
  return {
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-blue-100 text-blue-700',
    acknowledged: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
  }[s];
}

function timeLeft(deadline: string): { text: string; urgent: boolean; overdue: boolean } {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { text: 'Überfällig!', urgent: true, overdue: true };
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  if (days > 0) return { text: `${days}d ${rem}h`, urgent: days < 1, overdue: false };
  return { text: `${hours}h`, urgent: hours < 6, overdue: false };
}

// ── Page ───────────────────────────────────────────────────────────

export default function MeldungenPage() {
  const [reports] = useState<Report[]>(sampleReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { paginatedItems: paginatedReports, paginationProps } = usePagination(reports, 10);

  const pendingCount = reports.filter((r) => r.status === 'pending' || r.status === 'draft').length;
  const submittedCount = reports.filter((r) => r.status === 'submitted' || r.status === 'acknowledged').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meldewesen</h1>
        <p className="text-muted-foreground">
          NIS2- und CRA-konforme Meldungen an BSI und ENISA verwalten.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <FileText className="h-4 w-4" /> Gesamt
          </div>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="h-4 w-4 text-orange-500" /> Ausstehend
          </div>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Send className="h-4 w-4 text-blue-500" /> Übermittelt
          </div>
          <p className="text-2xl font-bold">{submittedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Shield className="h-4 w-4 text-purple-500" /> Behörden
          </div>
          <p className="text-2xl font-bold">BSI / ENISA</p>
        </div>
      </div>

      {/* Regulatory Framework Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" /> NIS2 Meldefristen (Art. 23)
          </h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• <strong>24h:</strong> Frühwarnung an BSI (Art. 23 Abs. 4 lit. a)</p>
            <p>• <strong>72h:</strong> Vorfallmeldung mit erster Bewertung (Art. 23 Abs. 4 lit. b)</p>
            <p>• <strong>30d:</strong> Abschlussbericht mit Ursachenanalyse (Art. 23 Abs. 4 lit. d)</p>
          </div>
        </div>
        <div className="rounded-lg border bg-purple-50 p-4">
          <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" /> CRA Meldefristen (Art. 14)
          </h3>
          <div className="space-y-1 text-sm text-purple-800">
            <p>• <strong>24h:</strong> Frühwarnung an ENISA bei aktiv ausgenutzter Schwachstelle</p>
            <p>• <strong>72h:</strong> Aktualisierte Schwachstellenmeldung</p>
            <p>• <strong>14d:</strong> Abschlussbericht mit Maßnahmen</p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Meldungen</h2>
        <div className="space-y-3">
          {paginatedReports.map((r) => {
            const tl = timeLeft(r.deadline);
            return (
              <button
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className="w-full text-left rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(r.status)}`}>
                        {REPORT_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Typ: {REPORT_TYPE_LABELS[r.type]}</span>
                      <span>An: {r.recipientAuthority}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status !== 'submitted' && r.status !== 'acknowledged' && (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
                          tl.overdue
                            ? 'bg-red-200 text-red-900'
                            : tl.urgent
                              ? 'bg-orange-200 text-orange-900'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <Timer className="h-3 w-3" />
                        {tl.text}
                      </span>
                    )}
                    {(r.status === 'submitted' || r.status === 'acknowledged') && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <Pagination {...paginationProps} />
      </div>

      {/* Detail Panel */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg shadow-2xl overflow-auto">
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <h2 className="font-bold">Meldungs-Details</h2>
              <button onClick={() => setSelectedReport(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <p><strong>Titel:</strong> {selectedReport.title}</p>
                <p><strong>Typ:</strong> {REPORT_TYPE_LABELS[selectedReport.type]}</p>
                <p><strong>Empfänger:</strong> {selectedReport.recipientAuthority}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(selectedReport.status)}`}>
                    {REPORT_STATUS_LABELS[selectedReport.status]}
                  </span>
                </p>
                <p><strong>Frist:</strong> {new Date(selectedReport.deadline).toLocaleString('de-DE')}</p>
                {selectedReport.submittedAt && (
                  <p><strong>Übermittelt:</strong> {new Date(selectedReport.submittedAt).toLocaleString('de-DE')}</p>
                )}
                {selectedReport.relatedIncident && (
                  <p><strong>Zugehöriger Vorfall:</strong> {selectedReport.relatedIncident}</p>
                )}
                {selectedReport.relatedProduct && (
                  <p><strong>Betroffenes Produkt:</strong> {selectedReport.relatedProduct}</p>
                )}
              </div>

              {/* Template Preview */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Meldungsvorlage</h3>
                <div className="rounded-lg border bg-muted/50 p-4 text-sm font-mono space-y-2">
                  {selectedReport.type.startsWith('nis2') ? (
                    <>
                      <p className="font-bold">BSI Meldung gemäß NIS2 Art. 23</p>
                      <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                      <p>Meldender: [Organisationsname]</p>
                      <p>Datum: {new Date().toLocaleDateString('de-DE')}</p>
                      <p>Vorfallkategorie: [Kategorie]</p>
                      <p>Betroffene Dienste: [Dienste]</p>
                      <p>Auswirkung: [Beschreibung]</p>
                      <p>Grenzüberschreitend: [Ja/Nein]</p>
                      <p>Erste Maßnahmen: [Maßnahmen]</p>
                      <p>Kontakt: [Ansprechpartner]</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">ENISA / BSI Meldung gemäß CRA Art. 14</p>
                      <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                      <p>Hersteller: [Organisationsname]</p>
                      <p>Produkt: {selectedReport.relatedProduct || '[Produktname]'}</p>
                      <p>Schwachstelle: [CVE-ID]</p>
                      <p>CVSS Score: [Score]</p>
                      <p>Aktiv ausgenutzt: [Ja/Nein]</p>
                      <p>Korrekturmaßnahmen: [Beschreibung]</p>
                      <p>Patch verfügbar: [Ja/Nein]</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" /> Als übermittelt markieren
                </button>
                <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
