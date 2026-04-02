'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Search,
  Server,
  Monitor,
  Globe,
  Cloud,
  Cpu,
  AppWindow,
} from 'lucide-react';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  importAssetsFromCsv,
  type Asset,
  type CreateAssetInput,
} from '@/lib/actions/assets';
import {
  ASSET_TYPE_LABELS,
  CRITICALITY_LABELS,
  type AssetType,
  type CriticalityLevel,
  ASSET_TYPES,
  CRITICALITY_LEVELS,
} from '@schutzkompass/shared';
import { Pagination, usePagination } from '@/components/shared/pagination';

const ASSET_TYPE_ICONS: Record<AssetType, React.ComponentType<{ className?: string }>> = {
  server: Server,
  endpoint: Monitor,
  network: Globe,
  cloud: Cloud,
  ot_device: Cpu,
  application: AppWindow,
};

const CRITICALITY_COLORS: Record<CriticalityLevel, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

export default function AssetInventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<AssetType | ''>('');
  const [filterCriticality, setFilterCriticality] = useState<CriticalityLevel | ''>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const loadAssets = useCallback(async () => {
    const data = await getAssets();
    setAssets(data);
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      !search ||
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.description?.toLowerCase().includes(search.toLowerCase()) ||
      asset.owner?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || asset.type === filterType;
    const matchesCriticality = !filterCriticality || asset.criticality === filterCriticality;
    return matchesSearch && matchesType && matchesCriticality;
  });

  const { paginatedItems, paginationProps } = usePagination(filteredAssets, 10);

  const handleDelete = async (id: string) => {
    if (!confirm('Asset wirklich löschen?')) return;
    await deleteAsset(id);
    await loadAssets();
  };

  const stats = {
    total: assets.length,
    critical: assets.filter((a) => a.criticality === 'critical').length,
    high: assets.filter((a) => a.criticality === 'high').length,
    byType: ASSET_TYPES.reduce(
      (acc, t) => {
        acc[t] = assets.filter((a) => a.type === t).length;
        return acc;
      },
      {} as Record<AssetType, number>,
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset-Inventar</h1>
          <p className="text-muted-foreground">
            Verwaltung aller IT- und OT-Assets Ihrer Organisation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" />
            CSV Import
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Asset hinzufügen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Gesamt</p>
          <p className="mt-1 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Kritisch</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Hohe Priorität</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">{stats.high}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Asset-Typen</p>
          <p className="mt-1 text-2xl font-bold">
            {Object.values(stats.byType).filter((v) => v > 0).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Assets suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as AssetType | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle Typen</option>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {ASSET_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={filterCriticality}
          onChange={(e) => setFilterCriticality(e.target.value as CriticalityLevel | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle Kritikalitäten</option>
          {CRITICALITY_LEVELS.map((c) => (
            <option key={c} value={c}>
              {CRITICALITY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Typ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kritikalität
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Verantwortlich
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Standort
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {search || filterType || filterCriticality
                      ? 'Keine Assets gefunden, die den Filterkriterien entsprechen.'
                      : 'Noch keine Assets vorhanden. Fügen Sie Ihr erstes Asset hinzu.'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((asset) => {
                  const TypeIcon = ASSET_TYPE_ICONS[asset.type] || Server;
                  return (
                    <tr key={asset.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <TypeIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{asset.name}</p>
                            {asset.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {asset.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{ASSET_TYPE_LABELS[asset.type]}</span>
                      </td>
                      <td className="px-4 py-3">
                        {asset.criticality ? (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CRITICALITY_COLORS[asset.criticality]}`}
                          >
                            {CRITICALITY_LABELS[asset.criticality]}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{asset.owner || '—'}</td>
                      <td className="px-4 py-3 text-sm">{asset.location || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingAsset(asset)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Bearbeiten"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...paginationProps} />
      </div>

      {/* Add / Edit Dialog */}
      {(showAddDialog || editingAsset) && (
        <AssetDialog
          asset={editingAsset}
          onClose={() => {
            setShowAddDialog(false);
            setEditingAsset(null);
          }}
          onSave={async (input) => {
            if (editingAsset) {
              await updateAsset({ id: editingAsset.id, ...input });
            } else {
              await createAsset(input);
            }
            await loadAssets();
            setShowAddDialog(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={async (csv) => {
            const result = await importAssetsFromCsv(csv);
            await loadAssets();
            return result;
          }}
        />
      )}
    </div>
  );
}

// ── Add/Edit Dialog ─────────────────────────────────────────────────

function AssetDialog({
  asset,
  onClose,
  onSave,
}: {
  asset: Asset | null;
  onClose: () => void;
  onSave: (input: CreateAssetInput) => Promise<void>;
}) {
  const [name, setName] = useState(asset?.name || '');
  const [type, setType] = useState<AssetType>(asset?.type || 'server');
  const [description, setDescription] = useState(asset?.description || '');
  const [criticality, setCriticality] = useState<CriticalityLevel | ''>(asset?.criticality || '');
  const [owner, setOwner] = useState(asset?.owner || '');
  const [location, setLocation] = useState(asset?.location || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      criticality: criticality || undefined,
      owner: owner.trim() || undefined,
      location: location.trim() || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          {asset ? 'Asset bearbeiten' : 'Neues Asset hinzufügen'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Produktionsserver PRD-01"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Typ *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssetType)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ASSET_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kritikalität</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as CriticalityLevel | '')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Wählen —</option>
                {CRITICALITY_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    {CRITICALITY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Verantwortlich</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="z.B. IT-Abteilung"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Standort</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. Rechenzentrum Frankfurt"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Speichern...' : asset ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Import Dialog ───────────────────────────────────────────────────

function ImportDialog({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (csv: string) => Promise<{ imported: number; errors: string[] }>;
}) {
  const [csvContent, setCsvContent] = useState('');
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvContent(reader.result as string);
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent.trim()) return;
    setImporting(true);
    const res = await onImport(csvContent);
    setResult(res);
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">CSV-Import</h2>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Laden Sie eine CSV-Datei mit den Spalten: <code>name, type, description, criticality,
              owner, location</code>
            </p>
            <div>
              <input type="file" accept=".csv" onChange={handleFileChange} className="text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Oder CSV-Inhalt einfügen:</label>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={6}
                placeholder="name,type,description,criticality,owner,location&#10;Webserver,server,Apache Webserver,high,IT,RZ Frankfurt"
                className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Abbrechen
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !csvContent.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {importing ? 'Importieren...' : 'Importieren'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              <strong>{result.imported}</strong> Asset(s) erfolgreich importiert.
            </p>
            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Fehler:</p>
                <ul className="text-xs text-red-700 dark:text-red-400 space-y-0.5">
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Schließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
