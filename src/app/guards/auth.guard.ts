import type { NavigationGuardWithThis } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

/**
 * FRD §24: "Route guards must check authentication and coarse UI
 * permissions, while API authorization remains authoritative." This guard
 * only gates navigation for UX; every API call still enforces
 * hasRole('ADMIN') server-side regardless of what this does.
 */
export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    await auth.bootstrap()
  }

  const isPublic = to.matched.some((record) => record.meta.public)
  if (!isPublic && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
}
