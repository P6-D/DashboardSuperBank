<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UnavailableFeature from '@/components/ui/UnavailableFeature.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useNotificationStore } from '@/stores/notification.store'
import { authApi } from '@/services/api/auth.api'
import { ApiClientError } from '@/types/api'
import { formatDateTime } from '@/utils/format'

/**
 * FR-BO-030..032 (FRD §7.4 "Devices & Sessions" for arbitrary users): the
 * backend's /auth/devices only returns sessions for the *caller* (see
 * AuthController.kt listDevices — uses @AuthenticationPrincipal, no userId
 * path param). There is no admin-scoped cross-user session listing/revoke
 * endpoint. This page therefore shows the signed-in admin's own device
 * sessions (a real, working feature) plus an explicit notice about the
 * missing cross-user capability, rather than mocking other users' sessions.
 */
const { data, loading, error, requestId, refresh } = useAsyncData(() => authApi.listDevices())
const notifications = useNotificationStore()

async function revoke(deviceId: string) {
  try {
    await authApi.revokeDevice(deviceId)
    notifications.success('Device session revoked')
    refresh()
  } catch (err) {
    notifications.error('Failed to revoke device', err instanceof ApiClientError ? err.message : undefined)
  }
}
</script>

<template>
  <div class="space-y-6">
    <UnavailableFeature
      title="Cross-user session management"
      reason="The backend's device/session endpoints only operate on the currently authenticated caller (no admin-scoped userId parameter or cross-user revoke exists). Only the signed-in admin's own sessions can be viewed and revoked below."
      required-endpoint="GET/DELETE /admin/users/{userId}/sessions (not implemented)"
    />

    <Card :padded="false">
      <h2
        class="border-b border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Your Device Sessions
      </h2>
      <LoadingSkeleton v-if="loading" :rows="4" class="p-4" />
      <ErrorState v-else-if="error" :message="error" :request-id="requestId" class="m-4" @retry="refresh" />
      <table v-else-if="data?.length" class="w-full text-left text-sm">
        <thead class="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <tr>
            <th class="px-4 py-3 font-medium">Device</th>
            <th class="px-4 py-3 font-medium">OS</th>
            <th class="px-4 py-3 font-medium">IP</th>
            <th class="px-4 py-3 font-medium">Trusted</th>
            <th class="px-4 py-3 font-medium">Last Active</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border)]">
          <tr v-for="session in data" :key="session.id">
            <td class="px-4 py-3 text-[var(--color-text-primary)]">
              {{ session.deviceName ?? 'Unknown device' }}
            </td>
            <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              {{ session.deviceOs ?? '—' }} {{ session.deviceOsVersion ?? '' }}
            </td>
            <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
              {{ session.ipAddress ?? '—' }}
            </td>
            <td class="px-4 py-3">
              <StatusBadge
                :tone="session.isTrusted ? 'success' : 'neutral'"
                :label="session.isTrusted ? 'Trusted' : 'Untrusted'"
              />
            </td>
            <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              {{ formatDateTime(session.lastActiveAt) }}
            </td>
            <td class="px-4 py-3 text-right">
              <Button size="sm" variant="danger" @click="revoke(session.id)">Revoke</Button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="p-6 text-center text-sm text-[var(--color-text-muted)]">No active device sessions.</p>
    </Card>
  </div>
</template>
