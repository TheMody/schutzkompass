'use client';

import { Bell, LogOut, User, AlertTriangle, Shield, Info, X, Menu, CheckCircle2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSidebar } from './sidebar-context';
import {
  getNotifications,
  markAllNotificationsRead,
  dismissNotification as dismissNotif,
  type AppNotification,
} from '@/lib/actions/notifications';

const NOTIFICATION_ICONS: Record<AppNotification['icon'], typeof AlertTriangle> = {
  alert: AlertTriangle,
  shield: Shield,
  info: Info,
  success: CheckCircle2,
};

const NOTIFICATION_ICON_COLORS: Record<AppNotification['icon'], string> = {
  alert: 'text-destructive',
  shield: 'text-primary',
  info: 'text-info',
  success: 'text-green-600',
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Gerade eben';
  if (minutes < 60) return `Vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
  const days = Math.floor(hours / 24);
  return `Vor ${days} Tag${days > 1 ? 'en' : ''}`;
}

export function TopBar() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggle } = useSidebar();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load notifications from server
  const loadNotifications = useCallback(async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismiss = async (id: string) => {
    await dismissNotif(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      {/* Mobile hamburger + Breadcrumb placeholder */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-sm text-muted-foreground">
          {/* Breadcrumb will be dynamic */}
        </div>
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
                          <p className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(notif.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleDismiss(notif.id)}
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
