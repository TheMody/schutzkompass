'use server';

import {
  ANNEX_VII_SECTIONS,
  type DocumentType,
  type DocumentStatus,
  type AnnexViiSection,
} from '@/lib/constants/conformity';

// ── Types ──────────────────────────────────────────────────────────

export type { DocumentType, DocumentStatus, AnnexViiSection };

export interface ConformityDocument {
  id: string;
  productId: string;
  productName: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;
  version: string;
  lastUpdated: string;
  createdAt: string;
  author: string;
  sections?: AnnexViiSection[];
}

export interface Evidence {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  tags: string[];
  linkedRequirement: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
}

// ── In-Memory Store ────────────────────────────────────────────────

let documents: ConformityDocument[] = [
  {
    id: 'doc-1',
    productId: 'prod-1',
    productName: 'SmartSensor v3.2',
    type: 'annex_vii_techdoc',
    title: 'Technische Dokumentation – SmartSensor v3.2',
    status: 'in_review',
    version: '0.3',
    lastUpdated: '2026-03-20T14:00:00Z',
    createdAt: '2026-01-15T09:00:00Z',
    author: 'Lisa S.',
    sections: ANNEX_VII_SECTIONS,
  },
  {
    id: 'doc-2',
    productId: 'prod-1',
    productName: 'SmartSensor v3.2',
    type: 'eu_declaration',
    title: 'EU-Konformitätserklärung – SmartSensor v3.2',
    status: 'draft',
    version: '0.1',
    lastUpdated: '2026-03-15T10:00:00Z',
    createdAt: '2026-03-15T10:00:00Z',
    author: 'Max M.',
  },
  {
    id: 'doc-3',
    productId: 'prod-1',
    productName: 'SmartSensor v3.2',
    type: 'module_a_assessment',
    title: 'Modul A Selbstbewertung – SmartSensor v3.2',
    status: 'draft',
    version: '0.1',
    lastUpdated: '2026-03-18T11:00:00Z',
    createdAt: '2026-03-18T11:00:00Z',
    author: 'Lisa S.',
  },
  {
    id: 'doc-4',
    productId: 'prod-2',
    productName: 'IndustrieGateway Pro',
    type: 'annex_vii_techdoc',
    title: 'Technische Dokumentation – IndustrieGateway Pro',
    status: 'draft',
    version: '0.1',
    lastUpdated: '2026-03-22T09:00:00Z',
    createdAt: '2026-03-22T09:00:00Z',
    author: 'Max M.',
    sections: ANNEX_VII_SECTIONS.map((s) => ({ ...s, status: 'empty' as const })),
  },
];

let evidenceItems: Evidence[] = [
  {
    id: 'ev-1',
    title: 'Penetrationstest-Bericht SmartSensor v3.2',
    fileName: 'pentest_smartsensor_v32_2026.pdf',
    fileType: 'application/pdf',
    tags: ['pentest', 'security-test', 'smartsensor'],
    linkedRequirement: 'CRA Art. 13 — Cybersecurity-Tests',
    uploadedBy: 'Lisa S.',
    uploadedAt: '2026-03-10T14:00:00Z',
    version: '1.0',
  },
  {
    id: 'ev-2',
    title: 'SBOM Export SmartSensor v3.2',
    fileName: 'sbom_smartsensor_v32.json',
    fileType: 'application/json',
    tags: ['sbom', 'smartsensor', 'components'],
    linkedRequirement: 'CRA Art. 13 Abs. 5 — SBOM',
    uploadedBy: 'System',
    uploadedAt: '2026-03-15T08:00:00Z',
    version: '3.2',
  },
  {
    id: 'ev-3',
    title: 'ISO 27001 Zertifikat',
    fileName: 'iso27001_cert_2026.pdf',
    fileType: 'application/pdf',
    tags: ['iso27001', 'certification', 'isms'],
    linkedRequirement: 'NIS2 Art. 21 — Risikomanagement',
    uploadedBy: 'Max M.',
    uploadedAt: '2026-02-01T10:00:00Z',
    version: '1.0',
  },
  {
    id: 'ev-4',
    title: 'Schwachstellenscan-Bericht Q1 2026',
    fileName: 'vuln_scan_q1_2026.pdf',
    fileType: 'application/pdf',
    tags: ['vulnerability-scan', 'quarterly'],
    linkedRequirement: 'CRA Annex I — Schwachstellenbehandlung',
    uploadedBy: 'Lisa S.',
    uploadedAt: '2026-03-31T16:00:00Z',
    version: '1.0',
  },
];

// ── Operations ─────────────────────────────────────────────────────

export async function getConformityDocuments(): Promise<ConformityDocument[]> {
  return [...documents].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
}

export async function getConformityDocumentById(id: string): Promise<ConformityDocument | null> {
  return documents.find((d) => d.id === id) ?? null;
}

export async function updateDocumentStatus(id: string, status: DocumentStatus): Promise<ConformityDocument> {
  const idx = documents.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Document not found');
  const updated = {
    ...documents[idx],
    status,
    lastUpdated: new Date().toISOString(),
    version: status === 'approved' ? incrementVersion(documents[idx].version) : documents[idx].version,
  };
  documents = documents.map((d) => (d.id === id ? updated : d));
  return updated;
}

function incrementVersion(v: string): string {
  const parts = v.split('.');
  const minor = parseInt(parts[1] || '0') + 1;
  return `${parts[0]}.${minor}`;
}

export async function getEvidenceItems(): Promise<Evidence[]> {
  return [...evidenceItems].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function getConformityStatistics() {
  const byStatus: Record<DocumentStatus, number> = { draft: 0, in_review: 0, approved: 0, published: 0 };
  const byType: Record<string, number> = {};

  for (const d of documents) {
    byStatus[d.status]++;
    byType[d.type] = (byType[d.type] || 0) + 1;
  }

  // Annex VII completion
  const annexDocs = documents.filter((d) => d.sections);
  let totalSections = 0;
  let completeSections = 0;
  for (const d of annexDocs) {
    if (d.sections) {
      totalSections += d.sections.length;
      completeSections += d.sections.filter((s) => s.status === 'complete').length;
    }
  }

  return {
    totalDocuments: documents.length,
    totalEvidence: evidenceItems.length,
    byStatus,
    byType,
    annexViiProgress: totalSections > 0 ? Math.round((completeSections / totalSections) * 100) : 0,
  };
}
