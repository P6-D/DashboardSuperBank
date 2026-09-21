import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authApi, type LoginResponseData } from '@/services/api/auth.api'
import type { CurrentUser, UserRole } from '@/types/domain'

/**
 * FRD §12.1 auth.store: current authenticated user, session state, MFA state.
 *
 * Security note (FRD §9.4 / §12.1): the backend issues bearer JWTs (no
 * cookie-session/BFF layer exists yet — see backend README §6). Storing the
 * access token in memory (this store, not persisted) is required for the
 * Authorization header; sessionStorage is used ONLY for the refresh token so
 * a hard reload doesn't force a full re-login during local operation, and it
 * is cleared on explicit logout / tab close. This is a documented deviation
 * from the FRD's cookie-based-session ideal, tracked as a known gap because
 * the backend has no BFF/session-cookie endpoint to consume instead.
 */
const REFRESH_STORAGE_KEY = 'securebank_bo_refresh'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const accessTokenExpiresAt = ref<number | null>(null)
  const currentUser = ref<CurrentUser | null>(null)
  const mfaToken = ref<string | null>(null)
  const mfaRequired = ref(false)
  const sessionNotice = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!currentUser.value)
  const role = computed<UserRole | null>(() => currentUser.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'ADMIN')

  function applySession(data: LoginResponseData) {
    accessToken.value = data.accessToken
    accessTokenExpiresAt.value = Date.now() + data.expiresIn * 1000
    if (data.refreshToken) {
      sessionStorage.setItem(REFRESH_STORAGE_KEY, data.refreshToken)
    }
    if (data.user) {
      currentUser.value = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        // FR-BE has only USER/ADMIN roles today; backoffice login requires ADMIN.
        role: 'ADMIN',
        mfaEnabled: data.user.mfaEnabled,
      }
    }
    mfaRequired.value = false
    mfaToken.value = null
  }

  async function login(email: string, password: string) {
    const data = await authApi.login({ email, password, deviceName: 'Backoffice Web Console' })
    if (data.mfaRequired) {
      mfaRequired.value = true
      mfaToken.value = data.mfaToken ?? null
      return { mfaRequired: true }
    }
    if (!data.user || data.user.status !== 'ACTIVE') {
      throw new Error('Account is not active for backoffice access')
    }
    applySession(data)
    return { mfaRequired: false }
  }

  async function verifyMfa(code: string) {
    if (!mfaToken.value) throw new Error('No pending MFA challenge')
    const data = await authApi.verifyMfa({ token: mfaToken.value, mfaCode: code })
    applySession(data)
  }

  async function refreshSession(): Promise<string | null> {
    const stored = sessionStorage.getItem(REFRESH_STORAGE_KEY)
    if (!stored) return null
    try {
      const data = await authApi.refresh(stored)
      applySession(data)
      return data.accessToken
    } catch {
      clearSession()
      return null
    }
  }

  function clearSession() {
    accessToken.value = null
    accessTokenExpiresAt.value = null
    currentUser.value = null
    mfaRequired.value = false
    mfaToken.value = null
    sessionStorage.removeItem(REFRESH_STORAGE_KEY)
  }

  async function logout() {
    const stored = sessionStorage.getItem(REFRESH_STORAGE_KEY) ?? undefined
    try {
      await authApi.logout(stored)
    } catch {
      // FRD §17.2: fail closed on the client regardless of logout call outcome.
    }
    clearSession()
  }

  /** Called by the http interceptor when refresh fails / session is revoked server-side. */
  function forceLogout(reason: string) {
    clearSession()
    sessionNotice.value = reason
  }

  function clearSessionNotice() {
    sessionNotice.value = null
  }

  async function bootstrap() {
    if (sessionStorage.getItem(REFRESH_STORAGE_KEY)) {
      await refreshSession()
    }
  }

  return {
    accessToken,
    currentUser,
    mfaRequired,
    sessionNotice,
    isAuthenticated,
    role,
    isAdmin,
    login,
    verifyMfa,
    refreshSession,
    logout,
    forceLogout,
    clearSessionNotice,
    bootstrap,
  }
})
