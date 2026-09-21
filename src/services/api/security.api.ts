import { http, unwrap } from './http'
import type { ApiResponse } from '@/types/api'
import type { AttackSimulationResult, ScanTriggerResult, SecurityEvent, SecurityModule } from '@/types/domain'

/** Mirrors backend SecurityPanelController.kt / SecurityPanelDtos.kt exactly. */
export const securityApi = {
  listModules: () => unwrap(http.get<ApiResponse<SecurityModule[]>>('/security/modules')),

  toggleModule: (moduleName: string, enabled: boolean, config?: Record<string, unknown>) =>
    unwrap(http.patch<ApiResponse<SecurityModule>>(`/security/modules/${moduleName}`, { enabled, config })),

  simulateAttack: (attackType: string, target: string) =>
    unwrap(http.post<ApiResponse<AttackSimulationResult>>('/security/simulate', { attackType, target })),

  recentEvents: (limit = 50) =>
    unwrap(http.get<ApiResponse<SecurityEvent[]>>('/security/events', { params: { limit } })),

  triggerScan: (targetUrl?: string) =>
    unwrap(http.post<ApiResponse<ScanTriggerResult>>('/security/scan/trigger', { targetUrl })),
}
