'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getVulnerabilities,
  triageVulnerability,
  getVulnerabilityStatistics,
  VULN_STATUS_LABELS,
  type Vulnerability,
  type VulnerabilityStatus,
} from '@/lib/actions/vulnerabilities';
import type { SeverityLevel } from '@schutzkompass/shared';
import {
  Shield,
  AlertTriangle,
  Search,
  X,
  Zap,
  ExternalLink,
} from 'lucide-react';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  info: 'bg-muted text-muted-foreground',
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Gering',
  info: 'Info',
};

const STATUS_COLORS: Record<VulnerabilityStatus, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
  mitigated: 'bg-green-100 text-green-700 dark:bg-green-900/30',
  accepted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30',
  false_positive: 'bg-muted text-muted-foreground',
};

const ALL_STATUSES: VulnerabilityStatus[] = ['open', 'in_progress', 'mitigated', 'accepted', 'false_positive'];
const ALL_SEVERITIES: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'info'];

export default function SchwachstellenPage() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getVulnerabilityStatistics>> | null>(null);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | ''>('');
  const [filterStatus, setFilterStatus] = useState<VulnerabilityStatus | ''>('');
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  const loadData = useCallback(async () => {
    const [v, s] = await Promise.all([
      getVulnerabilities({
        search: search || undefined,
        severity: filterSeverity || undefined,
        status: filterStatus || undefined,
      }),
      getVulnerabilityStatistics(),
    ]);
    setVulns(v);
    setStats(s);
  }, [search, filterSeverity, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schwachstellen-Monitor</h1>
        <p className="text-muted-foreground">
          CVE-Schwachstellen in Ihren Software-Komponenten überwachen und verwalten.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Gesamt</p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Offen (Kritisch)</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{stats.openCritical}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Offen</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stats.byStatus.open}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Exploit verfügbar</p>
            <p className="mt-1 text-2xl font-bold text-destructive flex items-center gap-1">
              {stats.exploitAvailable}
              <Zap className="h-4 w-4" />
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Behoben</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.byStatus.mitigated}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CVE, Komponente suchen..."
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as SeverityLevel | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle Schweregrade</option>
          {ALL_SEVERITIES.map((s) => (
            <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as VulnerabilityStatus | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle Status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{VULN_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Vulnerability Table */}
      {vulns.length > 0 ? (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">CVE</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Titel</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Komponente</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">CVSS</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schwere</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exploit</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vulns.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedVuln(v)}
                  >
                    <td className="px-4 py-2.5 text-sm font-mono font-medium text-primary">{v.cveId}</td>
                    <td className="px-4 py-2.5 text-sm max-w-[250px] truncate">{v.title}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {v.affectedComponent} {v.affectedVersion}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${
                        v.cvssScore >= 9 ? 'bg-red-600 text-white' :
                        v.cvssScore >= 7 ? 'bg-orange-500 text-white' :
                        v.cvssScore >= 4 ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {v.cvssScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SEVERITY_COLORS[v.severity]}`}>
                        {SEVERITY_LABELS[v.severity]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {v.exploitAvailable ? (
                        <span className="text-destructive text-xs font-medium flex items-center justify-center gap-0.5">
                          <Zap className="h-3 w-3" /> Ja
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nein</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[v.status]}`}>
                        {VULN_STATUS_LABELS[v.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Keine Schwachstellen gefunden.</p>
        </div>
      )}

      {/* Triage Detail Panel */}
      {selectedVuln && (
        <VulnTriagePanel
          vuln={selectedVuln}
          onClose={() => setSelectedVuln(null)}
          onTriage={async (input) => {
            await triageVulnerability(input);
            setSelectedVuln(null);
            await loadData();
          }}
        />
      )}
    </div>
  );
}

// ── Vulnerability Triage Panel ─────────────────────────────────────

function VulnTriagePanel({
  vuln,
  onClose,
  onTriage,
}: {
  vuln: Vulnerability;
  onClose: () => void;
  onTriage: (input: { id: string; status: VulnerabilityStatus; assignee?: string; notes?: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState<VulnerabilityStatus>(vuln.status);
  const [assignee, setAssignee] = useState(vuln.assignee || '');
  const [notes, setNotes] = useState(vuln.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onTriage({
      id: vuln.id,
      status,
      assignee: assignee || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-semibold text-primary">{vuln.cveId}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                vuln.cvssScore >= 9 ? 'bg-red-600 text-white' :
                vuln.cvssScore >= 7 ? 'bg-orange-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                CVSS {vuln.cvssScore.toFixed(1)}
              </span>
              {vuln.exploitAvailable && (
                <span className="flex items-center gap-0.5 text-xs text-destructive font-medium">
                  <Zap className="h-3 w-3" /> Exploit
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold">{vuln.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{vuln.description}</p>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Komponente</span>
            <span className="font-medium">{vuln.affectedComponent} {vuln.affectedVersion}</span>
          </div>
          {vuln.fixedVersion && (
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Fix verfügbar in</span>
              <span className="font-medium text-green-600">{vuln.fixedVersion}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Produkt</span>
            <span>{vuln.productName}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Quelle</span>
            <span>{vuln.source.toUpperCase()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Veröffentlicht</span>
            <span>{vuln.publishedDate}</span>
          </div>
        </div>

        <a
          href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-4"
        >
          <ExternalLink className="h-3 w-3" /> In NVD öffnen
        </a>

        <div className="border-t pt-4 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Triage
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VulnerabilityStatus)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{VULN_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Zuständig</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="z.B. Max M."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Bewertung, geplante Maßnahmen..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors">
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Speichern...' : 'Triage speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
