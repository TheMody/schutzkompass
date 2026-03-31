'use server';

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

// ── In-Memory Store (until DB is connected) ─────────────────────────

let assets: Asset[] = [
  {
    id: '1',
    organisationId: 'org-1',
    name: 'Produktionsserver PRD-01',
    type: 'server',
    description: 'Hauptproduktionsserver für ERP-System',
    criticality: 'critical',
    owner: 'IT-Abteilung',
    location: 'Rechenzentrum Frankfurt',
    metadata: null,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    organisationId: 'org-1',
    name: 'Office 365 Cloud',
    type: 'cloud',
    description: 'Microsoft 365 E5 Lizenz inkl. Exchange, SharePoint, Teams',
    criticality: 'high',
    owner: 'IT-Abteilung',
    location: 'Cloud (EU)',
    metadata: null,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    organisationId: 'org-1',
    name: 'Firewall Palo Alto PA-3260',
    type: 'network',
    description: 'Perimeter-Firewall am Hauptstandort',
    criticality: 'critical',
    owner: 'Netzwerk-Team',
    location: 'Rechenzentrum Frankfurt',
    metadata: null,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '4',
    organisationId: 'org-1',
    name: 'SPS Siemens S7-1500',
    type: 'ot_device',
    description: 'Speicherprogrammierbare Steuerung in Produktionslinie 3',
    criticality: 'high',
    owner: 'Produktion',
    location: 'Werk München',
    metadata: null,
    createdAt: new Date('2024-03-01'),
  },
];

let nextId = 5;

// ── Server Actions ──────────────────────────────────────────────────

export async function getAssets(): Promise<Asset[]> {
  // TODO: Replace with actual DB query using getRequiredSession()
  return assets;
}

export async function getAsset(id: string): Promise<Asset | undefined> {
  return assets.find((a) => a.id === id);
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const asset: Asset = {
    id: String(nextId++),
    organisationId: 'org-1', // TODO: get from session
    name: input.name,
    type: input.type,
    description: input.description || null,
    criticality: input.criticality || null,
    owner: input.owner || null,
    location: input.location || null,
    metadata: null,
    createdAt: new Date(),
  };
  assets.push(asset);
  return asset;
}

export async function updateAsset(input: UpdateAssetInput): Promise<Asset | null> {
  const index = assets.findIndex((a) => a.id === input.id);
  if (index === -1) return null;

  assets[index] = {
    ...assets[index],
    ...(input.name !== undefined && { name: input.name }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.criticality !== undefined && { criticality: input.criticality }),
    ...(input.owner !== undefined && { owner: input.owner }),
    ...(input.location !== undefined && { location: input.location }),
  };

  return assets[index];
}

export async function deleteAsset(id: string): Promise<boolean> {
  const before = assets.length;
  assets = assets.filter((a) => a.id !== id);
  return assets.length < before;
}

export async function importAssetsFromCsv(csvContent: string): Promise<{ imported: number; errors: string[] }> {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  let imported = 0;

  if (lines.length < 2) {
    return { imported: 0, errors: ['CSV-Datei enthält keine Daten.'] };
  }

  // Expect header: name,type,description,criticality,owner,location
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
