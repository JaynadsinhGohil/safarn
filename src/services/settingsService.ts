import type { UserSettings } from '@/types';

const SETTINGS_KEY = 'globetrotter_settings';
const PROFILE_KEY = 'globetrotter_profile';
const PROFILE_VERSION = 'v2'; // bump this whenever DEFAULT_PROFILE changes
const PROFILE_VER_KEY = 'globetrotter_profile_ver';

const DEFAULT_SETTINGS: UserSettings = {
  currency: 'INR',
  language: 'en',
  units: 'metric',
  notifications: {
    tripReminders: true,
    activityAlerts: true,
    budgetAlerts: true,
    productUpdates: false,
  },
};

const DEFAULT_PROFILE = {
  id: 'user-1',
  name: 'Jaynadsinh Gohil',
  email: 'jaynadsinh.gohil@example.com',
  phone: '+91 98765 43210',
  avatar: '/avatar-jaynad.jpg',
};

export const settingsService = {
  getSettings(): UserSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = settingsService.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  getProfile() {
    // If profile was saved with an older version of the defaults, clear it so new defaults apply
    if (localStorage.getItem(PROFILE_VER_KEY) !== PROFILE_VERSION) {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.setItem(PROFILE_VER_KEY, PROFILE_VERSION);
    }
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
  },

  saveProfile(profile: Partial<typeof DEFAULT_PROFILE>) {
    const current = settingsService.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },
};
