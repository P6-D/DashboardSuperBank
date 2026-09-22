import { http, unwrap } from './http'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { AuditLogEntry, BackofficeUser, FraudCase, UserStatus } from '@/types/domain'

/** Mirrors backend AdminController.kt / AdminDtos.kt / AdminService.kt exactly. */
export const adminApi = {
  listUsers: (page: number, pageSize: number) =>
    unwrap(
      http.get<ApiResponse<PaginatedData<BackofficeUser>>>('/admin/users', {
        params: { page, pageSize },
      }),
    ),

  getUser: (userId: string) => unwrap(http.get<ApiResponse<BackofficeUser>>(`/admin/users/${userId}`)),

  updateUserStatus: (userId: string, status: UserStatus) =>
    unwrap(http.patch<ApiResponse<BackofficeUser>>(`/admin/users/${userId}/status`, { status })),

  softDeleteUser: (userId: string) => unwrap(http.delete<ApiResponse<void>>(`/admin/users/${userId}`)),

  getAuditLogs: (params: {
    userId?: string
    eventType?: string
    startDate?: string
    endDate?: string
    page: number
    pageSize: number
  }) => unwrap(http.get<ApiResponse<PaginatedData<AuditLogEntry>>>('/admin/audit-logs', { params })),

  listFraudCases: (page: number, pageSize: number) =>
    unwrap(
      http.get<ApiResponse<PaginatedData<FraudCase>>>('/admin/fraud-cases', {
        params: { page, pageSize },
      }),
    ),

  getUserAccounts: (userId: string) =>
    unwrap(http.get<ApiResponse<any[]>>(`/admin/users/${userId}/accounts`)),

  addBalance: (userId: string, accountId: string, amount: string, description?: string) =>
    unwrap(
      http.post<ApiResponse<any>>(`/admin/users/${userId}/accounts/${accountId}/add-balance`, {
        amount,
        description,
      }),
    ),

  updateFraudCase: (caseId: string, status: string, resolutionNote?: string) =>
    unwrap(http.patch<ApiResponse<FraudCase>>(`/admin/fraud-cases/${caseId}`, { status, resolutionNote })),

  resolveFraudCase: (caseId: string, resolutionNote?: string) =>
    unwrap(http.post<ApiResponse<FraudCase>>(`/admin/fraud-cases/${caseId}/resolve`, { resolutionNote })),
}
