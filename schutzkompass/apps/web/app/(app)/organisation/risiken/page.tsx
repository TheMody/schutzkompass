'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wizard, useWizard, type WizardStep } from '@schutzkompass/ui';
import { threatCatalog } from '@schutzkompass/compliance-content';
import {
  ASSET_TYPE_LABELS,
  CRITICALITY_LABELS,
  RISK_LEVEL_LABELS,
  RISK_TREATMENT_LABELS,
  RISK_TREATMENTS,
  type RiskTreatment,
  type RiskLevel,
} from '@schutzkompass/shared';
import { getAssets, type Asset } from '@/lib/actions/assets';
import {
  getRiskAssessments,
  createRiskAssessment,
  createRiskEntry,
  getRiskEntries,
  getRiskStatistics,
  type RiskAssessment,
  type RiskEntry,
} from '@/lib/actions/risks';
import { calculateRiskScore, getRiskMatrix } from '@/lib/services/risk-scoring';
import {
  Plus,
  BarChart3,
} from 'lucide-react';

type Threat = (typeof threatCatalog)[number];

const RISK_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'assets',
    title: 'Assets auswählen',
    description: 'Wählen Sie die zu bewertenden Assets aus',
  },
  {
    id: 'threats',
    title: 'Bedrohungen bewerten',
    description: 'Bewerten Sie Wahrscheinlichkeit und Auswirkung',
  },
  {
    id: 'treatment',
    title: 'Risikobehandlung',
    description: 'Definieren Sie Maßnahmen für identifizierte Risiken',
  },
];

const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  negligible: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300',
};

