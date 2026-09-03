import type { Notification } from '@/types';
import { SEED_NOTIFICATIONS } from '@/data/mock/notifications';

const NOTIF_KEY = 'globetrotter_notifications';

const getAll = (): Notification[] => {
  const data = localStorage.getItem(NOTIF_KEY);
  if (!data) {
    // Seed on first load
    localStorage.setItem(NOTIF_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  }
  return JSON.parse(data);
};

const save = (notifications: Notification[]): void => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
};

export const notificationService = {
  getAll(): Notification[] {
    return getAll();
  },

  getUnreadCount(): number {
    return getAll().filter(n => !n.read).length;
  },

  markRead(id: string): Notification[] {
    const updated = getAll().map(n => n.id === id ? { ...n, read: true } : n);
    save(updated);
    return updated;
  },

  markAllRead(): Notification[] {
    const updated = getAll().map(n => ({ ...n, read: true }));
    save(updated);
    return updated;
  },

  add(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification[] {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...getAll()];
    save(updated);
    return updated;
  },

  delete(id: string): Notification[] {
    const updated = getAll().filter(n => n.id !== id);
    save(updated);
    return updated;
  },
};
