'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getIncidents,
  getIncidentStatistics,
  createIncident,
  updateIncidentStatus,
  classifyIncidentSeverity,
  generateCommunicationTemplate,
  type Incident,
  type CreateIncidentInput,
  type CommunicationTemplate,
} from '@/lib/actions/incidents';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_CATEGORY_ICONS,
  type IncidentCategory,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/lib/constants/incidents';
import {
  AlertTriangle,
  Plus,
  Clock,
  Shield,
  Activity,
  ChevronRight,
  X,
  Timer,
  FileText,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Pagination, usePagination } from '@/components/shared/pagination';

// ── Helpers ────────────────────────────────────────────────────────

function severityColor(s: IncidentSeverity) {
  return {
    critical: 'bg-red-100 text-red-800 border-red-200',
    major: 'bg-orange-100 text-orange-800 border-orange-200',
    minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    informational: 'bg-blue-100 text-blue-800 border-blue-200',
  }[s];
}

function statusColor(s: IncidentStatus) {
  return {
    detected: 'bg-red-100 text-red-700',
    reported: 'bg-blue-100 text-blue-700',
    analyzing: 'bg-purple-100 text-purple-700',
    containing: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-muted text-muted-foreground',
  }[s];
}

function timeLeft(deadline: string): { text: string; urgent: boolean; overdue: boolean } {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { text: 'Überfällig!', urgent: true, overdue: true };
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return { text: `${days}d ${remainingHours}h`, urgent: days < 1, overdue: false };
  return { text: `${hours}h`, urgent: hours < 6, overdue: false };
}

// ── Main Page ──────────────────────────────────────────────────────

