'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getConformityDocuments,
  getConformityStatistics,
  getEvidenceItems,
  updateDocumentStatus,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  type ConformityDocument,
  type DocumentStatus,
  type Evidence,
} from '@/lib/actions/conformity';
import {
  Award,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
  Shield,
  ClipboardList,
  Tag,
  File,
  Search,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────

function statusColor(s: DocumentStatus) {
  return {
    draft: 'bg-muted text-muted-foreground',
    in_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    published: 'bg-purple-100 text-purple-700',
  }[s];
}

function sectionStatusIcon(s: string) {
  return {
    complete: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    partial: <Clock className="h-4 w-4 text-orange-500" />,
    empty: <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />,
  }[s] || null;
}

// ── Page ───────────────────────────────────────────────────────────

export default function KonformitaetPage() {
  const [documents, setDocuments] = useState<ConformityDocument[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getConformityStatistics>> | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ConformityDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'evidence'>('documents');
  const [searchEvidence, setSearchEvidence] = useState('');

  const load = useCallback(async () => {
    const [docs, ev, st] = await Promise.all([
      getConformityDocuments(),
      getEvidenceItems(),
      getConformityStatistics(),
    ]);
    setDocuments(docs);
    setEvidence(ev);
    setStats(st);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredEvidence = evidence.filter(
    (e) =>
      !searchEvidence ||
      e.title.toLowerCase().includes(searchEvidence.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(searchEvidence.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Konformitäts-Dokumentation</h1>
        <p className="text-muted-foreground">
          CRA-konforme technische Dokumentation, EU-Konformitätserklärungen und Nachweismanagement.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <FileText className="h-4 w-4" /> Dokumente
            </div>
            <p className="text-2xl font-bold">{stats.totalDocuments}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Upload className="h-4 w-4" /> Nachweise
            </div>
            <p className="text-2xl font-bold">{stats.totalEvidence}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Freigegeben
            </div>
            <p className="text-2xl font-bold">{stats.byStatus.approved + stats.byStatus.published}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4 text-orange-500" /> In Arbeit
            </div>
            <p className="text-2xl font-bold">{stats.byStatus.draft + stats.byStatus.in_review}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Shield className="h-4 w-4 text-blue-500" /> Annex VII
            </div>
            <p className="text-2xl font-bold">{stats.annexViiProgress}%</p>
          </div>
        </div>
      )}

      {/* CRA Conformity Pathway Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-green-50 p-4">
          <h3 className="font-semibold text-green-900 flex items-center gap-2 mb-2">
            <Award className="h-4 w-4" /> Modul A — Selbstbewertung
          </h3>
          <p className="text-sm text-green-800">
            Interne Konformitätskontrolle für Standard-Produkte. Hersteller bewertet selbst.
          </p>
        </div>
        <div className="rounded-lg border bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
            <ClipboardList className="h-4 w-4" /> Modul B+C — EU-Baumusterprüfung
          </h3>
          <p className="text-sm text-blue-800">
            Für wichtige Produkte (Klasse I/II). Erfordert notifizierte Stelle.
          </p>
        </div>
        <div className="rounded-lg border bg-purple-50 p-4">
          <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" /> Modul H — Umfassendes QM
          </h3>
          <p className="text-sm text-purple-800">
            Für kritische Produkte. Vollständiges Qualitätsmanagementsystem erforderlich.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documents' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Dokumente ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'evidence' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Nachweise ({evidence.length})
          </button>
        </div>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="w-full text-left rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{doc.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(doc.status)}`}>
                      {DOCUMENT_STATUS_LABELS[doc.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                    <span>v{doc.version}</span>
                    <span>Produkt: {doc.productName}</span>
                    <span>Autor: {doc.author}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.sections && (
                    <span className="text-xs text-muted-foreground">
                      {doc.sections.filter((s) => s.status === 'complete').length}/{doc.sections.length} Abschnitte
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchEvidence}
                onChange={(e) => setSearchEvidence(e.target.value)}
                placeholder="Nachweise suchen (Name, Tag)..."
                className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f]">
              <Upload className="h-4 w-4" /> Nachweis hochladen
            </button>
          </div>

          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium">Nachweis</th>
                  <th className="px-4 py-3 font-medium">Anforderung</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Hochgeladen</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidence.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      Keine Nachweise gefunden.
                    </td>
                  </tr>
                ) : (
                  filteredEvidence.map((ev) => (
                    <tr key={ev.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{ev.title}</p>
                            <p className="text-xs text-muted-foreground">{ev.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{ev.linkedRequirement}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {ev.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              <Tag className="h-2.5 w-2.5" /> {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">v{ev.version}</td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(ev.uploadedAt).toLocaleDateString('de-DE')}
                        <br />
                        <span className="text-muted-foreground">{ev.uploadedBy}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Detail Panel */}
      {selectedDoc && (
        <DocumentDetailPanel
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onUpdate={(updated) => {
            setSelectedDoc(updated);
            load();
          }}
        />
      )}
    </div>
  );
}

// ── Document Detail Panel ──────────────────────────────────────────

function DocumentDetailPanel({
  document: doc,
  onClose,
  onUpdate,
}: {
  document: ConformityDocument;
  onClose: () => void;
  onUpdate: (doc: ConformityDocument) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const statusFlow: DocumentStatus[] = ['draft', 'in_review', 'approved', 'published'];
  const currentIdx = statusFlow.indexOf(doc.status);

  async function advanceStatus() {
    if (currentIdx >= statusFlow.length - 1) return;
    setUpdating(true);
    const next = statusFlow[currentIdx + 1];
    const updated = await updateDocumentStatus(doc.id, next);
    onUpdate(updated);
    setUpdating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{doc.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(doc.status)}`}>
                  {DOCUMENT_STATUS_LABELS[doc.status]}
                </span>
                <span className="text-xs text-muted-foreground">v{doc.version}</span>
                <span className="text-xs text-muted-foreground">Produkt: {doc.productName}</span>
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
            <h3 className="text-sm font-semibold mb-3">Dokumenten-Workflow</h3>
            <div className="flex items-center gap-1">
              {statusFlow.map((s, idx) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap ${
                      idx <= currentIdx
                        ? idx === currentIdx
                          ? 'bg-[#1e3a5f] text-white'
                          : 'bg-green-100 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx < currentIdx && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                    {DOCUMENT_STATUS_LABELS[s]}
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
                disabled={updating}
                className="mt-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f] disabled:opacity-50"
              >
                → {DOCUMENT_STATUS_LABELS[statusFlow[currentIdx + 1]]}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Details</h3>
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <p><strong>Typ:</strong> {DOCUMENT_TYPE_LABELS[doc.type]}</p>
              <p><strong>Autor:</strong> {doc.author}</p>
              <p><strong>Erstellt:</strong> {new Date(doc.createdAt).toLocaleDateString('de-DE')}</p>
              <p><strong>Zuletzt aktualisiert:</strong> {new Date(doc.lastUpdated).toLocaleDateString('de-DE')}</p>
            </div>
          </div>

          {/* Annex VII Sections */}
          {doc.sections && (
            <div>
              <h3 className="text-sm font-semibold mb-2">
                CRA Annex VII — Technische Dokumentation
              </h3>
              <div className="rounded-lg border divide-y">
                {doc.sections.map((section) => (
                  <div key={section.id} className="p-3">
                    <div className="flex items-start gap-2">
                      {sectionStatusIcon(section.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {section.requiredFields.map((field) => (
                            <span
                              key={field}
                              className={`rounded px-1.5 py-0.5 text-[10px] ${
                                section.status === 'complete'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Fortschritt</span>
                  <span>
                    {doc.sections.filter((s) => s.status === 'complete').length}/
                    {doc.sections.length} Abschnitte
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(doc.sections.filter((s) => s.status === 'complete').length / doc.sections.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* EU Declaration Template */}
          {doc.type === 'eu_declaration' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">EU-Konformitätserklärung Vorlage</h3>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm font-mono space-y-2">
                <p className="font-bold text-center">EU-KONFORMITÄTSERKLÄRUNG</p>
                <p className="text-center text-xs">gemäß Cyber Resilience Act (EU) 2024/2847</p>
                <p className="mt-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                <p>1. Produkt: {doc.productName}</p>
                <p>2. Hersteller: [Organisationsname]</p>
                <p>3. Diese Konformitätserklärung wird unter</p>
                <p>   alleiniger Verantwortung des Herstellers ausgestellt.</p>
                <p>4. Gegenstand der Erklärung: [Produktbeschreibung]</p>
                <p>5. Der oben beschriebene Gegenstand der Erklärung</p>
                <p>   erfüllt die Anforderungen des CRA.</p>
                <p>6. Angewandte Normen: [EN-Normen]</p>
                <p>7. Konformitätsbewertungsverfahren: Modul A</p>
                <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                <p>Ort, Datum: ____________</p>
                <p>Unterschrift: ____________</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
