import { http, unwrap } from './http'
import type { ApiResponse } from '@/types/api'
import type { DeviceSession } from '@/types/domain'

/** Mirrors backend AuthDtos.kt / AuthController.kt exactly. */
export interface LoginRequest {
  email: string
  password: string
  deviceFingerprint?: string
  deviceName?: string
  deviceOs?: string
  deviceOsVersion?: string
  appVersion?: string
}

export interface UserResponseData {
  id: string
  fullName: string
  email: string
  phone: string
  status: string
  mfaEnabled: boolean
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
}

export interface LoginResponseData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  mfaRequired: boolean
  mfaToken?: string | null
  user?: UserResponseData | null
}

export const authApi = {
  login: (payload: LoginRequest) => unwrap(http.post<ApiResponse<LoginResponseData>>('/auth/login', payload)),

  verifyMfa: (payload: { token: string; mfaCode: string }) =>
    unwrap(http.post<ApiResponse<LoginResponseData>>('/auth/mfa/verify', payload)),

  refresh: (refreshToken: string) =>
    unwrap(http.post<ApiResponse<LoginResponseData>>('/auth/refresh', { refreshToken })),

  logout: (refreshToken?: string) =>
    unwrap(http.post<ApiResponse<void>>('/auth/logout', refreshToken ? { refreshToken } : {})),

  listDevices: () => unwrap(http.get<ApiResponse<DeviceSession[]>>('/auth/devices')),

  revokeDevice: (deviceId: string) => unwrap(http.delete<ApiResponse<void>>(`/auth/devices/${deviceId}`)),
}
