'use server';

import { db, vulnerabilities as vulnTable, products as productsTable, sbomComponents } from '@schutzkompass/db';
import { eq } from 'drizzle-orm';
import { getOrgId } from './helpers';
import type { SeverityLevel } from '@schutzkompass/shared';
import type { VulnerabilityStatus } from '@/lib/constants/vulnerabilities';

// ── Types ──────────────────────────────────────────────────────────

export type { VulnerabilityStatus };
export type VulnerabilitySource = 'nvd' | 'osv' | 'manual';

export interface Vulnerability {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  cvssScore: number;
  cvssVector?: string;
  affectedComponent: string;
  affectedVersion: string;
  fixedVersion?: string;
  productId: string;
  productName: string;
  source: VulnerabilitySource;
  status: VulnerabilityStatus;
  exploitAvailable: boolean;
  publishedDate: string;
  lastModified: string;
  assignee?: string;
  notes?: string;
}

export interface VulnerabilityTriageInput {
  id: string;
  status: VulnerabilityStatus;
  assignee?: string;
  notes?: string;
}

// ── Mapper ─────────────────────────────────────────────────────────

async function mapRow(row: typeof vulnTable.$inferSelect): Promise<Vulnerability> {
  // Fetch product name
  let productName = '';
  const [product] = await db
    .select({ name: productsTable.name })
    .from(productsTable)
    .where(eq(productsTable.id, row.productId))
    .limit(1);
  if (product) productName = product.name;

  // Fetch component info
  let componentName = '';
  let componentVersion = '';
  const [comp] = await db
    .select({ name: sbomComponents.name, version: sbomComponents.version })
    .from(sbomComponents)
    .where(eq(sbomComponents.id, row.componentId))
    .limit(1);
  if (comp) {
    componentName = comp.name;
    componentVersion = comp.version ?? '';
  }

  return {
    id: row.id,
    cveId: row.cveId ?? '',
    title: row.cveId ?? 'Vulnerability',
    description: row.description ?? '',
    severity: (row.severity ?? 'medium') as SeverityLevel,
    cvssScore: row.cvssScore ? parseFloat(row.cvssScore) : 0,
    affectedComponent: componentName,
    affectedVersion: componentVersion,
    fixedVersion: row.targetFixVersion ?? undefined,
    productId: row.productId,
    productName,
    source: 'nvd',
    status: row.status as VulnerabilityStatus,
    exploitAvailable: row.exploitAvailable ?? false,
    publishedDate: row.firstDetectedAt?.toISOString().slice(0, 10) ?? '',
    lastModified: row.createdAt.toISOString().slice(0, 10),
    assignee: undefined, // TODO: join users table for assignedTo
    notes: row.acceptedJustification ?? undefined,
  };
}

// ── Operations ─────────────────────────────────────────────────────

export async function getVulnerabilities(options?: {
  productId?: string;
  severity?: SeverityLevel;
  status?: VulnerabilityStatus;
  search?: string;
}): Promise<Vulnerability[]> {
  const orgId = await getOrgId();

  const rows = await db
    .select()
    .from(vulnTable)
    .where(eq(vulnTable.organisationId, orgId));

  let results: Vulnerability[] = [];
  for (const row of rows) {
    results.push(await mapRow(row));
  }

  if (options?.productId) {
    results = results.filter((v) => v.productId === options.productId);
  }
  if (options?.severity) {
    results = results.filter((v) => v.severity === options.severity);
  }
  if (options?.status) {
    results = results.filter((v) => v.status === options.status);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    results = results.filter(
      (v) =>
        v.cveId.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.affectedComponent.toLowerCase().includes(q),
    );
  }

  results.sort((a, b) => b.cvssScore - a.cvssScore);
  return results;
}

export async function getVulnerabilityById(id: string): Promise<Vulnerability | null> {
  const [row] = await db
    .select()
    .from(vulnTable)
    .where(eq(vulnTable.id, id))
    .limit(1);

  if (!row) return null;
  return mapRow(row);
}

export async function triageVulnerability(input: VulnerabilityTriageInput): Promise<Vulnerability> {
  const updates: Record<string, unknown> = {
    status: input.status,
  };
  if (input.notes !== undefined) updates.acceptedJustification = input.notes;
  if (input.status === 'mitigated' || input.status === 'false_positive') {
    updates.resolvedAt = new Date();
  }

  await db.update(vulnTable).set(updates).where(eq(vulnTable.id, input.id));

  const result = await getVulnerabilityById(input.id);
  if (!result) throw new Error('Vulnerability not found');
  return result;
}

export async function getVulnerabilityStatistics(productId?: string) {
  const orgId = await getOrgId();

  let rows = await db
    .select()
    .from(vulnTable)
    .where(eq(vulnTable.organisationId, orgId));

  if (productId) {
    rows = rows.filter((r) => r.productId === productId);
  }

  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const byStatus: Record<VulnerabilityStatus, number> = {
    open: 0,
    in_progress: 0,
    mitigated: 0,
    accepted: 0,
    false_positive: 0,
  };

  let exploitCount = 0;

  for (const row of rows) {
    const sev = (row.severity ?? 'medium') as string;
    if (sev in bySeverity) (bySeverity as Record<string, number>)[sev]++;
    const st = row.status as VulnerabilityStatus;
    if (byStatus[st] !== undefined) byStatus[st]++;
    if (row.exploitAvailable) exploitCount++;
  }

  return {
    total: rows.length,
    bySeverity,
    byStatus,
    exploitAvailable: exploitCount,
    openCritical: rows.filter((r) => r.severity === 'critical' && r.status === 'open').length,
  };
}
