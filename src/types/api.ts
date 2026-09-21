/**
 * Mirrors backend/src/main/kotlin/com/securebank/backend/common/ApiEnvelope.kt
 * and ApiException.kt (FRD §11.2 response envelope, §17.1 error categories).
 */
export interface ResponseMetadata {
  requestId: string
  timestamp: string
  version: string
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  code: number
  message: string
  data: T | null
  metadata?: ResponseMetadata
}

export interface PaginatedData<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

/** Normalized client-side error shape surfaced to the UI (FRD §17.2). */
export class ApiClientError extends Error {
  readonly code: number
  readonly requestId?: string

  constructor(message: string, code: number, requestId?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.requestId = requestId
  }
}
