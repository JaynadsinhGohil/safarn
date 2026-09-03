/**
 * mockAuthService — Mock authentication backend.
 *
 * Architecture Note:
 * This service simulates API calls to an authentication backend.
 * In production, replace these with real fetch/axios calls to your auth API.
 *
 * Demo credentials:
 * - Email: any email address
 * - Password: password123
 * - OTP: 123456
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

const DEMO_USERS_KEY = 'globetrotter_users';

/** Load registered mock users from localStorage */
function getUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    return raw ? JSON.parse(raw) : [getDefaultUser()];
  } catch {
    return [getDefaultUser()];
  }
}

function getDefaultUser(): AuthUser {
  return {
    id: 'user-1',
    name: 'Aditi Sharma',
    email: 'aditi@example.com',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/150?u=aditi',
  };
}

function saveUsers(users: AuthUser[]): void {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

export const mockAuthService = {
  loginWithPhoneOTP: async (phone: string, otp: string): Promise<AuthUser> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') {
          // Check if user with this phone exists, else create demo user
          const users = getUsers();
          const existing = users.find(u => u.phone === phone);
          resolve(existing ?? { id: `user-${Date.now()}`, name: 'Guest User', email: '', phone });
        } else {
          reject(new Error('Invalid OTP. Please try 123456 for the demo.'));
        }
      }, 1000);
    });
  },

  loginWithEmail: async (email: string, password: string): Promise<AuthUser> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password === 'password123') {
          // Check if user exists or return the demo default
          const users = getUsers();
          const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          resolve(existing ?? { ...getDefaultUser(), email });
        } else {
          reject(new Error('Invalid password. Use "password123" for the demo.'));
        }
      }, 1000);
    });
  },

  signup: async (data: { name: string; email: string; phone?: string; password?: string }): Promise<AuthUser> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers();
        const newUser: AuthUser = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(data.email)}`,
        };
        saveUsers([...users, newUser]);
        resolve(newUser);
      }, 1500);
    });
  },

  sendOTP: async (_phone: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Always succeeds in mock
      }, 800);
    });
  },
};
