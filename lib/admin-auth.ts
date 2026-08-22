import { AdminUser, AdminRole } from './types';

export const ADMIN_STORAGE_KEY = 'nnr_admin_user';

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: AdminUser | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } else {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
  }
}
