import { ALL_MODULES } from '../data/modulesData';
import type { AuthUser } from '../services/auth.service';

/**
 * Baseline modules granted to legacy staff accounts that do not have
 * explicit module access configured yet.
 * 1: Dashboard, 2: Profile, 3: Calendar, 4: Reports, 5: Settings
 */
export const DEFAULT_STAFF_MODULE_IDS: number[] = [1, 2, 3, 4, 5];

/**
 * Baseline modules granted to Tuition Operations Admin accounts:
 * 1: Dashboard, 2: Profile, 3: Calendar, 4: Reports, 5: Settings, 33: Edupye Tuition Operations Hub
 */
export const DEFAULT_TUITION_ADMIN_MODULE_IDS: number[] = [1, 2, 3, 4, 5, 33];

/**
 * Returns the effective list of permitted module IDs for a given user.
 */
export function getEffectiveAllowedModules(
  user: { role?: string; adminRole?: string; department?: string; allowedModules?: number[] } | null | undefined,
  isSuperAdmin?: boolean,
  isAdmin?: boolean,
): number[] {
  if (!user) return [];

  const rawRole = (user.adminRole || user.role || '').trim().toLowerCase();
  const isSuper = isSuperAdmin || rawRole === 'super admin' || rawRole === 'super_admin';

  // 1. Platform Super Admin has unrestricted access to all modules
  if (isSuper) {
    return ALL_MODULES.map((m) => m.id);
  }

  // 2. Explicitly configured module permissions
  if (Array.isArray(user.allowedModules) && user.allowedModules.length > 0) {
    return user.allowedModules;
  }

  // 3. Tuition Operations Admin strictly scoped to [1, 2, 3, 4, 5, 33]
  const isTuitionAdmin =
    rawRole.includes('tuition') ||
    Boolean(user.department && user.department.toLowerCase().includes('tuition'));
  if (isTuitionAdmin) {
    return DEFAULT_TUITION_ADMIN_MODULE_IDS;
  }

  // 4. General Admin
  const isAdm = isAdmin || rawRole === 'admin' || rawRole === 'adm';
  if (isAdm) {
    return ALL_MODULES.map((m) => m.id);
  }

  // 5. Safe fallback for staff accounts without explicit permissions
  return DEFAULT_STAFF_MODULE_IDS;
}

/**
 * Checks if a specific module is accessible by the user.
 */
export function isModuleAccessible(
  moduleId: number,
  user: AuthUser | null | undefined,
  isSuperAdmin?: boolean,
  isAdmin?: boolean,
): boolean {
  if (!user) return false;

  const rawRole = (user.role || '').trim().toLowerCase();
  const isSuper = isSuperAdmin || rawRole === 'super admin' || rawRole === 'super_admin';

  // Super Admin can access all modules
  if (isSuper) return true;

  const effectiveModules = getEffectiveAllowedModules(user, isSuperAdmin, isAdmin);

  // Sub-modules mapping to parent module (e.g., CMS submodules 55, 56, 57, 58)
  if ([55, 56, 57, 58].includes(moduleId)) {
    if (effectiveModules.includes(7) || effectiveModules.includes(moduleId)) {
      return true;
    }
  }

  return effectiveModules.includes(moduleId);
}
