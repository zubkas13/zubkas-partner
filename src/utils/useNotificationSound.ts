import { useEffect, useRef } from 'react';
import { playNotificationChime } from '@/utils/notificationSound';
import type { Announcement, Notification } from '@/types';

/**
 * Plays a notification chime when new announcements or notifications
 * arrive via Supabase realtime subscriptions.
 *
 * Only fires for items that appear AFTER the initial data load completes,
 * so it won't play a sound on page load for pre-existing data.
 *
 * @param announcements  live announcements array from context
 * @param notifications   live notifications array from context
 * @param dataLoaded      whether the initial data load has finished
 */
export function useNotificationSound(
  announcements: Announcement[],
  notifications: Notification[],
  dataLoaded: boolean,
): void {
  const knownAnnouncementIds = useRef<Set<string>>(new Set());
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (!dataLoaded) return;

    // First time data is loaded — record all existing IDs without playing sound
    if (!initialized.current) {
      announcements.forEach(a => knownAnnouncementIds.current.add(a.id));
      notifications.forEach(n => knownNotificationIds.current.add(n.id));
      initialized.current = true;
      return;
    }

    // Check for new announcements
    const newAnnouncements = announcements.filter(a => !knownAnnouncementIds.current.has(a.id));
    newAnnouncements.forEach(a => knownAnnouncementIds.current.add(a.id));

    // Check for new notifications
    const newNotifications = notifications.filter(n => !knownNotificationIds.current.has(n.id));
    newNotifications.forEach(n => knownNotificationIds.current.add(n.id));

    if (newAnnouncements.length > 0 || newNotifications.length > 0) {
      playNotificationChime();
    }
  }, [announcements, notifications, dataLoaded]);
}
