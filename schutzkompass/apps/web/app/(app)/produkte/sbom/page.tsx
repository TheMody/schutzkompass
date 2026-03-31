'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getSboms,
  getSbomById,
  getSbomComponents,
  getSbomStatistics,
  type SbomRecord,
  type SbomComponent,
  type ComponentStatus,
} from '@/lib/actions/sbom';
import {
  FileText,
  Search,
  Upload,
  Shield,
  AlertTriangle,
  Package,
  X,
  ChevronRight,
  Download,
} from 'lucide-react';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  none: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const SEVERITY_LABELS = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Gering',
  none: 'Keine',
};

const STATUS_LABELS: Record<ComponentStatus, string> = {
  ok: 'OK',
  vulnerable: 'Verwundbar',
  outdated: 'Veraltet',
  unknown: 'Unbekannt',
};

export default function SbomPage() {
  const [sbomList, setSbomList] = useState<Omit<SbomRecord, 'components'>[]>([]);
  const [selectedSbom, setSelectedSbom] = useState<SbomRecord | null>(null);
  const [components, setComponents] = useState<SbomComponent[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getSbomStatistics>> | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComponentStatus | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'vulnerabilityCount'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedComponent, setSelectedComponent] = useState<SbomComponent | null>(null);

  const loadSboms = useCallback(async () => {
    const list = await getSboms();
    setSbomList(list);
    // Auto-select first SBOM if available
    if (list.length > 0 && !selectedSbom) {
      await selectSbom(list[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSboms();
  }, [loadSboms]);

  const selectSbom = async (id: string) => {
    const sbom = await getSbomById(id);
    if (!sbom) return;
    setSelectedSbom(sbom);
    const [comps, s] = await Promise.all([
      getSbomComponents(id, { search, status: filterStatus || undefined, sortBy, sortDir }),
      getSbomStatistics(id),
    ]);
    setComponents(comps);
    setStats(s);
  };

  const refreshComponents = useCallback(async () => {
    if (!selectedSbom) return;
    const comps = await getSbomComponents(selectedSbom.id, {
      search,
      status: filterStatus || undefined,
      sortBy,
      sortDir,
    });
    setComponents(comps);
  }, [selectedSbom, search, filterStatus, sortBy, sortDir]);

  useEffect(() => {
    refreshComponents();
  }, [refreshComponents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SBOM-Manager</h1>
          <p className="text-muted-foreground">
            Software Bill of Materials verwalten, generieren und analysieren.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" />
          SBOM hochladen
        </button>
      </div>

      {/* SBOM Selector */}
      {sbomList.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {sbomList.map((sbom) => (
            <button
              key={sbom.id}
              onClick={() => selectSbom(sbom.id)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors whitespace-nowrap ${
                selectedSbom?.id === sbom.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
            >
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">{sbom.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {sbom.format.toUpperCase()} {sbom.formatVersion} · {sbom.componentCount} Komp.
                  {sbom.vulnerableComponentCount > 0 && (
                    <span className="text-destructive ml-1">
                      · {sbom.vulnerableComponentCount} verwundbar
                    </span>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Komponenten</p>
            <p className="mt-1 text-2xl font-bold">{stats.totalComponents}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Verwundbar</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{stats.vulnerableComponents}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Schwachstellen</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stats.totalVulnerabilities}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Lizenzen</p>
            <p className="mt-1 text-2xl font-bold">
              {Object.keys(stats.licenseDistribution).length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Kritisch/Hoch</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {stats.severityDistribution.critical + stats.severityDistribution.high}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {selectedSbom && (
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Komponente suchen..."
              className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ComponentStatus | '')}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Alle Status</option>
            <option value="vulnerable">Verwundbar</option>
            <option value="ok">OK</option>
            <option value="outdated">Veraltet</option>
          </select>
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-') as ['name' | 'vulnerabilityCount', 'asc' | 'desc'];
              setSortBy(field);
              setSortDir(dir);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="name-asc">Name A→Z</option>
            <option value="name-desc">Name Z→A</option>
            <option value="vulnerabilityCount-desc">Schwachstellen ↓</option>
            <option value="vulnerabilityCount-asc">Schwachstellen ↑</option>
          </select>
          <button
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
            title="SBOM exportieren"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      )}

      {/* Components Table */}
      {components.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Komponente
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Version
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lizenz
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Schwachst.
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {components.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedComponent(comp)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{comp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-mono text-muted-foreground">
                      {comp.version}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{comp.license}</td>
                    <td className="px-4 py-2.5 text-center">
                      {comp.vulnerabilityCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[comp.highestSeverity]}`}
                        >
                          {comp.vulnerabilityCount}
                          <AlertTriangle className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          0 ✓
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          comp.status === 'vulnerable'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : comp.status === 'ok'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {STATUS_LABELS[comp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sbomList.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Noch keine SBOMs vorhanden.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Laden Sie eine SBOM im SPDX- oder CycloneDX-Format hoch, oder generieren Sie eine
            automatisch.
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Upload className="h-4 w-4" />
            Erste SBOM hochladen
          </button>
        </div>
      )}

      {/* Component Detail Panel */}
      {selectedComponent && (
        <ComponentDetailPanel
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}

// ── Component Detail Panel ─────────────────────────────────────────

function ComponentDetailPanel({
  component,
  onClose,
}: {
  component: SbomComponent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-card border-l shadow-xl h-full overflow-y-auto animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{component.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">{component.version}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Lizenz</span>
              <span className="font-medium">{component.license}</span>
            </div>
            {component.purl && (
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">PURL</span>
                <span className="font-mono text-xs break-all text-right max-w-[65%]">
                  {component.purl}
                </span>
              </div>
            )}
            {component.cpe && (
              <div className="py-1.5 border-b">
                <span className="text-muted-foreground block mb-1">CPE</span>
                <span className="font-mono text-xs break-all">{component.cpe}</span>
              </div>
            )}
            {component.supplier && (
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Hersteller</span>
                <span>{component.supplier}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  component.status === 'vulnerable'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {STATUS_LABELS[component.status]}
              </span>
            </div>
          </div>

          {/* Vulnerabilities */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              Schwachstellen ({component.vulnerabilityCount})
            </h3>
            {component.vulnerabilityCount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Höchste Schwere:</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[component.highestSeverity]}`}
                  >
                    {SEVERITY_LABELS[component.highestSeverity]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Die detaillierte Schwachstellenansicht mit CVE-Informationen, CVSS-Scores und
                  Triage-Workflow finden Sie im{' '}
                  <a href="/produkte/schwachstellen" className="text-primary hover:underline">
                    Schwachstellen-Monitor
                  </a>
                  .
                </p>
              </div>
            ) : (
              <p className="text-sm text-green-600">
                ✓ Keine bekannten Schwachstellen für diese Komponente.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors text-left">
              🔍 In NVD nachschlagen
            </button>
            <button className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors text-left">
              📋 Zu Schwachstellen-Monitor hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
