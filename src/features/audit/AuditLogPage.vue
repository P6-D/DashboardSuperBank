<script setup lang="ts">
import { ref } from 'vue'

import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import PaginationBar from '@/components/data-table/PaginationBar.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { adminApi } from '@/services/api/admin.api'
import type { AuditResult } from '@/types/domain'
import { formatDateTime, titleCase } from '@/utils/format'

/** FR-BO audit log viewer — FRD §14.1 filters (userId, eventType, date range). */
const page = ref(1)
const pageSize = 25
const userIdFilter = ref('')
const eventTypeFilter = ref('')

const { data, loading, error, requestId, refresh } = useAsyncData(
  () =>
    adminApi.getAuditLogs({
      userId: userIdFilter.value || undefined,
      eventType: eventTypeFilter.value || undefined,
      page: page.value,
      pageSize,
    }),
  { watch: [page, userIdFilter, eventTypeFilter] },
)

function resultTone(result: AuditResult) {
  if (result === 'SUCCESS') return 'success' as const
  if (result === 'BLOCKED') return 'warning' as const
  return 'danger' as const
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-3">
      <input
        v-model="userIdFilter"
        placeholder="Filter by user ID…"
        class="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
      />
      <input
        v-model="eventTypeFilter"
        placeholder="Filter by event type (e.g. LOGIN)…"
        class="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
      />
    </div>

    <Card :padded="false">
      <LoadingSkeleton v-if="loading" :rows="10" class="p-4" />
      <ErrorState v-else-if="error" :message="error" :request-id="requestId" class="m-4" @retry="refresh" />
      <EmptyState v-else-if="!data?.items.length" title="No audit events found" icon="search" />
      <template v-else>
        <table class="w-full text-left text-sm">
          <thead class="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <tr>
              <th class="px-4 py-3 font-medium">Event</th>
              <th class="px-4 py-3 font-medium">Result</th>
              <th class="px-4 py-3 font-medium">User</th>
              <th class="px-4 py-3 font-medium">IP</th>
              <th class="px-4 py-3 font-medium">Module</th>
              <th class="px-4 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-border)]">
            <tr v-for="log in data.items" :key="log.id">
              <td class="px-4 py-3 text-[var(--color-text-primary)]">{{ titleCase(log.eventType) }}</td>
              <td class="px-4 py-3"><StatusBadge :tone="resultTone(log.result)" :label="log.result" /></td>
              <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                {{ log.userId ?? log.adminId ?? '—' }}
              </td>
              <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                {{ log.ipAddress ?? '—' }}
              </td>
              <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                {{ log.securityModuleTriggered ?? '—' }}
              </td>
              <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                {{ formatDateTime(log.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar
          :page="data.page"
          :page-size="data.pageSize"
          :total-count="data.totalCount"
          :total-pages="data.totalPages"
          @update:page="page = $event"
        />
      </template>
    </Card>
  </div>
</template>
