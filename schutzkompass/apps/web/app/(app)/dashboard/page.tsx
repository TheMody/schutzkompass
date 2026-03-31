'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getControlsStatistics } from '@/lib/actions/controls';
import { getRiskAssessments, getRiskStatistics, getRiskEntries } from '@/lib/actions/risks';
import { getAssets } from '@/lib/actions/assets';
import { getOnboardingStatus, type OnboardingStatus } from '@/lib/actions/onboarding';
import { ComplianceDonut } from '@/components/charts/compliance-donut';
import { RiskHeatmapChart } from '@/components/charts/risk-heatmap-chart';
import { RISK_LEVEL_LABELS, type RiskLevel } from '@schutzkompass/shared';
import { Shield, AlertTriangle, Server, CheckCircle2 } from 'lucide-react';

// ── Helper: Map next-step text to relevant page link ────────────────

function stepToLink(stepText: string): string | null {
  const lower = stepText.toLowerCase();
  if (lower.includes('risikomanagement') || lower.includes('risikobewertung')) return '/organisation/risiken';
  if (lower.includes('meldeprozess') || lower.includes('vorfall') || lower.includes('vorfälle')) return '/organisation/vorfaelle';
  if (lower.includes('lieferkette')) return '/organisation/lieferkette';
  if (lower.includes('maßnahmen')) return '/organisation/massnahmen';
  if (lower.includes('asset')) return '/organisation/assets';
  if (lower.includes('produkt') || lower.includes('sbom')) return '/produkte';
  if (lower.includes('schwachstellen')) return '/produkte/schwachstellen';
  if (lower.includes('konformitätsbewertung') || lower.includes('notified body')) return '/produkte/konformitaet';
  if (lower.includes('schulung') || lower.includes('governance')) return '/organisation/massnahmen';
  if (lower.includes('registrierung') && lower.includes('behörde')) return '/organisation/massnahmen';
  if (lower.includes('penetrationstest') || lower.includes('code-review')) return '/produkte/konformitaet';
  return null;
}

