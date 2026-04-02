'use server';

import { db, conformityDocuments as docsTable } from '@schutzkompass/db';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from './helpers';
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

// ── Mapper ─────────────────────────────────────────────────────────

function mapRow(row: typeof docsTable.$inferSelect): ConformityDocument {
  // Parse structured content for sections
  let sections: AnnexViiSection[] | undefined;
  if (row.content) {
    try {
      const parsed = JSON.parse(row.content);
      if (parsed.sections) sections = parsed.sections;
    } catch {
      // not JSON, skip
    }
  }
  // For annex_vii type, default to template sections
  if (!sections && (row.type === 'annex_vii_techdoc' || row.type === 'annex_vii' || row.type === 'technical_documentation')) {
    sections = ANNEX_VII_SECTIONS;
  }

  return {
    id: row.id,
    productId: row.productId,
    productName: '', // will be filled in operations
    type: row.type as DocumentType,
    title: row.title,
    status: row.status as DocumentStatus,
    version: row.version ?? '0.1',
    lastUpdated: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    author: '', // TODO: join users table for approvedBy
    sections,
  };
}

function incrementVersion(v: string): string {
  const parts = v.split('.');
  const minor = parseInt(parts[1] || '0') + 1;
  return `${parts[0]}.${minor}`;
}

// ── Operations ─────────────────────────────────────────────────────

export async function getConformityDocuments(): Promise<ConformityDocument[]> {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(docsTable)
    .where(eq(docsTable.organisationId, orgId))
    .orderBy(desc(docsTable.updatedAt));

  return rows.map(mapRow);
}

export async function getConformityDocumentById(id: string): Promise<ConformityDocument | null> {
  const [row] = await db
    .select()
    .from(docsTable)
    .where(eq(docsTable.id, id))
    .limit(1);

  return row ? mapRow(row) : null;
}

export async function updateDocumentStatus(id: string, status: DocumentStatus): Promise<ConformityDocument> {
  const [existing] = await db
    .select()
    .from(docsTable)
    .where(eq(docsTable.id, id))
    .limit(1);

  if (!existing) throw new Error('Document not found');

  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'approved') {
    updates.version = incrementVersion(existing.version ?? '0.1');
    updates.approvedAt = new Date();
  }

  await db.update(docsTable).set(updates).where(eq(docsTable.id, id));

  const result = await getConformityDocumentById(id);
  if (!result) throw new Error('Document not found');
  return result;
}

export async function getEvidenceItems(): Promise<Evidence[]> {
  // Evidence items are not stored in a separate DB table yet.
  // Return empty array — evidence upload via MinIO to be implemented.
  return [];
}

export async function getConformityStatistics() {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(docsTable)
    .where(eq(docsTable.organisationId, orgId));

  const docs = rows.map(mapRow);

  const byStatus: Record<DocumentStatus, number> = { draft: 0, in_review: 0, approved: 0, published: 0 };
  const byType: Record<string, number> = {};

  for (const d of docs) {
    if (byStatus[d.status] !== undefined) byStatus[d.status]++;
    byType[d.type] = (byType[d.type] || 0) + 1;
  }

  // Annex VII completion
  const annexDocs = docs.filter((d) => d.sections);
  let totalSections = 0;
  let completeSections = 0;
  for (const d of annexDocs) {
    if (d.sections) {
      totalSections += d.sections.length;
      completeSections += d.sections.filter((s) => s.status === 'complete').length;
    }
  }

  return {
    totalDocuments: docs.length,
    totalEvidence: 0,
    byStatus,
    byType,
    annexViiProgress: totalSections > 0 ? Math.round((completeSections / totalSections) * 100) : 0,
  };
}
