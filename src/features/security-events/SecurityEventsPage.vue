<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { securityApi } from '@/services/api/security.api'
import type { AuditResult } from '@/types/domain'
import { formatDateTime, titleCase } from '@/utils/format'

/**
 * FR-BE-026 exposes a polled snapshot, not SSE/WebSocket streaming (FRD §16
 * specifies live push) — see backend README §5.7. This page polls on an
 * interval as the closest honest approximation instead of faking a live feed.
 */
const limit = ref(50)
const { data, loading, error, requestId, refresh } = useAsyncData(() => securityApi.recentEvents(limit.value))

const pollTimer = setInterval(refresh, 15000)
onUnmounted(() => clearInterval(pollTimer))

function resultTone(result: AuditResult) {
  if (result === 'SUCCESS') return 'success' as const
  if (result === 'BLOCKED') return 'warning' as const
  return 'danger' as const
}
</script>

<template>
  <Card :padded="false">
    <div class="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
      <p class="text-xs text-[var(--color-text-muted)]">
        Polled every 15s (backend exposes a snapshot endpoint, not a live stream).
      </p>
      <Button size="sm" variant="ghost" @click="refresh">Refresh now</Button>
    </div>
    <LoadingSkeleton v-if="loading && !data" :rows="8" class="p-4" />
    <ErrorState v-else-if="error" :message="error" :request-id="requestId" class="m-4" @retry="refresh" />
    <EmptyState v-else-if="!data?.length" title="No recent security events" icon="search" />
    <table v-else class="w-full text-left text-sm">
      <thead class="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <tr>
          <th class="px-4 py-3 font-medium">Event</th>
          <th class="px-4 py-3 font-medium">Result</th>
          <th class="px-4 py-3 font-medium">Module</th>
          <th class="px-4 py-3 font-medium">User</th>
          <th class="px-4 py-3 font-medium">IP</th>
          <th class="px-4 py-3 font-medium">Time</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--color-border)]">
        <tr v-for="event in data" :key="event.id">
          <td class="px-4 py-3 text-[var(--color-text-primary)]">{{ titleCase(event.eventType) }}</td>
          <td class="px-4 py-3"><StatusBadge :tone="resultTone(event.result)" :label="event.result" /></td>
          <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
            {{ event.securityModuleTriggered ?? '—' }}
          </td>
          <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
            {{ event.userId ?? '—' }}
          </td>
          <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
            {{ event.ipAddress ?? '—' }}
          </td>
          <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
            {{ formatDateTime(event.createdAt) }}
          </td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>
