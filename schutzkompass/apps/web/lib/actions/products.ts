'use server';

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

// ── In-Memory Store ────────────────────────────────────────────────
// TODO: Replace with database queries via Drizzle ORM

let products: Product[] = [
  {
    id: 'prod-1',
    name: 'SmartSensor Pro',
    version: '2.1.0',
    description: 'Industrieller IoT-Sensor mit Netzwerkanbindung für Fertigungsumgebungen.',
    productType: 'IoT-Gerät',
    craCategory: 'important_class_I',
    craCategoryLabel: CRA_CATEGORY_LABELS.important_class_I,
    conformityPathway: CONFORMITY_PATHWAYS.important_class_I,
    manufacturer: 'Beispiel GmbH',
    supportEndDate: '2029-12-31',
    status: 'active',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
  },
  {
    id: 'prod-2',
    name: 'SecureGateway Firewall',
    version: '5.0.3',
    description: 'Netzwerk-Firewall mit IDS/IPS für KMU-Umgebungen.',
    productType: 'Firewall / Netzwerksicherheit',
    craCategory: 'important_class_II',
    craCategoryLabel: CRA_CATEGORY_LABELS.important_class_II,
    conformityPathway: CONFORMITY_PATHWAYS.important_class_II,
    manufacturer: 'Beispiel GmbH',
    supportEndDate: '2030-06-30',
    status: 'active',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
  },
  {
    id: 'prod-3',
    name: 'DataSync Cloud Connector',
    version: '1.3.0',
    description: 'Cloud-Integrationssoftware für Daten-Synchronisation.',
    productType: 'Software',
    craCategory: 'default',
    craCategoryLabel: CRA_CATEGORY_LABELS.default,
    conformityPathway: CONFORMITY_PATHWAYS.default,
    manufacturer: 'Beispiel GmbH',
    status: 'draft',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20',
  },
];

// ── CRUD Operations ────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return [...products];
}

export async function getProductById(id: string): Promise<Product | null> {
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const product: Product = {
    id: `prod-${Date.now()}`,
    name: input.name,
    version: input.version,
    description: input.description,
    productType: input.productType,
    craCategory: input.craCategory,
    craCategoryLabel: CRA_CATEGORY_LABELS[input.craCategory],
    conformityPathway: CONFORMITY_PATHWAYS[input.craCategory],
    manufacturer: input.manufacturer,
    supportEndDate: input.supportEndDate,
    status: 'draft',
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  products = [...products, product];
  return product;
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  const idx = products.findIndex((p) => p.id === input.id);
  if (idx === -1) throw new Error('Product not found');

  const existing = products[idx];
  const updated: Product = {
    ...existing,
    name: input.name ?? existing.name,
    version: input.version ?? existing.version,
    description: input.description ?? existing.description,
    productType: input.productType ?? existing.productType,
    craCategory: input.craCategory ?? existing.craCategory,
    craCategoryLabel: CRA_CATEGORY_LABELS[input.craCategory ?? existing.craCategory],
    conformityPathway: CONFORMITY_PATHWAYS[input.craCategory ?? existing.craCategory],
    manufacturer: input.manufacturer ?? existing.manufacturer,
    supportEndDate: input.supportEndDate ?? existing.supportEndDate,
    status: input.status ?? existing.status,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  products = products.map((p) => (p.id === input.id ? updated : p));
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  products = products.filter((p) => p.id !== id);
}

// ── Statistics ─────────────────────────────────────────────────────

export async function getProductStatistics() {
  const byCategory: Record<CraCategory, number> = {
    default: 0,
    important_class_I: 0,
    important_class_II: 0,
    critical: 0,
    out_of_scope: 0,
  };

  const byStatus = {
    draft: 0,
    active: 0,
    eol: 0,
  };

  for (const p of products) {
    byCategory[p.craCategory]++;
    byStatus[p.status]++;
  }

  return {
    total: products.length,
    byCategory,
    byStatus,
  };
}
