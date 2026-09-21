import axios from 'axios'

/**
 * FR-BO Section 15 / System Health: Spring Boot Actuator returns its own
 * envelope shape (not the SecureBank ApiResponse envelope) and lives outside
 * the /api/v1 base path, so it gets its own lightweight axios instance.
 *
 * In production (Docker), VITE_ACTUATOR_BASE_URL should point to the backend
 * origin, e.g. http://localhost:8081
 */
const actuator = axios.create({
  baseURL: import.meta.env.VITE_ACTUATOR_BASE_URL || '/',
  timeout: 5000,
})

export interface ActuatorHealth {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
  components?: Record<string, { status: string; details?: Record<string, unknown> }>
}

export const healthApi = {
  check: async (): Promise<ActuatorHealth> => {
    const { data } = await actuator.get<ActuatorHealth>('/actuator/health')
    return data
  },
}
