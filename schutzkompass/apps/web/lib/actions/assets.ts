'use server';

import { db, assets as assetsTable } from '@schutzkompass/db';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from './helpers';
import type { AssetType, CriticalityLevel } from '@schutzkompass/shared';

// ── Types ───────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  organisationId: string;
  name: string;
  type: AssetType;
  description: string | null;
  criticality: CriticalityLevel | null;
  owner: string | null;
  location: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreateAssetInput {
  name: string;
  type: AssetType;
  description?: string;
  criticality?: CriticalityLevel;
  owner?: string;
  location?: string;
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {
  id: string;
}

// ── Server Actions ──────────────────────────────────────────────────

export async function getAssets(): Promise<Asset[]> {
  const orgId = await getOrgId();
  const rows = await db
    .select()
    .from(assetsTable)
    .where(eq(assetsTable.organisationId, orgId))
    .orderBy(desc(assetsTable.createdAt));

  return rows.map(mapRowToAsset);
}

export async function getAsset(id: string): Promise<Asset | undefined> {
  const orgId = await getOrgId();
  const [row] = await db
    .select()
    .from(assetsTable)
    .where(eq(assetsTable.id, id))
    .limit(1);

  if (!row || row.organisationId !== orgId) return undefined;
  return mapRowToAsset(row);
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const orgId = await getOrgId();
  const [row] = await db
    .insert(assetsTable)
    .values({
      organisationId: orgId,
      name: input.name,
      type: input.type,
      description: input.description ?? null,
      criticality: input.criticality ?? null,
      owner: input.owner ?? null,
      location: input.location ?? null,
    })
    .returning();

  return mapRowToAsset(row);
}

export async function updateAsset(input: UpdateAssetInput): Promise<Asset | null> {
  const orgId = await getOrgId();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(assetsTable)
    .where(eq(assetsTable.id, input.id))
    .limit(1);
  if (!existing || existing.organisationId !== orgId) return null;

  const values: Record<string, unknown> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.type !== undefined) values.type = input.type;
  if (input.description !== undefined) values.description = input.description;
  if (input.criticality !== undefined) values.criticality = input.criticality;
  if (input.owner !== undefined) values.owner = input.owner;
  if (input.location !== undefined) values.location = input.location;

  if (Object.keys(values).length === 0) return mapRowToAsset(existing);

  const [row] = await db
    .update(assetsTable)
    .set(values)
    .where(eq(assetsTable.id, input.id))
    .returning();

  return mapRowToAsset(row);
}

export async function deleteAsset(id: string): Promise<boolean> {
  const orgId = await getOrgId();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(assetsTable)
    .where(eq(assetsTable.id, id))
    .limit(1);
  if (!existing || existing.organisationId !== orgId) return false;

  await db.delete(assetsTable).where(eq(assetsTable.id, id));
  return true;
}

export async function importAssetsFromCsv(csvContent: string): Promise<{ imported: number; errors: string[] }> {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  let imported = 0;

  if (lines.length < 2) {
    return { imported: 0, errors: ['CSV-Datei enthält keine Daten.'] };
  }

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const nameIdx = header.indexOf('name');
  const typeIdx = header.indexOf('type');
  const descIdx = header.indexOf('description');
  const critIdx = header.indexOf('criticality');
  const ownerIdx = header.indexOf('owner');
  const locIdx = header.indexOf('location');

  if (nameIdx === -1 || typeIdx === -1) {
    return { imported: 0, errors: ['CSV muss mindestens die Spalten "name" und "type" enthalten.'] };
  }

  const validTypes = ['server', 'endpoint', 'network', 'cloud', 'ot_device', 'application'];
  const validCriticalities = ['critical', 'high', 'medium', 'low'];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const name = cols[nameIdx];
    const type = cols[typeIdx];

    if (!name) {
      errors.push(`Zeile ${i + 1}: Name fehlt.`);
      continue;
    }
    if (!validTypes.includes(type)) {
      errors.push(`Zeile ${i + 1}: Ungültiger Typ "${type}".`);
      continue;
    }

    const criticality = critIdx >= 0 ? cols[critIdx] : undefined;
    if (criticality && !validCriticalities.includes(criticality)) {
      errors.push(`Zeile ${i + 1}: Ungültige Kritikalität "${criticality}".`);
      continue;
    }

    await createAsset({
      name,
      type: type as AssetType,
      description: descIdx >= 0 ? cols[descIdx] : undefined,
      criticality: criticality as CriticalityLevel | undefined,
      owner: ownerIdx >= 0 ? cols[ownerIdx] : undefined,
      location: locIdx >= 0 ? cols[locIdx] : undefined,
    });
    imported++;
  }

  return { imported, errors };
}

// ── Row mapper ──────────────────────────────────────────────────────

function mapRowToAsset(row: typeof assetsTable.$inferSelect): Asset {
  return {
    id: row.id,
    organisationId: row.organisationId,
    name: row.name,
    type: row.type as AssetType,
    description: row.description,
    criticality: row.criticality as CriticalityLevel | null,
    owner: row.owner,
    location: row.location,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt,
  };
}
