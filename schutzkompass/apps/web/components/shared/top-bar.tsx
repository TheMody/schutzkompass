'use client';

import { Bell, LogOut, User, AlertTriangle, Shield, Info, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: 'alert' | 'shield' | 'info';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Neue Schwachstelle erkannt',
    message: 'CVE-2026-1234 betrifft eine Ihrer Komponenten.',
    time: 'Vor 2 Stunden',
    read: false,
    icon: 'alert',
  },
  {
    id: '2',
    title: 'Maßnahme fällig',
    message: 'Die Maßnahme "Netzwerksegmentierung" ist heute fällig.',
    time: 'Vor 5 Stunden',
    read: false,
    icon: 'shield',
  },
  {
    id: '3',
    title: 'Lieferanten-Fragebogen eingegangen',
    message: 'Lieferant "CloudTech GmbH" hat den Sicherheitsfragebogen beantwortet.',
    time: 'Gestern',
    read: false,
    icon: 'info',
  },
];

const NOTIFICATION_ICONS = {
  alert: AlertTriangle,
  shield: Shield,
  info: Info,
};

const NOTIFICATION_ICON_COLORS = {
  alert: 'text-destructive',
  shield: 'text-primary',
  info: 'text-info',
};

export function TopBar() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      {/* Breadcrumb placeholder */}
      <div className="text-sm text-muted-foreground">
        {/* Breadcrumb will be dynamic */}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMenu(false);
            }}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Benachrichtigungen</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Alle gelesen
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Keine Benachrichtigungen
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const Icon = NOTIFICATION_ICONS[notif.icon];
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${NOTIFICATION_ICON_COLORS[notif.icon]}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden md:block">
              {session?.user?.name || 'Benutzer'}
            </span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border bg-card p-1 shadow-lg">
              <div className="border-b px-3 py-2">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
