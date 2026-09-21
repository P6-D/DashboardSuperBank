import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import applyCaseMiddleware from 'axios-case-converter'

import type { ApiResponse } from '@/types/api'
import { ApiClientError } from '@/types/api'
import { useAuthStore } from '@/stores/auth.store'

/**
 * FRD §7.1 base path convention (`/api/v1/**`) and §11.4 request correlation.
 * Base URL is empty so requests go through the Vite dev proxy (`/api` ->
 * `http://localhost:8080`) in dev, and same-origin in a reverse-proxied
 * deployment — see vite.config.ts.
 */
const _http = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// FR-BE-001/027: The backend uses Jackson SNAKE_CASE globally. This middleware
// converts outgoing bodies/params to snake_case and incoming responses to camelCase
// transparently, allowing the frontend to keep idiomatic camelCase everywhere.
export const http = applyCaseMiddleware(_http, {
  ignoreHeaders: true, // Let Axios handle Authorization/headers correctly
})

let refreshPromise: Promise<string | null> | null = null

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.set('Authorization', `Bearer ${auth.accessToken}`)
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const auth = useAuthStore()

    // FR-BO-003: attempt a single silent refresh on 401 before forcing re-auth.
    if (status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true
      try {
        refreshPromise ??= auth.refreshSession()
        const newToken = await refreshPromise
        refreshPromise = null
        if (newToken) {
          original.headers.set('Authorization', `Bearer ${newToken}`)
          return http(original)
        }
      } catch {
        refreshPromise = null
      }
      auth.forceLogout('Your session expired. Please sign in again.')
    }

    const body = error.response?.data
    const message = body?.message || error.message || 'Request failed'
    const requestId = body?.metadata?.requestId
    throw new ApiClientError(message, status ?? 0, requestId)
  },
)

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  if (data.status !== 'success') {
    throw new ApiClientError(data.message, data.code, data.metadata?.requestId)
  }
  return data.data as T
}
