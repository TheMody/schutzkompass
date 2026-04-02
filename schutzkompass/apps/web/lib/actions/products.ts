'use server';

import { db, products as productsTable } from '@schutzkompass/db';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from './helpers';
import type { CraCategory } from '@schutzkompass/shared';

// ── Types ──────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  version: string;
  description: string;
  productType: string;
  craCategory: CraCategory;
  craCategoryLabel: string;
  conformityPathway: string;
  manufacturer: string;
  supportEndDate?: string;
  status: 'draft' | 'active' | 'eol';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  version: string;
  description: string;
  productType: string;
  craCategory: CraCategory;
  manufacturer: string;
  supportEndDate?: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  version?: string;
  description?: string;
  productType?: string;
  craCategory?: CraCategory;
  manufacturer?: string;
  supportEndDate?: string;
  status?: 'draft' | 'active' | 'eol';
}

// ── CRA Category Labels ────────────────────────────────────────────

const CRA_CATEGORY_LABELS: Record<CraCategory, string> = {
  default: 'Standard (Default)',
  important_class_I: 'Wichtig – Klasse I',
  important_class_II: 'Wichtig – Klasse II',
  critical: 'Kritisch',
  out_of_scope: 'Nicht im Anwendungsbereich',
};

const CONFORMITY_PATHWAYS: Record<CraCategory, string> = {
  default: 'Selbstbewertung (Modul A)',
  important_class_I: 'Harmonisierte Normen oder EU-Zertifizierung',
  important_class_II: 'EU-Typprüfung (Modul B+C) oder EU-Zertifizierung',
  critical: 'EU-Zertifizierung (Pflicht)',
  out_of_scope: '—',
};

// ── Mapper ─────────────────────────────────────────────────────────

function mapRow(row: typeof productsTable.$inferSelect): Product {
  const cat = (row.craCategory ?? 'default') as CraCategory;
  // Map DB status field: DB doesn't have a status column, so we infer from supportPeriodEnd
  let status: 'draft' | 'active' | 'eol' = 'active';
  if (row.supportPeriodEnd) {
    const endDate = new Date(row.supportPeriodEnd);
    if (endDate < new Date()) status = 'eol';
  }
  if (!row.ceMarkingApplied) status = 'draft';

  return {
    id: row.id,
    name: row.name,
    version: row.version ?? '',
    description: row.description ?? '',
    productType: row.productType ?? '',
    craCategory: cat,
    craCategoryLabel: CRA_CATEGORY_LABELS[cat] ?? cat,
    conformityPathway: row.conformityPathway
      ? CONFORMITY_PATHWAYS[cat] ?? row.conformityPathway
      : CONFORMITY_PATHWAYS[cat] ?? '—',
    manufacturer: row.model ?? '', // store manufacturer in model field
    supportEndDate: row.supportPeriodEnd ?? undefined,
    status,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
  };
}

// ── CRUD Operations ────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.organisationId, orgId))
    .orderBy(desc(productsTable.createdAt));

  return rows.map(mapRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);

  return row ? mapRow(row) : null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const orgId = await getOrgId();
  const now = new Date();
  const cat = input.craCategory;

  const [row] = await db
    .insert(productsTable)
    .values({
      organisationId: orgId,
      name: input.name,
      version: input.version,
      description: input.description,
      productType: input.productType === 'IoT-Gerät' ? 'hardware' : input.productType === 'Software' ? 'software' : 'combined',
      craCategory: cat,
      conformityPathway: CONFORMITY_PATHWAYS[cat] ?? 'module_a',
      model: input.manufacturer, // store manufacturer in model field
      supportPeriodEnd: input.supportEndDate ?? null,
      ceMarkingApplied: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return mapRow(row);
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updates.name = input.name;
  if (input.version !== undefined) updates.version = input.version;
  if (input.description !== undefined) updates.description = input.description;
  if (input.productType !== undefined) {
    updates.productType = input.productType === 'IoT-Gerät' ? 'hardware' : input.productType === 'Software' ? 'software' : 'combined';
  }
  if (input.craCategory !== undefined) {
    updates.craCategory = input.craCategory;
    updates.conformityPathway = CONFORMITY_PATHWAYS[input.craCategory] ?? 'module_a';
  }
  if (input.manufacturer !== undefined) updates.model = input.manufacturer;
  if (input.supportEndDate !== undefined) updates.supportPeriodEnd = input.supportEndDate;
  if (input.status === 'active') updates.ceMarkingApplied = true;
  if (input.status === 'draft') updates.ceMarkingApplied = false;

  await db.update(productsTable).set(updates).where(eq(productsTable.id, input.id));

  const result = await getProductById(input.id);
  if (!result) throw new Error('Product not found');
  return result;
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete(productsTable).where(eq(productsTable.id, id));
}

// ── Statistics ─────────────────────────────────────────────────────

export async function getProductStatistics() {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.organisationId, orgId));

  const byCategory: Record<CraCategory, number> = {
    default: 0,
    important_class_I: 0,
    important_class_II: 0,
    critical: 0,
    out_of_scope: 0,
  };

  const byStatus = { draft: 0, active: 0, eol: 0 };

  for (const row of rows) {
    const cat = (row.craCategory ?? 'default') as CraCategory;
    if (byCategory[cat] !== undefined) byCategory[cat]++;
    const product = mapRow(row);
    byStatus[product.status]++;
  }

  return {
    total: rows.length,
    byCategory,
    byStatus,
  };
}
