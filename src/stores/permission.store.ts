import { computed } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from '@/stores/auth.store'

/**
 * FRD §4.1 / §12.1: permission identifiers are for UI behavior only —
 * "Hiding a button is not an authorization mechanism." Backend authorization
 * remains authoritative (every mutating call still gets a real 403 from
 * Spring Security's @PreAuthorize if this is wrong or bypassed).
 *
 * The current backend has exactly two roles (USER / ADMIN, see
 * domain/entity/User.kt UserRole) and no granular RBAC/permission API
 * (FR-BO-037..039 have no backing endpoint yet). Backoffice access requires
 * ADMIN; all listed permissions are therefore granted uniformly to any
 * authenticated backoffice ADMIN until a real permission service exists.
 */
const ADMIN_PERMISSIONS = [
  'dashboard.read',
  'users.read',
  'users.update_status',
  'users.soft_delete',
  'fraud.read',
  'fraud.assign',
  'fraud.resolve',
  'audit.read',
  'security.events.read',
  'security.modules.read',
  'security.modules.update',
  'security.simulation.execute',
  'security.scan.execute',
  'sessions.read',
  'sessions.revoke',
  'system.health.read',
] as const

export type Permission = (typeof ADMIN_PERMISSIONS)[number]

export const usePermissionStore = defineStore('permission', () => {
  const auth = useAuthStore()

  const permissions = computed<readonly Permission[]>(() => (auth.isAdmin ? ADMIN_PERMISSIONS : []))

  function can(permission: Permission): boolean {
    return permissions.value.includes(permission)
  }

  return { permissions, can }
})
