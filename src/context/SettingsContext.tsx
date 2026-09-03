import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserSettings, WishlistState, Notification, Currency } from '@/types';
import { settingsService } from '@/services/settingsService';
import { wishlistService } from '@/services/wishlistService';
import { notificationService } from '@/services/notificationService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: Record<string, string>;
}

interface SettingsContextType {
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;

  // Profile
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Wishlist — context owns reactive state; wishlistService handles persistence
  wishlist: WishlistState;
  toggleDestinationWishlist: (id: string) => void;
  toggleActivityWishlist: (id: string) => void;
  isDestinationWishlisted: (id: string) => boolean;
  isActivityWishlisted: (id: string) => boolean;

  // Notifications — context owns reactive state; notificationService handles persistence
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getSettings());
  const [profile, setProfile] = useState<UserProfile>(() => settingsService.getProfile());
  const [wishlist, setWishlist] = useState<WishlistState>(() => wishlistService.get());
  const [notifications, setNotifications] = useState<Notification[]>(() => notificationService.getAll());

  // Sync theme with ThemeProvider when setting changes
  useEffect(() => {
    // Future: sync settings side-effects here (e.g., units, locale)
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    const updated = settingsService.saveSettings(partial);
    setSettings(updated);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    updateSettings({ currency: c });
  }, [updateSettings]);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    const updated = settingsService.saveProfile(partial);
    setProfile(updated);
  }, []);

  const toggleDestinationWishlist = useCallback((id: string) => {
    const updated = wishlistService.toggleDestination(id);
    setWishlist(updated);
  }, []);

  const toggleActivityWishlist = useCallback((id: string) => {
    const updated = wishlistService.toggleActivity(id);
    setWishlist(updated);
  }, []);

  const isDestinationWishlisted = useCallback((id: string) => {
    return wishlist.destinations.includes(id);
  }, [wishlist]);

  const isActivityWishlisted = useCallback((id: string) => {
    return wishlist.activities.includes(id);
  }, [wishlist]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(notificationService.markRead(id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(notificationService.markAllRead());
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(notificationService.delete(id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SettingsContext.Provider value={{
      settings, updateSettings, currency: settings.currency, setCurrency,
      profile, updateProfile,
      wishlist, toggleDestinationWishlist, toggleActivityWishlist,
      isDestinationWishlisted, isActivityWishlisted,
      notifications, unreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
