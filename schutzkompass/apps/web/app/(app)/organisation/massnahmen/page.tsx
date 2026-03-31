'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getControls,
  updateControl,
  getControlsStatistics,
  type Control,
  type UpdateControlInput,
} from '@/lib/actions/controls';
import {
  CONTROL_STATUS_LABELS,
  CONTROL_STATUSES,
  type ControlStatus,
} from '@schutzkompass/shared';
import { CheckCircle2, Clock, Circle, Shield, X } from 'lucide-react';

const STATUS_ICONS: Record<ControlStatus, React.ComponentType<{ className?: string }>> = {
  not_started: Circle,
  in_progress: Clock,
  implemented: CheckCircle2,
  verified: Shield,
};

const STATUS_COLORS: Record<ControlStatus, string> = {
  not_started: 'text-muted-foreground',
  in_progress: 'text-blue-500',
  implemented: 'text-green-500',
  verified: 'text-primary',
};

const STATUS_BG: Record<ControlStatus, string> = {
  not_started: 'bg-muted/50',
  in_progress: 'bg-blue-50 dark:bg-blue-900/20',
  implemented: 'bg-green-50 dark:bg-green-900/20',
  verified: 'bg-primary/5',
};

export default function MaßnahmenPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getControlsStatistics>> | null>(null);
  const [filterStatus, setFilterStatus] = useState<ControlStatus | ''>('');
  const [filterArticle, setFilterArticle] = useState('');
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  const loadData = useCallback(async () => {
    const [c, s] = await Promise.all([getControls(), getControlsStatistics()]);
    setControls(c);
    setStats(s);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredControls = controls.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterArticle && !c.nis2Articles.some((a) => a.includes(filterArticle))) return false;
    return true;
  });

  // Group by NIS2 article
  const articleGroups = new Map<string, Control[]>();
  for (const c of filteredControls) {
    const primary = c.nis2Articles[0] || 'Sonstige';
    if (!articleGroups.has(primary)) articleGroups.set(primary, []);
    articleGroups.get(primary)!.push(c);
  }

  const uniqueArticles = [...new Set(controls.flatMap((c) => c.nis2Articles))].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maßnahmen & Richtlinien</h1>
        <p className="text-muted-foreground">
          Verfolgen Sie den Umsetzungsstand aller Sicherheitsmaßnahmen gemäß NIS2 und BSI IT-Grundschutz.
        </p>
      </div>

      {/* Compliance Score & Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg border bg-card p-4 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Compliance-Score</p>
            <p className="mt-1 text-3xl font-bold text-primary">{stats.complianceScore}%</p>
          </div>
          {CONTROL_STATUSES.map((status) => (
            <div key={status} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{CONTROL_STATUS_LABELS[status]}</p>
              <p className="mt-1 text-2xl font-bold">{stats.byStatus[status]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ControlStatus | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle Status</option>
          {CONTROL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CONTROL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={filterArticle}
          onChange={(e) => setFilterArticle(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle NIS2-Artikel</option>
          {uniqueArticles.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Controls grouped by NIS2 article */}
      <div className="space-y-6">
        {[...articleGroups.entries()].map(([article, groupControls]) => (
          <div key={article} className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="border-b bg-muted/50 px-4 py-2.5">
              <h2 className="text-sm font-semibold">NIS2 {article}</h2>
              <p className="text-xs text-muted-foreground">
                {groupControls.filter((c) => c.status === 'implemented' || c.status === 'verified').length} von{' '}
                {groupControls.length} Maßnahmen umgesetzt
              </p>
            </div>
            <div className="divide-y">
              {groupControls.map((control) => {
                const StatusIcon = STATUS_ICONS[control.status];
                return (
                  <div
                    key={control.id}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${STATUS_BG[control.status]}`}
                    onClick={() => setSelectedControl(control)}
                  >
                    <StatusIcon className={`h-5 w-5 shrink-0 ${STATUS_COLORS[control.status]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{control.bsiId}</span>
                        <span className="text-sm font-medium">{control.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{control.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {control.assigneeName && (
                        <span className="text-xs text-muted-foreground">{control.assigneeName}</span>
                      )}
                      {control.deadline && (
                        <span className="text-xs text-muted-foreground">{control.deadline}</span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          control.status === 'verified'
                            ? 'bg-primary/10 text-primary'
                            : control.status === 'implemented'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : control.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {CONTROL_STATUS_LABELS[control.status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Control Detail Panel */}
      {selectedControl && (
        <ControlDetailPanel
          control={selectedControl}
          onClose={() => setSelectedControl(null)}
          onUpdate={async (input) => {
            await updateControl(input);
            await loadData();
            setSelectedControl(null);
          }}
        />
      )}
    </div>
  );
}

// ── Control Detail Panel ────────────────────────────────────────────

function ControlDetailPanel({
  control,
  onClose,
  onUpdate,
}: {
  control: Control;
  onClose: () => void;
  onUpdate: (input: UpdateControlInput) => Promise<void>;
}) {
  const [status, setStatus] = useState<ControlStatus>(control.status);
  const [assigneeName, setAssigneeName] = useState(control.assigneeName || '');
  const [deadline, setDeadline] = useState(control.deadline || '');
  const [notes, setNotes] = useState(control.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({
      id: control.id,
      status,
      assigneeName: assigneeName || undefined,
      deadline: deadline || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-muted-foreground">{control.bsiId}</span>
            <h2 className="text-lg font-semibold">{control.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{control.description}</p>

        <div className="text-xs text-muted-foreground mb-4">
          <strong>NIS2-Bezug:</strong> {control.nis2Articles.join(', ')}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ControlStatus)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CONTROL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CONTROL_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Verantwortlich</label>
            <input
              type="text"
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
              placeholder="z.B. Max Mustermann"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frist</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anmerkungen zur Umsetzung..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
