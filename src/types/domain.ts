/**
 * Domain types mirroring backend *ResponseData DTOs exactly (field names,
 * enum value sets) — see backend/src/main/kotlin/com/securebank/backend/api/**.
 * Amounts are wire-format decimal strings (AmountFormat.toWire), not numbers.
 */

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'CLOSED'
export type UserRole = 'USER' | 'ADMIN'

export interface BackofficeUser {
  id: string
  fullName: string
  email: string
  phone: string
  status: UserStatus
  mfaEnabled: boolean
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
}

export interface DeviceSession {
  id: string
  deviceFingerprint: string
  deviceName: string | null
  deviceOs: string | null
  deviceOsVersion: string | null
  appVersion: string | null
  ipAddress: string | null
  isTrusted: boolean
  lastActiveAt: string
  createdAt: string
}

export type AuditResult = 'SUCCESS' | 'FAILURE' | 'BLOCKED'

export interface AuditLogEntry {
  id: string
  userId: string | null
  adminId: string | null
  eventType: string
  eventData: string | null
  ipAddress: string | null
  deviceFingerprint: string | null
  result: AuditResult
  securityModuleTriggered: string | null
  createdAt: string
}

export type FraudType = 'UNAUTHORIZED' | 'WRONG_AMOUNT' | 'DUPLICATE' | 'PHISHING' | 'OTHER'
export type FraudCaseStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'

export interface FraudCase {
  id: string
  transactionId: string
  reportedByUserId: string
  fraudType: FraudType
  description: string
  status: FraudCaseStatus
  assignedToAdminId: string | null
  resolutionNote: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface SecurityModule {
  moduleId: string
  moduleName: string
  enabled: boolean
  config: string | null
  lastModifiedBy: string | null
  lastModifiedAt: string
}

export interface AttackSimulationResult {
  simulationId: string
  attackType: string
  target: string
  status: string
  detected: boolean
  responseTimeMs: number
  triggeredModule: string | null
}

export interface SecurityEvent {
  id: string
  eventType: string
  result: AuditResult
  securityModuleTriggered: string | null
  userId: string | null
  ipAddress: string | null
  createdAt: string
}

export type ScanStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface ScanTriggerResult {
  scanId: string
  status: ScanStatus | string
  message: string
}

/** ATTACK_TYPES from SecurityPanelService.kt — the only values the backend accepts. */
export const ATTACK_TYPES = [
  'sql_injection',
  'brute_force',
  'token_replay',
  'mitm',
  'session_fixation',
  'xss',
  'race_condition',
  'frida_hooking',
  'root_device_login',
  'credential_stuffing',
  'qr_token_replay',
  'idor',
] as const

export type AttackType = (typeof ATTACK_TYPES)[number]

export const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  sql_injection: 'SQL Injection',
  brute_force: 'Brute Force Login',
  token_replay: 'JWT Token Replay',
  mitm: 'Man-in-the-Middle Simulation',
  session_fixation: 'Session Fixation',
  xss: 'XSS Payload',
  race_condition: 'Race Condition / Double Spend',
  frida_hooking: 'Frida Hooking Simulation',
  root_device_login: 'Root Device Login',
  credential_stuffing: 'Credential Stuffing',
  qr_token_replay: 'QR Token Replay',
  idor: 'IDOR',
}

export interface CurrentUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  mfaEnabled: boolean
}
