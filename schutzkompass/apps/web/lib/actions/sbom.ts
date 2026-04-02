'use server';

import { db, sboms as sbomsTable, sbomComponents as componentsTable, products as productsTable } from '@schutzkompass/db';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from './helpers';

// ── Types ──────────────────────────────────────────────────────────

export type SbomFormat = 'spdx' | 'cyclonedx';
export type ComponentStatus = 'ok' | 'vulnerable' | 'outdated' | 'unknown';

export interface SbomComponent {
  id: string;
  name: string;
  version: string;
  license: string;
  purl?: string;
  cpe?: string;
  supplier?: string;
  vulnerabilityCount: number;
  highestSeverity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  status: ComponentStatus;
}

export interface SbomRecord {
  id: string;
  productId: string;
  productName: string;
  format: SbomFormat;
  formatVersion: string;
  componentCount: number;
  vulnerableComponentCount: number;
  createdAt: string;
  generatedBy: 'upload' | 'syft';
  components: SbomComponent[];
}

export interface SbomUploadInput {
  productId: string;
  productName: string;
  format: SbomFormat;
}

// ── Mapper ─────────────────────────────────────────────────────────

function mapComponentRow(row: typeof componentsTable.$inferSelect): SbomComponent {
  return {
    id: row.id,
    name: row.name,
    version: row.version ?? '',
    license: row.license ?? '',
    purl: row.purl ?? undefined,
    cpe: row.cpe ?? undefined,
    supplier: row.supplier ?? undefined,
    vulnerabilityCount: 0, // TODO: join vulnerabilities table
    highestSeverity: 'none',
    status: 'ok',
  };
}

async function mapSbomRow(
  row: typeof sbomsTable.$inferSelect,
  includeComponents: boolean,
): Promise<SbomRecord> {
  // Fetch product name
  let productName = '';
  const [product] = await db
    .select({ name: productsTable.name })
    .from(productsTable)
    .where(eq(productsTable.id, row.productId))
    .limit(1);
  if (product) productName = product.name;

  let components: SbomComponent[] = [];
  if (includeComponents) {
    const compRows = await db
      .select()
      .from(componentsTable)
      .where(eq(componentsTable.sbomId, row.id));
    components = compRows.map(mapComponentRow);
  }

  const vulnerableCount = components.filter((c) => c.vulnerabilityCount > 0).length;

  return {
    id: row.id,
    productId: row.productId,
    productName,
    format: row.format as SbomFormat,
    formatVersion: row.format === 'cyclonedx' ? '1.5' : '2.3',
    componentCount: row.componentCount ?? components.length,
    vulnerableComponentCount: vulnerableCount,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    generatedBy: row.source === 'uploaded' ? 'upload' : 'syft',
    components,
  };
}

// ── Operations ─────────────────────────────────────────────────────

export async function getSboms(): Promise<Omit<SbomRecord, 'components'>[]> {
  const orgId = await getOrgId();

  // Get product IDs belonging to this org
  const orgProducts = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.organisationId, orgId));
  const productIds = orgProducts.map((p) => p.id);

  if (productIds.length === 0) return [];

  const rows = await db
    .select()
    .from(sbomsTable)
    .orderBy(desc(sbomsTable.createdAt));

  // Filter by product ownership
  const filtered = rows.filter((r) => productIds.includes(r.productId));

  const result: Omit<SbomRecord, 'components'>[] = [];
  for (const row of filtered) {
    const full = await mapSbomRow(row, false);
    const { components: _c, ...rest } = full;
    result.push(rest);
  }
  return result;
}

export async function getSbomById(id: string): Promise<SbomRecord | null> {
  const [row] = await db
    .select()
    .from(sbomsTable)
    .where(eq(sbomsTable.id, id))
    .limit(1);

  if (!row) return null;
  return mapSbomRow(row, true);
}

export async function getSbomsByProduct(productId: string): Promise<Omit<SbomRecord, 'components'>[]> {
  const rows = await db
    .select()
    .from(sbomsTable)
    .where(eq(sbomsTable.productId, productId))
    .orderBy(desc(sbomsTable.createdAt));

  const result: Omit<SbomRecord, 'components'>[] = [];
  for (const row of rows) {
    const full = await mapSbomRow(row, false);
    const { components: _c, ...rest } = full;
    result.push(rest);
  }
  return result;
}

export async function getSbomComponents(
  sbomId: string,
  options?: {
    search?: string;
    status?: ComponentStatus;
    sortBy?: 'name' | 'vulnerabilityCount' | 'version';
    sortDir?: 'asc' | 'desc';
  },
): Promise<SbomComponent[]> {
  const compRows = await db
    .select()
    .from(componentsTable)
    .where(eq(componentsTable.sbomId, sbomId));

  let components = compRows.map(mapComponentRow);

  if (options?.search) {
    const q = options.search.toLowerCase();
    components = components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.license.toLowerCase().includes(q) ||
        c.purl?.toLowerCase().includes(q),
    );
  }
  if (options?.status) {
    components = components.filter((c) => c.status === options.status);
  }

  const sortBy = options?.sortBy || 'name';
  const sortDir = options?.sortDir || 'asc';
  components.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'vulnerabilityCount') cmp = a.vulnerabilityCount - b.vulnerabilityCount;
    else if (sortBy === 'version') cmp = a.version.localeCompare(b.version);
    return sortDir === 'desc' ? -cmp : cmp;
  });

  return components;
}

export async function uploadSbom(input: SbomUploadInput): Promise<SbomRecord> {
  const [row] = await db
    .insert(sbomsTable)
    .values({
      productId: input.productId,
      format: input.format,
      source: 'uploaded',
      componentCount: 0,
    })
    .returning();

  return mapSbomRow(row, true);
}

export async function deleteSbom(id: string): Promise<void> {
  // Delete components first
  await db.delete(componentsTable).where(eq(componentsTable.sbomId, id));
  await db.delete(sbomsTable).where(eq(sbomsTable.id, id));
}

export async function getSbomStatistics(sbomId: string) {
  const [sbomRow] = await db
    .select()
    .from(sbomsTable)
    .where(eq(sbomsTable.id, sbomId))
    .limit(1);

  if (!sbomRow) return null;

  const compRows = await db
    .select()
    .from(componentsTable)
    .where(eq(componentsTable.sbomId, sbomId));

  const components = compRows.map(mapComponentRow);

  const licenses = new Map<string, number>();
  const severities = { critical: 0, high: 0, medium: 0, low: 0, none: 0 };

  for (const c of components) {
    licenses.set(c.license, (licenses.get(c.license) || 0) + 1);
    if (c.highestSeverity !== 'none') {
      severities[c.highestSeverity]++;
    }
  }

  return {
    totalComponents: components.length,
    vulnerableComponents: components.filter((c) => c.vulnerabilityCount > 0).length,
    totalVulnerabilities: components.reduce((sum, c) => sum + c.vulnerabilityCount, 0),
    licenseDistribution: Object.fromEntries(licenses),
    severityDistribution: severities,
  };
}
