'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getSuppliers,
  getSupplierStatistics,
  createSupplier,
  sendQuestionnaire,
  getQuestionnaireContent,
  type Supplier,
} from '@/lib/actions/suppliers';
import {
  RISK_CLASS_LABELS,
  QUESTIONNAIRE_STATUS_LABELS,
  type SupplierRiskClass,
  type QuestionnaireStatus,
  type QuestionnaireQuestion,
} from '@/lib/constants/suppliers';
import {
  Plus,
  Send,
  Shield,
  Search,
  X,
  ChevronRight,
  Building2,
  Mail,
  User,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Pagination, usePagination } from '@/components/shared/pagination';

// ── Helpers ────────────────────────────────────────────────────────

function riskClassColor(rc: SupplierRiskClass) {
  return {
    critical: 'bg-red-100 text-red-800 border-red-200',
    important: 'bg-orange-100 text-orange-800 border-orange-200',
    standard: 'bg-green-100 text-green-800 border-green-200',
  }[rc];
}

function qStatusColor(s: QuestionnaireStatus) {
  return {
    not_sent: 'bg-muted text-muted-foreground',
    sent: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  }[s];
}

function scoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

// ── Page ───────────────────────────────────────────────────────────

export default function LieferkettenSicherheitPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getSupplierStatistics>> | null>(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<SupplierRiskClass | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireQuestion[]>([]);

  const load = useCallback(async () => {
    const [s, st, q] = await Promise.all([
      getSuppliers(),
      getSupplierStatistics(),
      getQuestionnaireContent(),
    ]);
    setSuppliers(s);
    setStats(st);
    setQuestionnaire(q);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = suppliers.filter((s) => {
    if (filterClass !== 'all' && s.riskClass !== filterClass) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.contactName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { paginatedItems: paginatedSuppliers, paginationProps } = usePagination(filtered, 10);

  // Group questionnaire by category
  const questionsByCategory = questionnaire.reduce<Record<string, QuestionnaireQuestion[]>>((acc, q) => {
    (acc[q.category] = acc[q.category] || []).push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lieferketten-Sicherheit</h1>
          <p className="text-muted-foreground">
            Lieferanten verwalten, Sicherheitsfragebögen versenden und Risiken bewerten.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" /> Lieferant hinzufügen
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Building2 className="h-4 w-4" /> Gesamt
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Kritisch
            </div>
            <p className="text-2xl font-bold">{stats.byRiskClass.critical}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Bewertet
            </div>
            <p className="text-2xl font-bold">{stats.completedQuestionnaires}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4 text-orange-500" /> Ausstehend
            </div>
            <p className="text-2xl font-bold">{stats.pendingQuestionnaires}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Shield className="h-4 w-4 text-blue-500" /> Ø Score
            </div>
            <p className={`text-2xl font-bold ${scoreColor(stats.averageScore)}`}>
              {stats.averageScore !== null ? `${stats.averageScore}/100` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Risk Distribution */}
      {stats && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Risiko-Verteilung</h3>
          <div className="flex gap-2 h-4 rounded-full overflow-hidden">
            {stats.byRiskClass.critical > 0 && (
              <div
                className="bg-red-500 rounded-full"
                style={{ flex: stats.byRiskClass.critical }}
                title={`Kritisch: ${stats.byRiskClass.critical}`}
              />
            )}
            {stats.byRiskClass.important > 0 && (
              <div
                className="bg-orange-400 rounded-full"
                style={{ flex: stats.byRiskClass.important }}
                title={`Wichtig: ${stats.byRiskClass.important}`}
              />
            )}
            {stats.byRiskClass.standard > 0 && (
              <div
                className="bg-green-400 rounded-full"
                style={{ flex: stats.byRiskClass.standard }}
                title={`Standard: ${stats.byRiskClass.standard}`}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Kritisch ({stats.byRiskClass.critical})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-400 rounded-full" /> Wichtig ({stats.byRiskClass.important})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" /> Standard ({stats.byRiskClass.standard})</span>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lieferant suchen..."
            className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'important', 'standard'] as const).map((rc) => (
            <button
              key={rc}
              onClick={() => setFilterClass(rc)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                filterClass === rc
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {rc === 'all' ? 'Alle' : RISK_CLASS_LABELS[rc]}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Lieferant</th>
              <th className="px-4 py-3 font-medium">Risikoklasse</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Fragebogen</th>
              <th className="px-4 py-3 font-medium">ISO 27001</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Keine Lieferanten gefunden.
                </td>
              </tr>
            ) : (
              paginatedSuppliers.map((sup) => (
                <tr
                  key={sup.id}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedSupplier(sup)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{sup.name}</div>
                    <div className="text-xs text-muted-foreground">{sup.contactName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${riskClassColor(sup.riskClass)}`}>
                      {RISK_CLASS_LABELS[sup.riskClass]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${scoreColor(sup.riskScore)}`}>
                      {sup.riskScore !== null ? `${sup.riskScore}/100` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${qStatusColor(sup.questionnaireStatus)}`}>
                      {QUESTIONNAIRE_STATUS_LABELS[sup.questionnaireStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {sup.iso27001CertExpiry ? (
                      <span className="text-xs">
                        bis {new Date(sup.iso27001CertExpiry).toLocaleDateString('de-DE')}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination {...paginationProps} />

      {/* Add Supplier Dialog */}
      {showAddDialog && (
        <AddSupplierDialog
          onClose={() => setShowAddDialog(false)}
          onCreated={() => {
            setShowAddDialog(false);
            load();
          }}
        />
      )}

      {/* Supplier Detail Panel */}
      {selectedSupplier && (
        <SupplierDetailPanel
          supplier={selectedSupplier}
          questionsByCategory={questionsByCategory}
          onClose={() => setSelectedSupplier(null)}
          onUpdate={() => {
            setSelectedSupplier(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ── Add Supplier Dialog ────────────────────────────────────────────

function AddSupplierDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [riskClass, setRiskClass] = useState<SupplierRiskClass>('standard');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await createSupplier({
      name,
      contactEmail: email,
      contactName: contact,
      riskClass,
      notes,
    });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-bold">Lieferant hinzufügen</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. TechParts GmbH"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ansprechpartner</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="z.B. Dr. Anna Weber"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="z.B. security@techparts.de"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Risikoklasse</label>
            <select
              value={riskClass}
              onChange={(e) => setRiskClass(e.target.value as SupplierRiskClass)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="critical">Kritisch — Zugriff auf kritische Systeme/Daten</option>
              <option value="important">Wichtig — Relevanter Zulieferer</option>
              <option value="standard">Standard — Kein IT-Zugriff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Supplier Detail Panel ──────────────────────────────────────────

function SupplierDetailPanel({
  supplier,
  questionsByCategory,
  onClose,
  onUpdate,
}: {
  supplier: Supplier;
  questionsByCategory: Record<string, QuestionnaireQuestion[]>;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [sending, setSending] = useState(false);

  async function handleSendQuestionnaire() {
    setSending(true);
    await sendQuestionnaire(supplier.id);
    onUpdate();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5" /> {supplier.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${riskClassColor(supplier.riskClass)}`}>
                  {RISK_CLASS_LABELS[supplier.riskClass]}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${qStatusColor(supplier.questionnaireStatus)}`}>
                  {QUESTIONNAIRE_STATUS_LABELS[supplier.questionnaireStatus]}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Score */}
          {supplier.riskScore !== null && (
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Sicherheits-Score</p>
              <p className={`text-4xl font-bold ${scoreColor(supplier.riskScore)}`}>
                {supplier.riskScore}/100
              </p>
              <div className="w-full bg-muted rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full ${
                    supplier.riskScore >= 80
                      ? 'bg-green-500'
                      : supplier.riskScore >= 60
                        ? 'bg-yellow-500'
                        : supplier.riskScore >= 40
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                  }`}
                  style={{ width: `${supplier.riskScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Kontaktdaten</h3>
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> {supplier.contactName || '—'}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {supplier.contactEmail || '—'}
              </p>
              {supplier.iso27001CertExpiry && (
                <p className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  ISO 27001 gültig bis {new Date(supplier.iso27001CertExpiry).toLocaleDateString('de-DE')}
                </p>
              )}
              {supplier.notes && (
                <p className="text-muted-foreground">{supplier.notes}</p>
              )}
            </div>
          </div>

          {/* Questionnaire Status */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Sicherheitsfragebogen</h3>
            {supplier.questionnaireStatus === 'not_sent' ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Send className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Fragebogen wurde noch nicht versendet.
                </p>
                <button
                  onClick={handleSendQuestionnaire}
                  disabled={sending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                >
                  {sending ? 'Sende...' : 'Fragebogen senden'}
                </button>
              </div>
            ) : (
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${qStatusColor(supplier.questionnaireStatus)}`}>
                    {QUESTIONNAIRE_STATUS_LABELS[supplier.questionnaireStatus]}
                  </span>
                </p>
                {supplier.questionnaireSentAt && (
                  <p>
                    <strong>Gesendet am:</strong>{' '}
                    {new Date(supplier.questionnaireSentAt).toLocaleDateString('de-DE')}
                  </p>
                )}
                {supplier.questionnaireCompletedAt && (
                  <p>
                    <strong>Abgeschlossen am:</strong>{' '}
                    {new Date(supplier.questionnaireCompletedAt).toLocaleDateString('de-DE')}
                  </p>
                )}
                {supplier.questionnaireToken && (
                  <p>
                    <strong>Portal-Link:</strong>{' '}
                    <code className="bg-muted rounded px-1 text-xs">
                      /lieferant/fragebogen/{supplier.questionnaireToken}
                    </code>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Questionnaire Preview */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Fragebogen-Inhalt ({Object.values(questionsByCategory).flat().length} Fragen)</h3>
            <div className="space-y-3">
              {Object.entries(questionsByCategory).map(([category, questions]) => (
                <div key={category} className="rounded-lg border">
                  <div className="bg-muted/50 px-3 py-2 font-medium text-sm border-b">
                    {category} ({questions.length})
                  </div>
                  <div className="divide-y">
                    {questions.map((q) => (
                      <div key={q.key} className="px-3 py-2 text-sm flex items-start justify-between gap-3">
                        <div>
                          <p>{q.textDe}</p>
                          <p className="text-xs text-muted-foreground italic mt-0.5">{q.textEn}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {Array.from({ length: q.weight }, (_, i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
