// ── Vulnerability Labels & Constants ────────────────────────────────
// Extracted from actions/vulnerabilities.ts to avoid "use server" export restriction.

export type VulnerabilityStatus = 'open' | 'in_progress' | 'mitigated' | 'accepted' | 'false_positive';

export const VULN_STATUS_LABELS: Record<VulnerabilityStatus, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  mitigated: 'Behoben',
  accepted: 'Akzeptiert',
  false_positive: 'False Positive',
};
