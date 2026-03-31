'use server';

import type { ControlStatus } from '@schutzkompass/shared';
import { bsiControls } from '@schutzkompass/compliance-content';

// ── Types ───────────────────────────────────────────────────────────

export interface Control {
  id: string;
  organisationId: string;
  bsiId: string;
  nis2Articles: string[];
  title: string;
  description: string;
  status: ControlStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  deadline: string | null;
  evidence: string[];
  notes: string | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateControlInput {
  id: string;
  status?: ControlStatus;
  assigneeName?: string;
  deadline?: string;
  notes?: string;
}

// ── In-Memory Store ─────────────────────────────────────────────────

type BsiControl = (typeof bsiControls)[number];

const controls: Control[] = (bsiControls as BsiControl[]).map((bsi, index) => ({
  id: `ctrl-${index + 1}`,
  organisationId: 'org-1',
  bsiId: bsi.id,
  nis2Articles: bsi.nis2_articles,
  title: bsi.title_de,
  description: bsi.description_de,
  status: 'not_started' as ControlStatus,
  assigneeId: null,
  assigneeName: null,
  deadline: null,
  evidence: [],
  notes: null,
  priority: bsi.priority,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// ── Server Actions ──────────────────────────────────────────────────

export async function getControls(): Promise<Control[]> {
  return controls.sort((a, b) => a.priority - b.priority);
}

export async function getControl(id: string): Promise<Control | undefined> {
  return controls.find((c) => c.id === id);
}

export async function updateControl(input: UpdateControlInput): Promise<Control | null> {
  const index = controls.findIndex((c) => c.id === input.id);
  if (index === -1) return null;

  controls[index] = {
    ...controls[index],
    ...(input.status !== undefined && { status: input.status }),
    ...(input.assigneeName !== undefined && { assigneeName: input.assigneeName }),
    ...(input.deadline !== undefined && { deadline: input.deadline }),
    ...(input.notes !== undefined && { notes: input.notes }),
    updatedAt: new Date(),
  };

  return controls[index];
}

export async function getControlsStatistics() {
  const total = controls.length;
  const byStatus: Record<ControlStatus, number> = {
    not_started: 0,
    in_progress: 0,
    implemented: 0,
    verified: 0,
  };
  for (const c of controls) {
    byStatus[c.status]++;
  }

  const completed = byStatus.implemented + byStatus.verified;
  const complianceScore = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by NIS2 article
  const byArticle: Record<string, { total: number; completed: number }> = {};
  for (const c of controls) {
    for (const article of c.nis2Articles) {
      if (!byArticle[article]) byArticle[article] = { total: 0, completed: 0 };
      byArticle[article].total++;
      if (c.status === 'implemented' || c.status === 'verified') {
        byArticle[article].completed++;
      }
    }
  }

  return { total, byStatus, complianceScore, byArticle };
}
