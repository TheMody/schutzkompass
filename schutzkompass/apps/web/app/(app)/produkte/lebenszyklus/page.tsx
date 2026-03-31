'use client';

import { useState } from 'react';
import {
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Package,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

type LifecyclePhase = 'development' | 'active' | 'maintenance' | 'eol_announced' | 'eol';

interface ProductLifecycle {
  id: string;
  name: string;
  version: string;
  phase: LifecyclePhase;
  launchDate: string;
  supportEndDate: string;
  eolDate?: string;
  lastUpdate: string;
  updateFrequency: string;
  autoUpdates: boolean;
  securityUpdatesOnly: boolean;
  openVulnerabilities: number;
}

const PHASE_LABELS: Record<LifecyclePhase, string> = {
  development: 'In Entwicklung',
  active: 'Aktiv unterstützt',
  maintenance: 'Wartung',
  eol_announced: 'EOL angekündigt',
  eol: 'End of Life',
};

function phaseColor(p: LifecyclePhase) {
  return {
    development: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    eol_announced: 'bg-orange-100 text-orange-700',
    eol: 'bg-red-100 text-red-700',
  }[p];
}

// ── Sample Data ────────────────────────────────────────────────────

const products: ProductLifecycle[] = [
  {
    id: 'plc-1',
    name: 'SmartSensor',
    version: 'v3.2',
    phase: 'active',
    launchDate: '2024-06-01',
    supportEndDate: '2029-06-01',
    lastUpdate: '2026-03-15',
    updateFrequency: 'Monatlich',
    autoUpdates: true,
    securityUpdatesOnly: false,
    openVulnerabilities: 2,
  },
  {
    id: 'plc-2',
    name: 'SmartSensor',
    version: 'v2.5',
    phase: 'maintenance',
    launchDate: '2022-09-01',
    supportEndDate: '2027-09-01',
    lastUpdate: '2026-02-20',
    updateFrequency: 'Quartal (Sicherheit)',
    autoUpdates: true,
    securityUpdatesOnly: true,
    openVulnerabilities: 1,
  },
  {
    id: 'plc-3',
    name: 'IndustrieGateway Pro',
    version: 'v1.0',
    phase: 'active',
    launchDate: '2025-01-15',
    supportEndDate: '2030-01-15',
    lastUpdate: '2026-03-28',
    updateFrequency: 'Alle 2 Wochen',
    autoUpdates: false,
    securityUpdatesOnly: false,
    openVulnerabilities: 0,
  },
  {
    id: 'plc-4',
    name: 'CloudConnect',
    version: 'v4.1',
    phase: 'development',
    launchDate: '2026-06-01',
    supportEndDate: '2031-06-01',
    lastUpdate: '2026-04-01',
    updateFrequency: 'CI/CD',
    autoUpdates: true,
    securityUpdatesOnly: false,
    openVulnerabilities: 0,
  },
  {
    id: 'plc-5',
    name: 'SmartSensor',
    version: 'v1.0',
    phase: 'eol_announced',
    launchDate: '2020-03-01',
    supportEndDate: '2025-12-31',
    eolDate: '2025-12-31',
    lastUpdate: '2025-11-15',
    updateFrequency: 'Nur kritische Patches',
    autoUpdates: false,
    securityUpdatesOnly: true,
    openVulnerabilities: 4,
  },
];

// ── Page ───────────────────────────────────────────────────────────

export default function LebenszyklusPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductLifecycle | null>(null);

  const activeCount = products.filter((p) => p.phase === 'active').length;
  const eolCount = products.filter((p) => p.phase === 'eol_announced' || p.phase === 'eol').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Produkt-Lebenszyklus</h1>
        <p className="text-muted-foreground">
          CRA-konforme Support-Zeiträume, Update-Pflichten und End-of-Life-Planung (Art. 13 Abs. 8).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Package className="h-4 w-4" /> Produkte
          </div>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> Aktiv
          </div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" /> EOL
          </div>
          <p className="text-2xl font-bold">{eolCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Shield className="h-4 w-4 text-red-500" /> Offene Schwachstellen
          </div>
          <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.openVulnerabilities, 0)}</p>
        </div>
      </div>

      {/* CRA Requirement Info */}
      <div className="rounded-lg border bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4" /> CRA Art. 13 Abs. 8 — Support-Zeitraum
        </h3>
        <p className="text-sm text-blue-800">
          Hersteller müssen Sicherheitsupdates für mindestens <strong>5 Jahre</strong> nach
          Inverkehrbringen oder für die erwartete Nutzungsdauer bereitstellen —
          je nachdem, welcher Zeitraum kürzer ist. Der Support-Zeitraum muss auf
          der Verpackung/Dokumentation angegeben werden.
        </p>
      </div>

      {/* Lifecycle Timeline */}
      <div className="space-y-3">
        {products.map((p) => {
          const supportEndDate = new Date(p.supportEndDate);
          const daysLeft = Math.ceil((supportEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const totalDays = Math.ceil((supportEndDate.getTime() - new Date(p.launchDate).getTime()) / (1000 * 60 * 60 * 24));
          const elapsed = Math.max(0, totalDays - daysLeft);
          const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

          return (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="w-full text-left rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{p.name} {p.version}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${phaseColor(p.phase)}`}>
                      {PHASE_LABELS[p.phase]}
                    </span>
                    {p.openVulnerabilities > 0 && (
                      <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                        {p.openVulnerabilities} CVEs
                      </span>
                    )}
                  </div>

                  {/* Timeline bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Start: {new Date(p.launchDate).toLocaleDateString('de-DE')}</span>
                      <span>Support-Ende: {supportEndDate.toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          daysLeft < 365 ? 'bg-red-500' : daysLeft < 730 ? 'bg-orange-400' : 'bg-green-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {daysLeft > 0 ? `${daysLeft} Tage verbleibend` : 'Abgelaufen'}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {p.updateFrequency}
                      </span>
                      <span>
                        Letztes Update: {new Date(p.lastUpdate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg shadow-2xl overflow-auto">
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">{selectedProduct.name} {selectedProduct.version}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${phaseColor(selectedProduct.phase)}`}>
                  {PHASE_LABELS[selectedProduct.phase]}
                </span>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <p><strong>Markteinführung:</strong> {new Date(selectedProduct.launchDate).toLocaleDateString('de-DE')}</p>
                <p><strong>Support-Ende:</strong> {new Date(selectedProduct.supportEndDate).toLocaleDateString('de-DE')}</p>
                {selectedProduct.eolDate && (
                  <p><strong>End of Life:</strong> {new Date(selectedProduct.eolDate).toLocaleDateString('de-DE')}</p>
                )}
                <p><strong>Update-Frequenz:</strong> {selectedProduct.updateFrequency}</p>
                <p><strong>Letztes Update:</strong> {new Date(selectedProduct.lastUpdate).toLocaleDateString('de-DE')}</p>
                <p><strong>Auto-Updates:</strong> {selectedProduct.autoUpdates ? '✅ Aktiviert' : '❌ Deaktiviert'}</p>
                <p><strong>Nur Sicherheitsupdates:</strong> {selectedProduct.securityUpdatesOnly ? 'Ja' : 'Nein'}</p>
                <p><strong>Offene Schwachstellen:</strong> {selectedProduct.openVulnerabilities}</p>
              </div>

              {/* CRA Update Obligations */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-semibold text-sm mb-2">CRA Update-Pflichten</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Sicherheitsupdates kostenlos bereitstellen
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Separate Sicherheitsupdates (ohne Funktionsänderung)
                  </li>
                  <li className="flex items-start gap-2">
                    {selectedProduct.autoUpdates ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    )}
                    Automatische Sicherheitsupdates (konfigurierbar)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Nutzer über verfügbare Updates informieren
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    Support-Zeitraum: mind. 5 Jahre oder erwartete Nutzungsdauer
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