export default function VorfallmanagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getIncidentStatistics>> | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');

  const load = useCallback(async () => {
    const [inc, st] = await Promise.all([getIncidents(), getIncidentStatistics()]);
    setIncidents(inc);
    setStats(st);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = incidents.filter((i) => statusFilter === 'all' || i.status === statusFilter);
  const { paginatedItems: paginatedIncidents, paginationProps } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vorfallmanagement</h1>
          <p className="text-muted-foreground">
            Sicherheitsvorfälle erkennen, klassifizieren und NIS2/CRA-konform melden.
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Vorfall melden
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<AlertTriangle className="h-5 w-5 text-red-500" />} label="Aktive Vorfälle" value={stats.active} />
          <StatCard icon={<Activity className="h-5 w-5 text-orange-500" />} label="Gesamt" value={stats.total} />
          <StatCard icon={<Send className="h-5 w-5 text-blue-500" />} label="Meldepflichtig" value={stats.reportable} />
          <StatCard
            icon={<Shield className="h-5 w-5 text-purple-500" />}
            label="Kritisch"
            value={stats.bySeverity.critical}
          />
        </div>
      )}

      {/* NIS2 Deadline Banner */}
      {incidents.some(
        (i) => i.isReportable && !['resolved', 'closed'].includes(i.status),
      ) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-red-800 mb-2">
            <Timer className="h-5 w-5" /> NIS2-Meldefristen aktiv
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {incidents
              .filter((i) => i.isReportable && !['resolved', 'closed'].includes(i.status))
              .map((i) => (
                <div key={i.id} className="flex flex-col gap-1 rounded-md bg-card border p-3 text-sm">
                  <span className="font-medium truncate">{i.title}</span>
                  <div className="flex gap-3 mt-1">
                    {i.earlyWarningDeadline && (
                      <DeadlineChip label="24h" deadline={i.earlyWarningDeadline} />
                    )}
                    {i.incidentReportDeadline && (
                      <DeadlineChip label="72h" deadline={i.incidentReportDeadline} />
                    )}
                    {i.finalReportDeadline && (
                      <DeadlineChip label="30d" deadline={i.finalReportDeadline} />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'detected', 'reported', 'analyzing', 'containing', 'resolved', 'closed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {s === 'all' ? 'Alle' : INCIDENT_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Keine Vorfälle gefunden.
          </div>
        ) : (
          paginatedIncidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="w-full text-left rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl leading-none mt-0.5">
                    {INCIDENT_CATEGORY_ICONS[inc.category]}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{inc.title}</span>
                      {inc.isReportable && (
                        <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                          NIS2 Meldepflichtig
                        </span>
                      )}
                      {inc.isCraReportable && (
                        <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                          CRA Meldepflichtig
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{inc.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${severityColor(inc.severity)}`}>
                    {INCIDENT_SEVERITY_LABELS[inc.severity]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(inc.status)}`}>
                    {INCIDENT_STATUS_LABELS[inc.status]}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground ml-9">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(inc.detectedAt).toLocaleString('de-DE')}
                </span>
                {inc.assignee && <span>Zuständig: {inc.assignee}</span>}
                <span>{inc.affectedSystems.length} System(e) betroffen</span>
              </div>
            </button>
          ))
        )}
        <Pagination {...paginationProps} />
      </div>
      {showWizard && (
        <IncidentWizard
          onClose={() => setShowWizard(false)}
          onCreated={(inc) => {
            setShowWizard(false);
            setSelectedIncident(inc);
            load();
          }}
        />
      )}

      {/* Detail Panel */}
      {selectedIncident && (
        <IncidentDetailPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={(updated) => {
            setSelectedIncident(updated);
            load();
          }}
        />
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        {icon} {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// ── Deadline Chip ──────────────────────────────────────────────────

function DeadlineChip({ label, deadline }: { label: string; deadline: string }) {
  const tl = timeLeft(deadline);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
        tl.overdue
          ? 'bg-red-200 text-red-900'
          : tl.urgent
            ? 'bg-orange-200 text-orange-900'
            : 'bg-green-100 text-green-800'
      }`}
    >
      <Timer className="h-3 w-3" />
      {label}: {tl.text}
    </span>
  );
}

// ── Incident Detection Wizard ──────────────────────────────────────

function IncidentWizard({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (inc: Incident) => void;
}) {
  const [step, setStep] = useState<'category' | 'details' | 'classification' | 'confirm'>('category');
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systems, setSystems] = useState('');
  const [dataBreachSuspected, setDataBreachSuspected] = useState(false);
  const [classification, setClassification] = useState<Awaited<ReturnType<typeof classifyIncidentSeverity>> | null>(null);
  const [creating, setCreating] = useState(false);

  const categoryEntries = Object.entries(INCIDENT_CATEGORY_LABELS) as [IncidentCategory, string][];

  async function handleClassify() {
    if (!category) return;
    const affectedCount = systems.split(',').filter((s) => s.trim()).length;
    const result = await classifyIncidentSeverity(category, affectedCount, dataBreachSuspected);
    setClassification(result);
    setStep('classification');
  }

  async function handleCreate() {
    if (!category || !classification) return;
    setCreating(true);
    const input: CreateIncidentInput = {
      title,
      description,
      category,
      severity: classification.severity,
      affectedSystems: systems.split(',').map((s) => s.trim()).filter(Boolean),
      isReportable: classification.isReportable,
      isCraReportable: category === 'product_vulnerability',
    };
    const inc = await createIncident(input);
    onCreated(inc);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Vorfall melden
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-4 pt-4">
          {(['category', 'details', 'classification', 'confirm'] as const).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s
                    ? 'bg-red-600 text-white'
                    : idx < ['category', 'details', 'classification', 'confirm'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </span>
              {idx < 3 && <div className="w-6 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        <div className="p-6">
          {/* Step 1: Category */}
          {step === 'category' && (
            <div className="space-y-4">
              <h3 className="font-semibold">1. Was ist passiert?</h3>
              <p className="text-sm text-muted-foreground">
                Wählen Sie die Kategorie, die den Vorfall am besten beschreibt.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {categoryEntries.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCategory(key);
                      setStep('details');
                    }}
                    className={`rounded-lg border-2 p-4 text-left hover:border-red-400 transition-colors ${
                      category === key ? 'border-red-500 bg-red-50' : 'border-border'
                    }`}
                  >
                    <span className="text-2xl">{INCIDENT_CATEGORY_ICONS[key]}</span>
                    <p className="font-medium mt-1 text-sm">{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <h3 className="font-semibold">2. Details zum Vorfall</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Titel *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Ransomware-Angriff auf Server-Cluster"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beschreibung *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Was wurde beobachtet? Wann wurde der Vorfall entdeckt?"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Betroffene Systeme (kommagetrennt)</label>
                <input
                  type="text"
                  value={systems}
                  onChange={(e) => setSystems(e.target.value)}
                  placeholder="z.B. Dateiserver FS-01, ERP-System, Mail-Server"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="databreach"
                  checked={dataBreachSuspected}
                  onChange={(e) => setDataBreachSuspected(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <label htmlFor="databreach" className="text-sm">
                  Datenverlust/-abfluss vermutet (DSGVO-relevant)
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setStep('category')}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                >
                  Zurück
                </button>
                <button
                  onClick={handleClassify}
                  disabled={!title.trim() || !description.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Klassifizieren
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Classification */}
          {step === 'classification' && classification && (
            <div className="space-y-4">
              <h3 className="font-semibold">3. Automatische Klassifizierung</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Schweregrad:</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold border ${severityColor(classification.severity)}`}>
                    {INCIDENT_SEVERITY_LABELS[classification.severity]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">NIS2 Meldepflicht:</span>
                  {classification.isReportable ? (
                    <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-sm font-bold">
                      Ja — Meldepflichtig
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-bold">
                      Nein
                    </span>
                  )}
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                  <strong>Begründung:</strong> {classification.reasoning}
                </div>
                {classification.isReportable && (
                  <div className="bg-red-50 rounded-lg p-3 text-sm text-red-800 space-y-1">
                    <p className="font-semibold">NIS2-Meldefristen:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li><strong>24 Stunden:</strong> Frühwarnung an BSI (Art. 23 Abs. 4 lit. a)</li>
                      <li><strong>72 Stunden:</strong> Vorfallmeldung mit Bewertung (Art. 23 Abs. 4 lit. b)</li>
                      <li><strong>1 Monat:</strong> Abschlussbericht (Art. 23 Abs. 4 lit. d)</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setStep('details')}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                >
                  Zurück
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && classification && (
            <div className="space-y-4">
              <h3 className="font-semibold">4. Vorfall bestätigen & erstellen</h3>
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <p><strong>Kategorie:</strong> {category && INCIDENT_CATEGORY_LABELS[category]}</p>
                <p><strong>Titel:</strong> {title}</p>
                <p><strong>Beschreibung:</strong> {description}</p>
                <p><strong>Betroffene Systeme:</strong> {systems || '—'}</p>
                <p>
                  <strong>Schweregrad:</strong>{' '}
                  <span className={`rounded-full px-2 py-0.5 text-xs border ${severityColor(classification.severity)}`}>
                    {INCIDENT_SEVERITY_LABELS[classification.severity]}
                  </span>
                </p>
                <p>
                  <strong>Meldepflicht:</strong>{' '}
                  {classification.isReportable ? '✅ Ja' : '❌ Nein'}
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setStep('classification')}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                >
                  Zurück
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {creating ? 'Erstelle...' : 'Vorfall erstellen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Incident Detail Panel ──────────────────────────────────────────

function IncidentDetailPanel({
  incident,
  onClose,
  onUpdate,
}: {
  incident: Incident;
  onClose: () => void;
  onUpdate: (inc: Incident) => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<CommunicationTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const statusFlow: IncidentStatus[] = ['detected', 'reported', 'analyzing', 'containing', 'resolved', 'closed'];
  const currentIdx = statusFlow.indexOf(incident.status);

  async function advanceStatus() {
    if (currentIdx >= statusFlow.length - 1) return;
    setUpdatingStatus(true);
    const next = statusFlow[currentIdx + 1];
    const updated = await updateIncidentStatus(incident.id, next, 'Benutzer');
    onUpdate(updated);
    setUpdatingStatus(false);
  }

  async function openTemplate(templateType: 'bsi_early_warning' | 'incident_report' | 'final_report' | 'cra_enisa') {
    setLoadingTemplate(true);
    try {
      const tpl = await generateCommunicationTemplate(incident.id, templateType);
      setActiveTemplate(tpl);
    } catch (err) {
      console.error('Template generation failed:', err);
    } finally {
      setLoadingTemplate(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 z-10">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl">{INCIDENT_CATEGORY_ICONS[incident.category]}</span>
                <h2 className="text-lg font-bold">{incident.title}</h2>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${severityColor(incident.severity)}`}>
                  {INCIDENT_SEVERITY_LABELS[incident.severity]}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(incident.status)}`}>
                  {INCIDENT_STATUS_LABELS[incident.status]}
                </span>
                {incident.isReportable && (
                  <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                    NIS2 Meldepflichtig
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Status Workflow */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Workflow-Status</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {statusFlow.map((s, idx) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap ${
                      idx <= currentIdx
                        ? idx === currentIdx
                          ? 'bg-primary text-white'
                          : 'bg-green-100 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx < currentIdx && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                    {INCIDENT_STATUS_LABELS[s]}
                  </div>
                  {idx < statusFlow.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            {currentIdx < statusFlow.length - 1 && (
              <button
                onClick={advanceStatus}
                disabled={updatingStatus}
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
              >
                → {INCIDENT_STATUS_LABELS[statusFlow[currentIdx + 1]]}
              </button>
            )}
          </div>

          {/* NIS2 Deadlines Timer */}
          {incident.isReportable && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Timer className="h-4 w-4 text-red-500" /> NIS2-Meldefristen
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {incident.earlyWarningDeadline && (
                  <DeadlineCard
                    label="Frühwarnung (24h)"
                    sublabel="Art. 23 Abs. 4 lit. a"
                    deadline={incident.earlyWarningDeadline}
                  />
                )}
                {incident.incidentReportDeadline && (
                  <DeadlineCard
                    label="Vorfallmeldung (72h)"
                    sublabel="Art. 23 Abs. 4 lit. b"
                    deadline={incident.incidentReportDeadline}
                  />
                )}
                {incident.finalReportDeadline && (
                  <DeadlineCard
                    label="Abschlussbericht (30d)"
                    sublabel="Art. 23 Abs. 4 lit. d"
                    deadline={incident.finalReportDeadline}
                  />
                )}
              </div>
            </div>
          )}

          {/* Incident Info */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Details</h3>
            <div className="rounded-lg border p-3 text-sm space-y-2">
              <p><strong>Kategorie:</strong> {INCIDENT_CATEGORY_LABELS[incident.category]}</p>
              <p><strong>Beschreibung:</strong> {incident.description}</p>
              <p><strong>Erkannt am:</strong> {new Date(incident.detectedAt).toLocaleString('de-DE')}</p>
              {incident.reportedAt && (
                <p><strong>Gemeldet am:</strong> {new Date(incident.reportedAt).toLocaleString('de-DE')}</p>
              )}
              {incident.resolvedAt && (
                <p><strong>Behoben am:</strong> {new Date(incident.resolvedAt).toLocaleString('de-DE')}</p>
              )}
              <p><strong>Zuständig:</strong> {incident.assignee || '—'}</p>
              <p><strong>Betroffene Systeme:</strong> {incident.affectedSystems.join(', ') || '—'}</p>
            </div>
          </div>

          {/* Communication Templates */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Kommunikationsvorlagen
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <TemplateButton
                label="BSI Frühwarnung (24h)"
                description="Erstmeldung an das BSI gemäß NIS2 Art. 23 Abs. 4 lit. a"
                onClick={() => openTemplate('bsi_early_warning')}
              />
              <TemplateButton
                label="Vorfallmeldung (72h)"
                description="Detaillierte Bewertung gemäß NIS2 Art. 23 Abs. 4 lit. b"
                onClick={() => openTemplate('incident_report')}
              />
              <TemplateButton
                label="Abschlussbericht (30d)"
                description="Umfassender Bericht gemäß NIS2 Art. 23 Abs. 4 lit. d"
                onClick={() => openTemplate('final_report')}
              />
              {incident.isCraReportable && (
                <TemplateButton
                  label="CRA Schwachstellenmeldung (ENISA)"
                  description="Meldung aktiv ausgenutzter Schwachstellen gemäß CRA Art. 14"
                  onClick={() => openTemplate('cra_enisa')}
                />
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Vorfall-Timeline</h3>
            <div className="relative border-l-2 border-border ml-3 space-y-4">
              {incident.timeline.map((entry) => (
                <div key={entry.id} className="relative pl-6">
                  <div className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString('de-DE')} — {entry.user}
                  </div>
                  <p className="font-medium text-sm">{entry.action}</p>
                  {entry.details && (
                    <p className="text-sm text-muted-foreground mt-0.5">{entry.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {activeTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-card border-b p-4 rounded-t-xl z-10 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{activeTemplate.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Empfänger: {activeTemplate.recipient}
                </p>
              </div>
              <button onClick={() => setActiveTemplate(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Betreff</label>
                <p className="text-sm font-medium mt-1 bg-muted rounded-lg p-3">{activeTemplate.subject}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Inhalt</label>
                <pre className="text-sm mt-1 bg-muted rounded-lg p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-[50vh] overflow-auto">
                  {activeTemplate.body}
                </pre>
              </div>
            </div>
            <div className="border-t p-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Betreff: ${activeTemplate.subject}\n\n${activeTemplate.body}`
                  );
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                📋 In Zwischenablage kopieren
              </button>
              <button
                onClick={() => setActiveTemplate(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loadingTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-lg p-6 shadow-lg text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Vorlage wird generiert…</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Deadline Card ──────────────────────────────────────────────────

function DeadlineCard({ label, sublabel, deadline }: { label: string; sublabel: string; deadline: string }) {
  const tl = timeLeft(deadline);
  return (
    <div
      className={`rounded-lg border p-3 text-center ${
        tl.overdue ? 'border-red-300 bg-red-50' : tl.urgent ? 'border-orange-300 bg-orange-50' : 'border-green-200 bg-green-50'
      }`}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`text-lg font-bold mt-1 ${
          tl.overdue ? 'text-red-700' : tl.urgent ? 'text-orange-700' : 'text-green-700'
        }`}
      >
        {tl.text}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
    </div>
  );
}

// ── Template Button ────────────────────────────────────────────────

function TemplateButton({ label, description, onClick }: { label: string; description: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted transition-colors"
    >
      <FileText className="h-5 w-5 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
    </button>
  );
}
