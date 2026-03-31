'use server';

// ── Types ──────────────────────────────────────────────────────────

export type SbomFormat = 'spdx' | 'cyclonedx';
export type ComponentStatus = 'ok' | 'vulnerable' | 'outdated' | 'unknown';

export interface SbomComponent {
  id: string;
  name: string;
  version: string;
  license: string;
  purl?: string; // Package URL
  cpe?: string; // Common Platform Enumeration
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
  // In real implementation: file would be uploaded via API route
}

// ── In-Memory Store ────────────────────────────────────────────────
// TODO: Replace with database + S3 storage

const sampleComponents: SbomComponent[] = [
  {
    id: 'comp-1',
    name: 'openssl',
    version: '1.1.1w',
    license: 'Apache-2.0',
    purl: 'pkg:generic/openssl@1.1.1w',
    cpe: 'cpe:2.3:a:openssl:openssl:1.1.1w:*:*:*:*:*:*:*',
    supplier: 'OpenSSL Software Foundation',
    vulnerabilityCount: 5,
    highestSeverity: 'critical',
    status: 'vulnerable',
  },
  {
    id: 'comp-2',
    name: 'busybox',
    version: '1.35.0',
    license: 'GPL-2.0-only',
    purl: 'pkg:generic/busybox@1.35.0',
    vulnerabilityCount: 3,
    highestSeverity: 'high',
    status: 'vulnerable',
  },
  {
    id: 'comp-3',
    name: 'linux-kernel',
    version: '5.15.0',
    license: 'GPL-2.0-only',
    purl: 'pkg:generic/linux@5.15.0',
    vulnerabilityCount: 12,
    highestSeverity: 'critical',
    status: 'vulnerable',
  },
  {
    id: 'comp-4',
    name: 'libcurl',
    version: '7.88.1',
    license: 'MIT',
    purl: 'pkg:generic/curl@7.88.1',
    vulnerabilityCount: 1,
    highestSeverity: 'medium',
    status: 'vulnerable',
  },
  {
    id: 'comp-5',
    name: 'zlib',
    version: '1.2.13',
    license: 'Zlib',
    purl: 'pkg:generic/zlib@1.2.13',
    vulnerabilityCount: 0,
    highestSeverity: 'none',
    status: 'ok',
  },
  {
    id: 'comp-6',
    name: 'sqlite',
    version: '3.42.0',
    license: 'Public Domain',
    purl: 'pkg:generic/sqlite@3.42.0',
    vulnerabilityCount: 0,
    highestSeverity: 'none',
    status: 'ok',
  },
  {
    id: 'comp-7',
    name: 'mbedtls',
    version: '3.4.0',
    license: 'Apache-2.0',
    purl: 'pkg:generic/mbedtls@3.4.0',
    vulnerabilityCount: 2,
    highestSeverity: 'high',
    status: 'vulnerable',
  },
  {
    id: 'comp-8',
    name: 'freertos',
    version: '10.5.1',
    license: 'MIT',
    purl: 'pkg:generic/freertos@10.5.1',
    vulnerabilityCount: 0,
    highestSeverity: 'none',
    status: 'ok',
  },
  {
    id: 'comp-9',
    name: 'lwip',
    version: '2.1.3',
    license: 'BSD-3-Clause',
    purl: 'pkg:generic/lwip@2.1.3',
    vulnerabilityCount: 1,
    highestSeverity: 'low',
    status: 'vulnerable',
  },
  {
    id: 'comp-10',
    name: 'protobuf',
    version: '3.21.12',
    license: 'BSD-3-Clause',
    purl: 'pkg:generic/protobuf@3.21.12',
    vulnerabilityCount: 0,
    highestSeverity: 'none',
    status: 'ok',
  },
  {
    id: 'comp-11',
    name: 'jansson',
    version: '2.14',
    license: 'MIT',
    purl: 'pkg:generic/jansson@2.14',
    vulnerabilityCount: 0,
    highestSeverity: 'none',
    status: 'ok',
  },
  {
    id: 'comp-12',
    name: 'libsodium',
    version: '1.0.18',
    license: 'ISC',
    purl: 'pkg:generic/libsodium@1.0.18',
    vulnerabilityCount: 0,
    highestSeverity: 'none',
    status: 'ok',
  },
];

let sboms: SbomRecord[] = [
  {
    id: 'sbom-1',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    format: 'cyclonedx',
    formatVersion: '1.5',
    componentCount: sampleComponents.length,
    vulnerableComponentCount: sampleComponents.filter((c) => c.vulnerabilityCount > 0).length,
    createdAt: '2025-03-26',
    generatedBy: 'upload',
    components: sampleComponents,
  },
];

// ── Operations ─────────────────────────────────────────────────────

export async function getSboms(): Promise<Omit<SbomRecord, 'components'>[]> {
  return sboms.map(({ components: _c, ...rest }) => rest);
}

export async function getSbomById(id: string): Promise<SbomRecord | null> {
  return sboms.find((s) => s.id === id) ?? null;
}

export async function getSbomsByProduct(productId: string): Promise<Omit<SbomRecord, 'components'>[]> {
  return sboms
    .filter((s) => s.productId === productId)
    .map(({ components: _c, ...rest }) => rest);
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
  const sbom = sboms.find((s) => s.id === sbomId);
  if (!sbom) return [];

  let components = [...sbom.components];

  // Filter
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

  // Sort
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
  // TODO: In real implementation:
  // 1. Upload file to S3/MinIO
  // 2. Queue BullMQ job to parse SBOM
  // 3. Parse SPDX/CycloneDX format
  // 4. Extract components
  // 5. Run vulnerability matching

  const record: SbomRecord = {
    id: `sbom-${Date.now()}`,
    productId: input.productId,
    productName: input.productName,
    format: input.format,
    formatVersion: input.format === 'cyclonedx' ? '1.5' : '2.3',
    componentCount: 0,
    vulnerableComponentCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    generatedBy: 'upload',
    components: [],
  };

  sboms = [...sboms, record];
  return record;
}

export async function deleteSbom(id: string): Promise<void> {
  sboms = sboms.filter((s) => s.id !== id);
}

export async function getSbomStatistics(sbomId: string) {
  const sbom = sboms.find((s) => s.id === sbomId);
  if (!sbom) return null;

  const components = sbom.components;
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
