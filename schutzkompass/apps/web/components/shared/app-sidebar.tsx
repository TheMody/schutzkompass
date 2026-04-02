'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Scale,
  Link2,
  AlertTriangle,
  FileCheck,
  Package,
  FileText,
  Bug,
  Bell,
  Award,
  Clock,
  Settings,
  Users,
  Plug,
  HelpCircle,
  Shield,
  BookOpen,
  X,
} from 'lucide-react';
import { cn } from '@schutzkompass/ui';
import { useSidebar } from './sidebar-context';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navigation: (NavItem | NavSection)[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'Organisation (NIS2)',
    icon: Building2,
    items: [
      { label: 'Betroffenheits-Check', href: '/organisation/betroffenheit', icon: ShieldCheck },
      { label: 'Asset-Inventar', href: '/organisation/assets', icon: Package },
      { label: 'Risikobewertung', href: '/organisation/risiken', icon: Scale },
      { label: 'Maßnahmen-Tracker', href: '/organisation/massnahmen', icon: FileCheck },
      { label: 'Richtlinien-Bibliothek', href: '/organisation/richtlinien', icon: BookOpen },
      { label: 'Lieferketten-Sicherheit', href: '/organisation/lieferkette', icon: Link2 },
      { label: 'Vorfallmanagement', href: '/organisation/vorfaelle', icon: AlertTriangle },
      { label: 'Audit & Nachweise', href: '/organisation/audit', icon: FileText },
    ],
  },
  {
    title: 'Produkte (CRA)',
    icon: Package,
    items: [
      { label: 'Produkt-Inventar', href: '/produkte', icon: Package },
      { label: 'SBOM-Manager', href: '/produkte/sbom', icon: FileText },
      { label: 'Schwachstellen-Monitor', href: '/produkte/schwachstellen', icon: Bug },
      { label: 'Meldewesen', href: '/produkte/meldungen', icon: Bell },
      { label: 'Konformitäts-Dokumentation', href: '/produkte/konformitaet', icon: Award },
      { label: 'Produkt-Lebenszyklus', href: '/produkte/lebenszyklus', icon: Clock },
    ],
  },
  {
    title: 'Einstellungen',
    icon: Settings,
    items: [
      { label: 'Organisation', href: '/einstellungen/organisation', icon: Building2 },
      { label: 'Benutzer & Rollen', href: '/einstellungen/benutzer', icon: Users },
      { label: 'Integrationen', href: '/einstellungen/integrationen', icon: Plug },
    ],
  },
  { label: 'Hilfe & Support', href: '/hilfe', icon: HelpCircle },
];

function isNavSection(item: NavItem | NavSection): item is NavSection {
  return 'items' in item;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function NavGroup({ section, pathname }: { section: NavSection; pathname: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <section.icon className="h-4 w-4" />
        <span>{section.title}</span>
      </div>
      <div className="ml-2 space-y-0.5">
        {section.items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">SchutzKompass</span>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
          {navigation.map((item) =>
            isNavSection(item) ? (
              <NavGroup key={item.title} section={item} pathname={pathname} />
            ) : (
              <NavLink key={item.href} item={item} pathname={pathname} />
            )
          )}
        </nav>
      </aside>
    </>
  );
}