export default function RisikenPage() {
  const [mode, setMode] = useState<'overview' | 'wizard'>('overview');
  const [, setAssessments] = useState<RiskAssessment[]>([]);
  const [entries, setEntries] = useState<RiskEntry[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getRiskStatistics>> | null>(null);
  const [filterLevel, setFilterLevel] = useState<RiskLevel | ''>('');
  const [filterTreatment, setFilterTreatment] = useState<RiskTreatment | ''>('');
  const [sortField, setSortField] = useState<'riskScore' | 'likelihood' | 'impact'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(async () => {
    const data = await getRiskAssessments();
    setAssessments(data);
    if (data.length > 0) {
      const e = await getRiskEntries(data[0].id);
      setEntries(e);
      const s = await getRiskStatistics(data[0].id);
      setStats(s);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (mode === 'wizard') {
    return (
      <RiskAssessmentWizard
        onComplete={async () => {
          setMode('overview');
          await loadData();
        }}
        onCancel={() => setMode('overview')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Risikobewertung</h1>
          <p className="text-muted-foreground">
            Identifizieren und bewerten Sie Risiken gemäß Art. 21 NIS2
          </p>
        </div>
        <button
          onClick={() => setMode('wizard')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Neue Risikobewertung
        </button>
      </div>

      {/* Statistics */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(['critical', 'high', 'medium', 'low', 'negligible'] as RiskLevel[]).map((level) => (
            <div key={level} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{RISK_LEVEL_LABELS[level]}</p>
              <p className="mt-1 text-2xl font-bold">{stats.distribution[level]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Risk Heatmap Mini */}
      {stats && stats.total > 0 && <RiskHeatmapMini entries={entries} />}

      {/* Risk Entries Table with Filters */}
      {entries.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="border-b px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Risikoregister</h2>
            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as RiskLevel | '')}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Alle Risikostufen</option>
                {(['critical', 'high', 'medium', 'low', 'negligible'] as RiskLevel[]).map((l) => (
                  <option key={l} value={l}>
                    {RISK_LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
              <select
                value={filterTreatment}
                onChange={(e) => setFilterTreatment(e.target.value as RiskTreatment | '')}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Alle Behandlungen</option>
                {RISK_TREATMENTS.map((t) => (
                  <option key={t} value={t}>
                    {RISK_TREATMENT_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bedrohung
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Asset
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => {
                      if (sortField === 'likelihood') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                      else { setSortField('likelihood'); setSortDir('desc'); }
                    }}
                  >
                    W {sortField === 'likelihood' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => {
                      if (sortField === 'impact') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                      else { setSortField('impact'); setSortDir('desc'); }
                    }}
                  >
                    A {sortField === 'impact' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => {
                      if (sortField === 'riskScore') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                      else { setSortField('riskScore'); setSortDir('desc'); }
                    }}
                  >
                    Risiko {sortField === 'riskScore' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Behandlung
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries
                  .filter((e) => {
                    if (filterLevel && e.riskLevel !== filterLevel) return false;
                    if (filterTreatment && e.treatment !== filterTreatment) return false;
                    return true;
                  })
                  .sort((a, b) => {
                    const aVal = sortField === 'riskScore' ? a.likelihood * a.impact : a[sortField];
                    const bVal = sortField === 'riskScore' ? b.likelihood * b.impact : b[sortField];
                    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
                  })
                  .map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-sm">{entry.threatDescription}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {entry.assetName || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm">{entry.likelihood}</td>
                    <td className="px-4 py-2.5 text-center text-sm">{entry.impact}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[entry.riskLevel]}`}
                      >
                        {RISK_LEVEL_LABELS[entry.riskLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm">
                      {entry.treatment ? RISK_TREATMENT_LABELS[entry.treatment] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Noch keine Risikobewertungen vorhanden.</p>
          <button
            onClick={() => setMode('wizard')}
            className="text-sm font-medium text-primary hover:underline"
          >
            Erste Risikobewertung starten →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Risk Heatmap Mini ───────────────────────────────────────────────

function RiskHeatmapMini({ entries }: { entries: RiskEntry[] }) {
  const { matrix } = getRiskMatrix();

  // Count entries per cell
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const key = `${e.likelihood}-${e.impact}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">Risikomatrix (5×5)</h3>
      <div className="flex gap-4">
        {/* Y-axis label */}
        <div className="flex flex-col justify-between text-xs text-muted-foreground py-1 mr-1">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
        <div>
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map((l) =>
              [1, 2, 3, 4, 5].map((i) => {
                const cell = matrix.find((m) => m.likelihood === l && m.impact === i)!;
                const count = counts[`${l}-${i}`] || 0;
                return (
                  <div
                    key={`${l}-${i}`}
                    className="flex h-9 w-9 items-center justify-center rounded text-xs font-medium"
                    style={{
                      backgroundColor: cell.color + '30',
                      color: cell.color,
                      border: count > 0 ? `2px solid ${cell.color}` : '1px solid transparent',
                    }}
                    title={`W=${l}, A=${i}: ${cell.label} (${count} Risiken)`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                );
              }),
            )}
          </div>
          {/* X-axis */}
          <div className="grid grid-cols-5 gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-center text-xs text-muted-foreground">
                {i}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>← Wahrscheinlichkeit (Y) | Auswirkung (X) →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Risk Assessment Wizard ──────────────────────────────────────────

function RiskAssessmentWizard({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const wizard = useWizard(RISK_WIZARD_STEPS.length);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

  // Threat assessments: assetId → threatId → { likelihood, impact }
  const [threatAssessments, setThreatAssessments] = useState<
    Map<string, Map<string, { likelihood: number; impact: number }>>
  >(new Map());

  // Treatment selections
  const [treatments, setTreatments] = useState<
    Map<string, { treatment: RiskTreatment; description: string }>
  >(new Map());

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  const selectedAssets = assets.filter((a) => selectedAssetIds.has(a.id));

  // Get applicable threats for selected assets
  const applicableThreats = useCallback(
    (assetType: string): Threat[] => {
      return (threatCatalog as Threat[]).filter((t) =>
        t.applicable_asset_types.includes(assetType),
      );
    },
    [],
  );

  const toggleAsset = (id: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setThreatScore = (
    assetId: string,
    threatId: string,
    field: 'likelihood' | 'impact',
    value: number,
  ) => {
    setThreatAssessments((prev) => {
      const next = new Map(prev);
      if (!next.has(assetId)) next.set(assetId, new Map());
      const assetThreats = next.get(assetId)!;
      const current = assetThreats.get(threatId) || { likelihood: 3, impact: 3 };
      assetThreats.set(threatId, { ...current, [field]: value });
      return next;
    });
  };

  // Flatten all assessments into risk entries for treatment step
  const allRiskEntries = useCallback(() => {
    const riskEntries: {
      key: string;
      assetId: string;
      assetName: string;
      threatId: string;
      threatDescription: string;
      threatCategory: string;
      likelihood: number;
      impact: number;
      riskLevel: RiskLevel;
      riskScore: number;
    }[] = [];

    for (const asset of selectedAssets) {
      const assetThreats = threatAssessments.get(asset.id);
      if (!assetThreats) continue;

      for (const [threatId, scores] of assetThreats.entries()) {
        const threat = (threatCatalog as Threat[]).find((t) => t.id === threatId);
        if (!threat) continue;

        const result = calculateRiskScore(scores);
        riskEntries.push({
          key: `${asset.id}-${threatId}`,
          assetId: asset.id,
          assetName: asset.name,
          threatId,
          threatDescription: threat.name_de,
          threatCategory: threat.category,
          likelihood: result.likelihood,
          impact: result.impact,
          riskLevel: result.riskLevel,
          riskScore: result.riskScore,
        });
      }
    }

    return riskEntries.sort((a, b) => b.riskScore - a.riskScore);
  }, [selectedAssets, threatAssessments]);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const assessment = await createRiskAssessment({
        title: `Risikobewertung ${new Date().toLocaleDateString('de-DE')}`,
      });

      const riskEntries = allRiskEntries();
      for (const entry of riskEntries) {
        const treatment = treatments.get(entry.key);
        await createRiskEntry({
          assessmentId: assessment.id,
          assetId: entry.assetId,
          assetName: entry.assetName,
          threatId: entry.threatId,
          threatDescription: entry.threatDescription,
          threatCategory: entry.threatCategory,
          likelihood: entry.likelihood,
          impact: entry.impact,
          treatment: treatment?.treatment,
          treatmentDescription: treatment?.description,
        });
      }

      onComplete();
    } catch (e) {
      console.error('Error saving risk assessment:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Neue Risikobewertung</h1>
          <p className="text-muted-foreground">Schritt-für-Schritt Risikobewertung gemäß NIS2 Art. 21</p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Abbrechen
        </button>
      </div>

      <Wizard
        steps={RISK_WIZARD_STEPS}
        currentStep={wizard.currentStep}
        onStepChange={wizard.goToStep}
        onComplete={handleComplete}
        isCompleting={saving}
        completeLabel="Bewertung speichern"
      >
        {wizard.currentStep === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wählen Sie die Assets aus, die Sie in dieser Risikobewertung berücksichtigen möchten.
            </p>
            {assets.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Keine Assets vorhanden. Bitte erstellen Sie zuerst Assets im Asset-Inventar.
              </p>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => (
                  <label
                    key={asset.id}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      selectedAssetIds.has(asset.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.has(asset.id)}
                      onChange={() => toggleAsset(asset.id)}
                      className="accent-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ASSET_TYPE_LABELS[asset.type]}
                        {asset.criticality && ` · ${CRITICALITY_LABELS[asset.criticality]}`}
                        {asset.location && ` · ${asset.location}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {wizard.currentStep === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Für jedes ausgewählte Asset werden relevante Bedrohungen angezeigt. Bewerten Sie
              Wahrscheinlichkeit (W) und Auswirkung (A) auf einer Skala von 1-5.
            </p>
            {selectedAssets.map((asset) => {
              const threats = applicableThreats(asset.type);
              return (
                <div key={asset.id} className="border rounded-lg">
                  <div className="border-b bg-muted/50 px-4 py-2.5">
                    <h3 className="text-sm font-semibold">{asset.name}</h3>
                    <p className="text-xs text-muted-foreground">{ASSET_TYPE_LABELS[asset.type]}</p>
                  </div>
                  <div className="divide-y">
                    {threats.map((threat) => {
                      const assetThreats = threatAssessments.get(asset.id);
                      const scores = assetThreats?.get(threat.id) || {
                        likelihood: threat.default_likelihood,
                        impact: threat.default_impact,
                      };
                      const result = calculateRiskScore(scores);

                      return (
                        <div key={threat.id} className="flex items-center gap-4 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{threat.name_de}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {threat.description_de}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-center">
                              <label className="text-[10px] text-muted-foreground block">W</label>
                              <select
                                value={scores.likelihood}
                                onChange={(e) =>
                                  setThreatScore(asset.id, threat.id, 'likelihood', Number(e.target.value))
                                }
                                className="w-12 rounded border bg-background px-1 py-1 text-xs text-center"
                              >
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="text-center">
                              <label className="text-[10px] text-muted-foreground block">A</label>
                              <select
                                value={scores.impact}
                                onChange={(e) =>
                                  setThreatScore(asset.id, threat.id, 'impact', Number(e.target.value))
                                }
                                className="w-12 rounded border bg-background px-1 py-1 text-xs text-center"
                              >
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium min-w-[60px] text-center ${RISK_LEVEL_COLORS[result.riskLevel]}`}
                            >
                              {result.riskLevelLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {wizard.currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Definieren Sie für jedes identifizierte Risiko eine Behandlungsstrategie.
            </p>
            {allRiskEntries().map((entry) => (
              <div key={entry.key} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{entry.threatDescription}</p>
                    <p className="text-xs text-muted-foreground">{entry.assetName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[entry.riskLevel]}`}
                  >
                    {RISK_LEVEL_LABELS[entry.riskLevel]} ({entry.riskScore})
                  </span>
                </div>
                <div className="flex gap-3 mt-3">
                  <select
                    value={treatments.get(entry.key)?.treatment || ''}
                    onChange={(e) => {
                      const t = e.target.value as RiskTreatment;
                      setTreatments((prev) => {
                        const next = new Map(prev);
                        next.set(entry.key, {
                          treatment: t,
                          description: next.get(entry.key)?.description || '',
                        });
                        return next;
                      });
                    }}
                    className="rounded-lg border bg-background px-2 py-1.5 text-sm flex-shrink-0"
                  >
                    <option value="">— Behandlung wählen —</option>
                    {RISK_TREATMENTS.map((t) => (
                      <option key={t} value={t}>
                        {RISK_TREATMENT_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Maßnahmenbeschreibung..."
                    value={treatments.get(entry.key)?.description || ''}
                    onChange={(e) => {
                      setTreatments((prev) => {
                        const next = new Map(prev);
                        const current = next.get(entry.key);
                        next.set(entry.key, {
                          treatment: current?.treatment || 'mitigate',
                          description: e.target.value,
                        });
                        return next;
                      });
                    }}
                    className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            ))}
            {allRiskEntries().length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Keine Bedrohungen bewertet. Gehen Sie zurück und bewerten Sie Bedrohungen.
              </p>
            )}
          </div>
        )}
      </Wizard>
    </div>
  );
}
