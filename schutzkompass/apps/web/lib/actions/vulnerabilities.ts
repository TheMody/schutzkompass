'use server';

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

// ── In-Memory Store ────────────────────────────────────────────────
// TODO: Replace with database

let vulnerabilities: Vulnerability[] = [
  {
    id: 'vuln-1',
    cveId: 'CVE-2024-5535',
    title: 'OpenSSL SSL_select_next_proto Buffer Overread',
    description: 'A buffer overread vulnerability in OpenSSL allows remote attackers to cause a denial of service or potentially disclose sensitive information.',
    severity: 'critical',
    cvssScore: 9.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:H',
    affectedComponent: 'openssl',
    affectedVersion: '1.1.1w',
    fixedVersion: '3.3.1',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    source: 'nvd',
    status: 'open',
    exploitAvailable: true,
    publishedDate: '2024-06-27',
    lastModified: '2024-07-15',
  },
  {
    id: 'vuln-2',
    cveId: 'CVE-2024-4741',
    title: 'OpenSSL Use-After-Free in SSL_free_buffers',
    description: 'A use-after-free vulnerability in OpenSSL SSL_free_buffers function can lead to potential code execution.',
    severity: 'high',
    cvssScore: 8.1,
    affectedComponent: 'openssl',
    affectedVersion: '1.1.1w',
    fixedVersion: '3.3.0',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    source: 'nvd',
    status: 'open',
    exploitAvailable: false,
    publishedDate: '2024-05-28',
    lastModified: '2024-06-10',
  },
  {
    id: 'vuln-3',
    cveId: 'CVE-2024-4603',
    title: 'OpenSSL DSA Parameter Check Slowdown',
    description: 'Checking DSA parameters may be excessively slow, causing a potential denial of service.',
    severity: 'medium',
    cvssScore: 5.3,
    affectedComponent: 'openssl',
    affectedVersion: '1.1.1w',
    fixedVersion: '3.2.2',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    source: 'nvd',
    status: 'accepted',
    exploitAvailable: false,
    publishedDate: '2024-05-16',
    lastModified: '2024-05-20',
    notes: 'DSA wird nicht eingesetzt, Risiko akzeptiert.',
  },
  {
    id: 'vuln-4',
    cveId: 'CVE-2023-39615',
    title: 'BusyBox Stack Overflow in ash Shell',
    description: 'A crafted input can cause a stack overflow in BusyBox ash shell, leading to denial of service.',
    severity: 'high',
    cvssScore: 7.5,
    affectedComponent: 'busybox',
    affectedVersion: '1.35.0',
    fixedVersion: '1.36.1',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    source: 'osv',
    status: 'in_progress',
    exploitAvailable: false,
    publishedDate: '2023-08-25',
    lastModified: '2023-09-10',
    assignee: 'Max M.',
  },
  {
    id: 'vuln-5',
    cveId: 'CVE-2024-1086',
    title: 'Linux Kernel nf_tables Use-After-Free',
    description: 'A use-after-free vulnerability in the nf_tables subsystem of the Linux kernel allows local privilege escalation.',
    severity: 'critical',
    cvssScore: 7.8,
    affectedComponent: 'linux-kernel',
    affectedVersion: '5.15.0',
    fixedVersion: '5.15.149',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    source: 'nvd',
    status: 'open',
    exploitAvailable: true,
    publishedDate: '2024-01-31',
    lastModified: '2024-04-01',
  },
  {
    id: 'vuln-6',
    cveId: 'CVE-2023-38545',
    title: 'libcurl SOCKS5 Heap Buffer Overflow',
    description: 'A heap buffer overflow in libcurl SOCKS5 proxy handshake can lead to remote code execution.',
    severity: 'high',
    cvssScore: 7.5,
    affectedComponent: 'libcurl',
    affectedVersion: '7.88.1',
    fixedVersion: '8.4.0',
    productId: 'prod-1',
    productName: 'SmartSensor Pro',
    source: 'nvd',
    status: 'open',
    exploitAvailable: false,
    publishedDate: '2023-10-11',
    lastModified: '2023-11-15',
  },
];

// ── Operations ─────────────────────────────────────────────────────

export async function getVulnerabilities(options?: {
  productId?: string;
  severity?: SeverityLevel;
  status?: VulnerabilityStatus;
  search?: string;
}): Promise<Vulnerability[]> {
  let result = [...vulnerabilities];

  if (options?.productId) {
    result = result.filter((v) => v.productId === options.productId);
  }
  if (options?.severity) {
    result = result.filter((v) => v.severity === options.severity);
  }
  if (options?.status) {
    result = result.filter((v) => v.status === options.status);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.cveId.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.affectedComponent.toLowerCase().includes(q),
    );
  }

  // Sort by CVSS score descending
  result.sort((a, b) => b.cvssScore - a.cvssScore);

  return result;
}

export async function getVulnerabilityById(id: string): Promise<Vulnerability | null> {
  return vulnerabilities.find((v) => v.id === id) ?? null;
}

export async function triageVulnerability(input: VulnerabilityTriageInput): Promise<Vulnerability> {
  const idx = vulnerabilities.findIndex((v) => v.id === input.id);
  if (idx === -1) throw new Error('Vulnerability not found');

  const updated = {
    ...vulnerabilities[idx],
    status: input.status,
    assignee: input.assignee ?? vulnerabilities[idx].assignee,
    notes: input.notes ?? vulnerabilities[idx].notes,
    lastModified: new Date().toISOString().slice(0, 10),
  };

  vulnerabilities = vulnerabilities.map((v) => (v.id === input.id ? updated : v));
  return updated;
}

export async function getVulnerabilityStatistics(productId?: string) {
  const filtered = productId
    ? vulnerabilities.filter((v) => v.productId === productId)
    : vulnerabilities;

  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const byStatus: Record<VulnerabilityStatus, number> = {
    open: 0,
    in_progress: 0,
    mitigated: 0,
    accepted: 0,
    false_positive: 0,
  };

  let exploitCount = 0;

  for (const v of filtered) {
    bySeverity[v.severity]++;
    byStatus[v.status]++;
    if (v.exploitAvailable) exploitCount++;
  }

  return {
    total: filtered.length,
    bySeverity,
    byStatus,
    exploitAvailable: exploitCount,
    openCritical: filtered.filter((v) => v.severity === 'critical' && v.status === 'open').length,
  };
}
