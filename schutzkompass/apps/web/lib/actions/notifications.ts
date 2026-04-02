'use server';

// ── Types ──────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  icon: 'alert' | 'shield' | 'info' | 'success';
  read: boolean;
  createdAt: string;
  category: 'incident' | 'vulnerability' | 'compliance' | 'supplier' | 'system';
}

// ── In-memory store (per-user, keyed by session) ───────────────────

const notificationStore = new Map<string, AppNotification[]>();

function getUserNotifications(userId: string): AppNotification[] {
  if (!notificationStore.has(userId)) {
    // Seed with realistic initial notifications
    notificationStore.set(userId, [
      {
        id: 'n1',
        title: 'Neue Schwachstelle erkannt',
        message: 'CVE-2026-1234 betrifft eine Ihrer Komponenten. Sofortige Prüfung empfohlen.',
        icon: 'alert',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'vulnerability',
      },
      {
        id: 'n2',
        title: 'Maßnahme fällig',
        message: 'Die Maßnahme "Netzwerksegmentierung" ist heute fällig.',
        icon: 'shield',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: 'compliance',
      },
      {
        id: 'n3',
        title: 'Lieferanten-Fragebogen eingegangen',
        message: 'Lieferant "CloudTech GmbH" hat den Sicherheitsfragebogen beantwortet.',
        icon: 'info',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: 'supplier',
      },
    ]);
  }
  return notificationStore.get(userId)!;
}

// ── Public Actions ─────────────────────────────────────────────────

/** Fetch all notifications for a user */
export async function getNotifications(userId?: string): Promise<AppNotification[]> {
  const uid = userId || 'default';
  return getUserNotifications(uid).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Mark a single notification as read */
export async function markNotificationRead(notificationId: string, userId?: string): Promise<void> {
  const uid = userId || 'default';
  const notifications = getUserNotifications(uid);
  const notif = notifications.find((n) => n.id === notificationId);
  if (notif) notif.read = true;
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(userId?: string): Promise<void> {
  const uid = userId || 'default';
  const notifications = getUserNotifications(uid);
  notifications.forEach((n) => (n.read = true));
}

/** Dismiss (delete) a notification */
export async function dismissNotification(notificationId: string, userId?: string): Promise<void> {
  const uid = userId || 'default';
  const notifications = getUserNotifications(uid);
  const idx = notifications.findIndex((n) => n.id === notificationId);
  if (idx !== -1) notifications.splice(idx, 1);
}

/** Create a new notification (called from other actions) */
export async function createNotification(
  notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>,
  userId?: string
): Promise<AppNotification> {
  const uid = userId || 'default';
  const notifications = getUserNotifications(uid);
  const newNotif: AppNotification = {
    ...notification,
    id: `n${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotif);
  return newNotif;
}

/** Get unread count */
export async function getUnreadCount(userId?: string): Promise<number> {
  const uid = userId || 'default';
  return getUserNotifications(uid).filter((n) => !n.read).length;
}