export default function DashboardPage() {
  const [controlStats, setControlStats] = useState<Awaited<
    ReturnType<typeof getControlsStatistics>
  > | null>(null);
  const [riskStats, setRiskStats] = useState<Awaited<
    ReturnType<typeof getRiskStatistics>
  > | null>(null);
  const [riskEntries, setRiskEntries] = useState<
    Array<{ likelihood: number; impact: number }>
  >([]);
  const [assetCount, setAssetCount] = useState(0);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);

  const onboardingCompleted = onboardingStatus?.onboardingCompleted ?? false;

  const loadData = useCallback(async () => {
    const [cs, assets, assessments, obStatus] = await Promise.all([
      getControlsStatistics(),
      getAssets(),
      getRiskAssessments(),
      getOnboardingStatus(),
    ]);
    setControlStats(cs);
    setAssetCount(assets.length);
    setOnboardingStatus(obStatus);

    if (assessments.length > 0) {
      const [rs, entries] = await Promise.all([
        getRiskStatistics(assessments[0].id),
        getRiskEntries(assessments[0].id),
      ]);
      setRiskStats(rs);
      setRiskEntries(entries.map((e) => ({ likelihood: e.likelihood, impact: e.impact })));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openControls = controlStats
    ? controlStats.byStatus.not_started + controlStats.byStatus.in_progress
    : 0;
  const criticalRisks = riskStats?.distribution.critical ?? 0;
  const highRisks = riskStats?.distribution.high ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen zurück. Hier ist Ihr Compliance-Überblick.
        </p>
      </div>

      {/* Onboarding CTA */}
      {!onboardingCompleted && (
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Onboarding abschließen</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ermitteln Sie in wenigen Minuten, ob Ihr Unternehmen von NIS2 und dem Cyber Resilience
                Act betroffen ist.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex shrink-0 items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Jetzt starten →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">NIS2-Compliance</p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {controlStats ? `${controlStats.complianceScore}%` : '—%'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {controlStats
              ? `${controlStats.byStatus.implemented + controlStats.byStatus.verified} von ${controlStats.total} Maßnahmen`
              : 'Noch keine Daten'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Server className="h-5 w-5 text-teal-600" />
            <p className="text-sm text-muted-foreground">Registrierte Assets</p>
          </div>
          <p className="text-3xl font-bold">{assetCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <Link href="/organisation/assets" className="text-primary hover:underline">
              Inventar anzeigen →
            </Link>
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">Offene Maßnahmen</p>
          </div>
          <p className="text-3xl font-bold">{openControls}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <Link href="/organisation/massnahmen" className="text-primary hover:underline">
              Maßnahmen anzeigen →
            </Link>
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-muted-foreground">Kritische / Hohe Risiken</p>
          </div>
          <p className="text-3xl font-bold text-destructive">
            {criticalRisks + highRisks > 0 ? criticalRisks + highRisks : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <Link href="/organisation/risiken" className="text-primary hover:underline">
              Risiken anzeigen →
            </Link>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      {(controlStats || riskEntries.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Compliance Donut */}
          {controlStats && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-4">Compliance-Fortschritt</h2>
              <div className="flex items-center justify-around">
                <ComplianceDonut score={controlStats.complianceScore} label="NIS2-Compliance" />
                <div className="space-y-2 text-sm">
                  {(
                    [
                      ['verified', 'Verifiziert', 'text-primary'],
                      ['implemented', 'Umgesetzt', 'text-green-600'],
                      ['in_progress', 'In Arbeit', 'text-blue-500'],
                      ['not_started', 'Offen', 'text-muted-foreground'],
                    ] as const
                  ).map(([key, label, color]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`font-semibold ${color}`}>
                        {controlStats.byStatus[key]}
                      </span>
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Risk Heatmap */}
          {riskEntries.length > 0 && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-4">Risikomatrix</h2>
              <RiskHeatmapChart entries={riskEntries} height={220} />
            </div>
          )}

          {/* Risk Distribution */}
          {riskStats && riskStats.total > 0 && (
            <div className="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold mb-4">Risikoverteilung</h2>
              <div className="flex items-end gap-2 h-32">
                {(['critical', 'high', 'medium', 'low', 'negligible'] as RiskLevel[]).map(
                  (level) => {
                    const count = riskStats.distribution[level];
                    const maxCount = Math.max(...Object.values(riskStats.distribution), 1);
                    const heightPct = (count / maxCount) * 100;
                    return (
                      <div key={level} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">{count}</span>
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${Math.max(heightPct, 4)}%`,
                            backgroundColor:
                              level === 'critical'
                                ? '#dc2626'
                                : level === 'high'
                                  ? '#f97316'
                                  : level === 'medium'
                                    ? '#eab308'
                                    : level === 'low'
                                      ? '#22c55e'
                                      : '#94a3b8',
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground text-center">
                          {RISK_LEVEL_LABELS[level]}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Nächste Schritte</h2>
        <div className="space-y-3">
          {onboardingCompleted && onboardingStatus?.nextSteps && onboardingStatus.nextSteps.length > 0 ? (
            <>
              {/* Applicability summary badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {onboardingStatus.nis2Applicable !== null && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      onboardingStatus.nis2Applicable
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    NIS2: {onboardingStatus.nis2Applicable
                      ? `Betroffen${onboardingStatus.nis2EntityType === 'essential' ? ' (Wesentlich)' : ' (Wichtig)'}`
                      : 'Nicht betroffen'}
                  </span>
                )}
                {onboardingStatus.craApplicable !== null && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      onboardingStatus.craApplicable
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    CRA: {onboardingStatus.craApplicable ? 'Betroffen' : 'Nicht betroffen'}
                  </span>
                )}
              </div>

              {/* Dynamic next steps from onboarding results */}
              {onboardingStatus.nextSteps.map((step, i) => {
                const link = stepToLink(step);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <span className="text-sm flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      {step}
                    </span>
                    {link && (
                      <Link
                        href={link}
                        className="text-sm font-medium text-accent hover:underline shrink-0"
                      >
                        Öffnen →
                      </Link>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Betroffenheits-Check durchführen</span>
                <Link
                  href="/onboarding"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Starten →
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Asset-Inventar pflegen</span>
                <Link
                  href="/organisation/assets"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Öffnen →
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Maßnahmen umsetzen</span>
                <Link
                  href="/organisation/massnahmen"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Öffnen →
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Erste Risikobewertung erstellen</span>
                <Link
                  href="/organisation/risiken"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Starten →
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Produkte registrieren</span>
                <Link
                  href="/produkte"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Starten →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
