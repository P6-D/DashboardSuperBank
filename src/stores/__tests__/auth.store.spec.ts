import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.store'

// Mock the API module
vi.mock('@/services/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear storage between tests
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = useAuthStore()
    expect(store.accessToken).toBeNull()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  it('restores state from sessionStorage on bootstrap', async () => {
    sessionStorage.setItem('securebank_bo_refresh', 'fake-refresh-token')
    
    const { authApi } = await import('@/services/api/auth.api')
    vi.mocked(authApi.refresh).mockResolvedValueOnce({
      accessToken: 'new-token',
      expiresIn: 3600,
      refreshToken: 'new-refresh',
      mfaRequired: false,
      user: {
        id: '1',
        fullName: 'Test Admin',
        email: 'test@admin.com',
        phone: '+1234567890',
        status: 'ACTIVE',
        mfaEnabled: false,
        lastLoginAt: 'now',
        lastLoginIp: '127.0.0.1',
        createdAt: 'yesterday'
      }
    })

    const store = useAuthStore()
    await store.bootstrap()

    expect(authApi.refresh).toHaveBeenCalledWith('fake-refresh-token')
    expect(store.accessToken).toBe('new-token')
    expect(store.currentUser?.email).toBe('test@admin.com')
    expect(store.isAuthenticated).toBe(true)
  })

  it('handles forceLogout correctly', () => {
    const store = useAuthStore()
    store.accessToken = 'test-token'
    sessionStorage.setItem('securebank_bo_refresh', 'test-token')
    
    store.forceLogout('Session expired')

    expect(store.accessToken).toBeNull()
    expect(store.currentUser).toBeNull()
    expect(sessionStorage.getItem('securebank_bo_refresh')).toBeNull()
    expect(store.sessionNotice).toBe('Session expired')
  })
})