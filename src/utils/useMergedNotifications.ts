import { useMemo, useCallback } from 'react';
import type { Notification, Announcement } from '@/types';

export interface MergedNotification extends Notification {
  source: 'notification' | 'announcement';
  announcementId?: string;
}

/**
 * Merges real per-user notifications with live announcement data from
 * the announcements table so newly published admin announcements appear
 * instantly in the partner's notification feed.
 *
 * Read and dismissed state are passed in from a single source of truth
 * (AppContext) so all consumers — Header dropdown, Notifications page,
 * Announcements page — share the same dismissed/read sets and never
 * drift apart.
 */
export function useMergedNotifications(
  rawNotifications: Notification[],
  announcements: Announcement[],
  userId: string | undefined,
  partnerId: string | undefined,
  userRole: string | undefined,
  readAnnouncementIds: string[],
  dismissedAnnouncementIds: string[],
  dismissedNotificationIds: string[],
  setReadAnnouncementIds: (updater: (prev: string[]) => string[]) => void,
  setDismissedAnnouncementIds: (updater: (prev: string[]) => string[]) => void,
  setDismissedNotificationIds: (updater: (prev: string[]) => string[]) => void,
) {
  const merged = useMemo<MergedNotification[]>(() => {
    const baseNotifs = rawNotifications
      .filter(n =>
        !dismissedNotificationIds.includes(n.id) &&
        (n.userId === partnerId ||
         n.userId === userId ||
         n.userId === userRole ||
         n.userId === 'broadcast')
      )
      .map(n => ({ ...n, source: 'notification' as const }));

    const announcementNotifs: MergedNotification[] = announcements
      .filter(a => !dismissedAnnouncementIds.includes(a.id))
      .map(a => ({
        id: `ann-${a.id}`,
        userId: 'broadcast',
        title: a.title,
        message: a.content,
        type: 'announcement',
        date: a.date,
        read: readAnnouncementIds.includes(a.id),
        source: 'announcement',
        announcementId: a.id,
      }));

    return [...baseNotifs, ...announcementNotifs].sort((a, b) => b.date.localeCompare(a.date));
  }, [rawNotifications, announcements, userId, partnerId, userRole, readAnnouncementIds, dismissedAnnouncementIds, dismissedNotificationIds]);

  const unreadCount = merged.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    const item = merged.find(n => n.id === id);
    if (!item) return;
    if (item.source === 'announcement' && item.announcementId) {
      setReadAnnouncementIds(prev => prev.includes(item.announcementId!) ? prev : [...prev, item.announcementId!]);
    }
  }, [merged, setReadAnnouncementIds]);

  const markAllRead = useCallback(() => {
    const unreadAnnIds = merged.filter(n => !n.read && n.source === 'announcement' && n.announcementId).map(n => n.announcementId!);
    if (unreadAnnIds.length > 0) {
      setReadAnnouncementIds(prev => {
        const set = new Set(prev);
        unreadAnnIds.forEach(id => set.add(id));
        return [...set];
      });
    }
  }, [merged, setReadAnnouncementIds]);

  const dismiss = useCallback((id: string) => {
    const item = merged.find(n => n.id === id);
    if (!item) return;
    if (item.source === 'announcement' && item.announcementId) {
      setDismissedAnnouncementIds(prev => prev.includes(item.announcementId!) ? prev : [...prev, item.announcementId!]);
    } else {
      setDismissedNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }
  }, [merged, setDismissedAnnouncementIds, setDismissedNotificationIds]);

  return { merged, unreadCount, markRead, markAllRead, dismiss };
}
