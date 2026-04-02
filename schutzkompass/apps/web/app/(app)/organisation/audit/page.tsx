'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getEvidenceItems,
  getConformityDocuments,
  type Evidence,
  type ConformityDocument,
} from '@/lib/actions/conformity';
import { DOCUMENT_STATUS_LABELS } from '@/lib/constants/conformity';
import {
  Search,
  Download,
  Tag,
  File,
  Shield,
  CheckCircle2,
  Clock,
  Eye,
  Upload,
} from 'lucide-react';
import { Pagination, usePagination } from '@/components/shared/pagination';

export default function AuditNachweisePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [documents, setDocuments] = useState<ConformityDocument[]>([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [ev, docs] = await Promise.all([getEvidenceItems(), getConformityDocuments()]);
    setEvidence(ev);
    setDocuments(docs);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allTags = [...new Set(evidence.flatMap((e) => e.tags))].sort();

  const filtered = evidence.filter((e) => {
    if (filterTag && !e.tags.includes(filterTag)) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.linkedRequirement.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { paginatedItems: paginatedEvidence, paginationProps } = usePagination(filtered, 10);

  // Compliance readiness check
  const requiredDocs = ['annex_vii_techdoc', 'eu_declaration', 'module_a_assessment'];
  const readinessItems = requiredDocs.map((type) => {
    const doc = documents.find((d) => d.type === type);
    return {
      type,
      label: type === 'annex_vii_techdoc' ? 'Technische Dokumentation (Annex VII)' :
             type === 'eu_declaration' ? 'EU-Konformitätserklärung' :
             'Modul A Selbstbewertung',
      status: doc ? doc.status : 'missing',
      doc,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit & Nachweise</h1>
          <p className="text-muted-foreground">
            Nachweise verwalten, Audit-Bereitschaft prüfen und Auditor-Ansicht vorbereiten.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80">
          <Upload className="h-4 w-4" /> Nachweis hochladen
        </button>
      </div>

      {/* Audit Readiness */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" /> Audit-Bereitschaft
          </h2>
        </div>
        <div className="p-4 space-y-3">
          {readinessItems.map((item) => (
            <div key={item.type} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                {item.status === 'approved' || item.status === 'published' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : item.status === 'missing' ? (
                  <div className="h-5 w-5 rounded-full border-2 border-red-300" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-500" />
                )}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                item.status === 'missing' ? 'bg-red-100 text-red-700' :
                item.status === 'approved' || item.status === 'published' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {item.status === 'missing' ? 'Fehlt' : DOCUMENT_STATUS_LABELS[item.status as keyof typeof DOCUMENT_STATUS_LABELS]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Auditor Portal Preview */}
      <div className="rounded-lg border border-dashed bg-muted/50 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-sm">Auditor-Portal</h3>
            <p className="text-xs text-muted-foreground">
              Teilen Sie einen schreibgeschützten Zugang mit Ihrem Auditor.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value="https://app.schutzkompass.de/auditor/abc123..."
            className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground"
          />
          <button className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            Link kopieren
          </button>
        </div>
      </div>

      {/* Evidence Repository */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Nachweisablage</h2>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nachweise suchen..."
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterTag(null)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                filterTag === null ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Alle
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                  filterTag === tag ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Keine Nachweise gefunden.
            </div>
          ) : (
            paginatedEvidence.map((ev) => (
              <div key={ev.id} className="rounded-lg border bg-card p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 min-w-0">
                  <File className="h-8 w-8 text-muted-foreground/50 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{ev.fileName}</span>
                      <span>v{ev.version}</span>
                      <span>{new Date(ev.uploadedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        {ev.linkedRequirement}
                      </span>
                      {ev.tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          <Tag className="h-2 w-2" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="shrink-0 text-muted-foreground hover:text-foreground p-2">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <Pagination {...paginationProps} />
      </div>
    </div>
  );
}
