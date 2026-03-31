'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getPolicies,
  getPolicyCategories,
  type PolicyTemplate,
  type PolicyCategory,
  type PolicyCategoryInfo,
} from '@/lib/actions/policies';
import {
  FileText,
  Shield,
  AlertTriangle,
  Bell,
  RefreshCw,
  Link2,
  Server,
  Package,
  Download,
  Eye,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Printer,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  governance: Shield,
  risk: AlertTriangle,
  incident: Bell,
  continuity: RefreshCw,
  supply_chain: Link2,
  technical: Server,
  cra: Package,
};

export default function RichtlinienPage() {
  const [policies, setPolicies] = useState<PolicyTemplate[]>([]);
  const [categories, setCategories] = useState<Record<PolicyCategory, PolicyCategoryInfo> | null>(
    null,
  );
  const [filterCategory, setFilterCategory] = useState<PolicyCategory | ''>('');
  const [search, setSearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyTemplate | null>(null);

  const loadData = useCallback(async () => {
    const [p, c] = await Promise.all([getPolicies(), getPolicyCategories()]);
    setPolicies(p);
    setCategories(c);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = policies.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Group by category
  const grouped = new Map<PolicyCategory, PolicyTemplate[]>();
  for (const p of filtered) {
    if (!grouped.has(p.category)) grouped.set(p.category, []);
    grouped.get(p.category)!.push(p);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Richtlinien-Bibliothek</h1>
        <p className="text-muted-foreground">
          NIS2- und CRA-konforme Richtlinienvorlagen zum Anpassen und Herunterladen.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Gesamt</p>
          <p className="mt-1 text-2xl font-bold">{policies.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">NIS2-Richtlinien</p>
          <p className="mt-1 text-2xl font-bold">{policies.filter((p) => p.nis2Article).length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">CRA-Richtlinien</p>
          <p className="mt-1 text-2xl font-bold">
            {policies.filter((p) => p.category === 'cra').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Kategorien</p>
          <p className="mt-1 text-2xl font-bold">{categories ? Object.keys(categories).length : 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Richtlinie suchen..."
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as PolicyCategory | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle Kategorien</option>
          {categories &&
            Object.entries(categories).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
        </select>
      </div>

      {/* Policy Cards grouped by category */}
      <div className="space-y-6">
        {[...grouped.entries()].map(([category, catPolicies]) => {
          const catInfo = categories?.[category];
          const CatIcon = CATEGORY_ICONS[category] || FileText;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">{catInfo?.label || category}</h2>
                <span className="text-xs text-muted-foreground">({catPolicies.length})</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-[10px] text-muted-foreground">v{policy.version}</span>
                    </div>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-1">{policy.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {policy.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {policy.nis2Article && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {policy.nis2Article}
                          </span>
                        )}
                        {policy.bsiReference && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            BSI {policy.bsiReference}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{policy.pages} Seiten</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Keine Richtlinien gefunden.</p>
        </div>
      )}

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <PolicyDetailModal
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </div>
  );
}

// ── Policy Detail Modal ────────────────────────────────────────────

function PolicyDetailModal({
  policy,
  onClose,
}: {
  policy: PolicyTemplate;
  onClose: () => void;
}) {
  const [viewMode, setViewMode] = useState<'info' | 'preview'>('info');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(policy.sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const handleDownload = () => {
    // Generate Markdown content
    let md = `# ${policy.title}\n\n`;
    md += `**${policy.titleEn}**\n\n`;
    md += `---\n\n`;
    md += `| Eigenschaft | Wert |\n`;
    md += `|---|---|\n`;
    md += `| Version | ${policy.version} |\n`;
    if (policy.nis2Article) md += `| NIS2-Artikel | ${policy.nis2Article} |\n`;
    if (policy.bsiReference) md += `| BSI-Referenz | ${policy.bsiReference} |\n`;
    md += `| Seiten | ${policy.pages} |\n`;
    md += `| Stand | ${policy.lastUpdated} |\n`;
    md += `| Sprache | ${policy.language === 'de' ? 'Deutsch' : policy.language} |\n`;
    md += `| Tags | ${policy.tags.join(', ')} |\n`;
    md += `\n---\n\n`;
    md += `${policy.description}\n\n`;

    for (const section of policy.sections) {
      md += `## ${section.heading}\n\n`;
      md += `${section.body}\n\n`;
    }

    md += `---\n\n`;
    md += `*Dieses Dokument wurde mit SchutzKompass erstellt und dient als Vorlage. Es muss an die spezifischen Gegebenheiten Ihrer Organisation angepasst werden.*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-xl border bg-card p-0 shadow-xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">{policy.title}</h2>
              <p className="text-xs text-muted-foreground">{policy.titleEn}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border overflow-hidden text-sm">
              <button
                onClick={() => setViewMode('info')}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${viewMode === 'info' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Eye className="h-3.5 w-3.5" />
                Info
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Dokument
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'info' ? (
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">{policy.description}</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{policy.version}</span>
                </div>
                {policy.nis2Article && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">NIS2-Artikel</span>
                    <span className="font-medium">{policy.nis2Article}</span>
                  </div>
                )}
                {policy.bsiReference && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">BSI-Referenz</span>
                    <span className="font-medium">{policy.bsiReference}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Seiten</span>
                  <span className="font-medium">{policy.pages}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Aktualisiert</span>
                  <span className="font-medium">{policy.lastUpdated}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Abschnitte</span>
                  <span className="font-medium">{policy.sections.length}</span>
                </div>
                <div className="py-2 border-b">
                  <span className="text-muted-foreground">Tags</span>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {policy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table of Contents */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Inhaltsverzeichnis</h3>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  {policy.sections.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setViewMode('preview');
                        setExpandedSections(new Set([idx]));
                      }}
                      className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{section.heading}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Document preview header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Alle aufklappen
                  </button>
                  <span className="text-muted-foreground text-xs">|</span>
                  <button
                    onClick={collapseAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Alle zuklappen
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {policy.sections.length} Abschnitte
                </span>
              </div>

              {/* Document title block */}
              <div className="mb-6 p-4 rounded-lg border bg-muted/30 text-center">
                <h2 className="text-xl font-bold mb-1">{policy.title}</h2>
                <p className="text-sm text-muted-foreground">{policy.titleEn}</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Version {policy.version}</span>
                  <span>•</span>
                  <span>Stand: {policy.lastUpdated}</span>
                  {policy.nis2Article && (
                    <>
                      <span>•</span>
                      <span>{policy.nis2Article}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Document sections */}
              <div className="space-y-2">
                {policy.sections.map((section, idx) => {
                  const isExpanded = expandedSections.has(idx);
                  return (
                    <div key={idx} className="rounded-lg border overflow-hidden">
                      <button
                        onClick={() => toggleSection(idx)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm font-semibold">{section.heading}</span>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-l-2 border-primary/20 pl-4">
                            {section.body.split('\n').map((line, lineIdx) => {
                              if (!line.trim()) return <div key={lineIdx} className="h-3" />;
                              if (line.startsWith('•')) {
                                return (
                                  <p key={lineIdx} className="text-sm text-foreground/90 pl-2 py-0.5 flex">
                                    <span className="text-primary mr-2 shrink-0">•</span>
                                    <span>{line.slice(1).trim()}</span>
                                  </p>
                                );
                              }
                              if (/^\d+\.\d+\s/.test(line) || /^[A-Z].*:$/.test(line.trim())) {
                                return (
                                  <p key={lineIdx} className="text-sm font-semibold mt-2 mb-1">
                                    {line}
                                  </p>
                                );
                              }
                              // Lines starting with "  —" are sub-bullets
                              if (line.trim().startsWith('—') || line.trim().startsWith('- ')) {
                                return (
                                  <p key={lineIdx} className="text-sm text-foreground/80 pl-6 py-0.5 flex">
                                    <span className="text-muted-foreground mr-2 shrink-0">–</span>
                                    <span>{line.replace(/^\s*[—-]\s*/, '')}</span>
                                  </p>
                                );
                              }
                              return (
                                <p key={lineIdx} className="text-sm text-foreground/90 py-0.5">
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t shrink-0">
          <button
            onClick={() => {
              setViewMode('preview');
              expandAll();
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" />
            Vollansicht
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Als Markdown herunterladen
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center pb-3 px-6">
          Die Vorlage dient als Ausgangspunkt und muss an die spezifischen Gegebenheiten Ihrer Organisation angepasst werden.
        </p>
      </div>
    </div>
  );
}
