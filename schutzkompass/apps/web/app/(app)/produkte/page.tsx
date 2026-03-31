'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStatistics,
  type Product,
  type CreateProductInput,
} from '@/lib/actions/products';
import {
  CRA_CATEGORIES,
  CRA_CATEGORY_LABELS,
  type CraCategory,
} from '@schutzkompass/shared';
import {
  Plus,
  Package,
  Shield,
  Pencil,
  Trash2,
  X,
  Search,
} from 'lucide-react';

const STATUS_LABELS: Record<Product['status'], string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  eol: 'End of Life',
};

const STATUS_COLORS: Record<Product['status'], string> = {
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  eol: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const CRA_CATEGORY_COLORS: Record<CraCategory, string> = {
  default: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  important_class_I: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  important_class_II: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  critical: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  out_of_scope: 'bg-muted text-muted-foreground',
};

export default function ProduktInventarPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getProductStatistics>> | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<CraCategory | ''>('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    const [p, s] = await Promise.all([getProducts(), getProductStatistics()]);
    setProducts(p);
    setStats(s);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = products.filter((p) => {
    if (filterCategory && p.craCategory !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Produkt wirklich löschen?')) return;
    await deleteProduct(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produkt-Inventar</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Produkte und deren CRA-Klassifikation.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowDialog(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Produkt hinzufügen
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Gesamt</p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Aktive</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.byStatus.active}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Klasse II / Kritisch</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {stats.byCategory.important_class_II + stats.byCategory.critical}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Entwürfe</p>
            <p className="mt-1 text-2xl font-bold">{stats.byStatus.draft}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Produkt suchen..."
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as CraCategory | '')}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Alle CRA-Kategorien</option>
          {CRA_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CRA_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Product Cards */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">v{product.version}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[product.status]}`}>
                  {STATUS_LABELS[product.status]}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>

              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ</span>
                  <span>{product.productType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CRA-Kategorie</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CRA_CATEGORY_COLORS[product.craCategory]}`}>
                    {product.craCategoryLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Konformität</span>
                  <span className="text-right max-w-[60%]">{product.conformityPathway}</span>
                </div>
                {product.supportEndDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Support bis</span>
                    <span>{product.supportEndDate}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-1 border-t pt-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setShowDialog(true);
                  }}
                  className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Bearbeiten"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Noch keine Produkte registriert.</p>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowDialog(true);
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Erstes Produkt hinzufügen →
          </button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {showDialog && (
        <ProductDialog
          product={editingProduct}
          onClose={() => setShowDialog(false)}
          onSave={async (input) => {
            if (editingProduct) {
              await updateProduct({ id: editingProduct.id, ...input });
            } else {
              await createProduct(input);
            }
            setShowDialog(false);
            await loadData();
          }}
        />
      )}
    </div>
  );
}

// ── Product Dialog ─────────────────────────────────────────────────

function ProductDialog({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (input: CreateProductInput) => Promise<void>;
}) {
  const [name, setName] = useState(product?.name || '');
  const [version, setVersion] = useState(product?.version || '1.0.0');
  const [description, setDescription] = useState(product?.description || '');
  const [productType, setProductType] = useState(product?.productType || '');
  const [craCategory, setCraCategory] = useState<CraCategory>(product?.craCategory || 'default');
  const [manufacturer, setManufacturer] = useState(product?.manufacturer || '');
  const [supportEndDate, setSupportEndDate] = useState(product?.supportEndDate || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name || !productType) return;
    setSaving(true);
    await onSave({
      name,
      version,
      description,
      productType,
      craCategory,
      manufacturer,
      supportEndDate: supportEndDate || undefined,
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
          <h2 className="text-lg font-semibold">
            {product ? 'Produkt bearbeiten' : 'Neues Produkt'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Produktname *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. SmartSensor Pro"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Produkttyp *</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="z.B. IoT-Gerät, Software"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Kurze Beschreibung des Produkts..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CRA-Kategorie</label>
            <select
              value={craCategory}
              onChange={(e) => setCraCategory(e.target.value as CraCategory)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CRA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CRA_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              <Shield className="inline h-3 w-3 mr-1" />
              Unsicher? Nutzen Sie den{' '}
              <a href="/onboarding" className="text-primary hover:underline">
                CRA-Klassifikations-Wizard
              </a>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hersteller</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Firmenname"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Support-Ende</label>
              <input
                type="date"
                value={supportEndDate}
                onChange={(e) => setSupportEndDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !name || !productType}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Speichern...' : product ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
