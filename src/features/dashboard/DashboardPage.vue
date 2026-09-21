<script setup lang="ts">
import { computed } from 'vue'

import KpiCard from '@/components/ui/KpiCard.vue'
import Card from '@/components/ui/Card.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { adminApi } from '@/services/api/admin.api'
import { securityApi } from '@/services/api/security.api'
import { formatRelativeTime, titleCase } from '@/utils/format'

/** FRD §13 Dashboard — assembled from real backend endpoints only (no fabricated global metrics). */
const users = useAsyncData(() => adminApi.listUsers(1, 1))
const fraudCases = useAsyncData(() => adminApi.listFraudCases(1, 5))
const securityEvents = useAsyncData(() => securityApi.recentEvents(8))
const securityModules = useAsyncData(() => securityApi.listModules())

const totalUsers = computed(() => users.data.value?.totalCount ?? null)
const openFraudCount = computed(
  () => fraudCases.data.value?.items.filter((c) => c.status === 'OPEN').length ?? null,
)
const enabledModulesCount = computed(
  () => securityModules.data.value?.filter((m) => m.enabled).length ?? null,
)
const totalModulesCount = computed(() => securityModules.data.value?.length ?? null)
const blockedEventsCount = computed(
  () => securityEvents.data.value?.filter((e) => e.result === 'BLOCKED').length ?? null,
)

function resultTone(result: string) {
  if (result === 'SUCCESS') return 'success' as const
  if (result === 'BLOCKED') return 'warning' as const
  return 'danger' as const
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total Users" :value="totalUsers === null ? '—' : totalUsers.toLocaleString()" />
      <KpiCard
        label="Open Fraud Cases"
        :value="openFraudCount === null ? '—' : String(openFraudCount)"
        :tone="openFraudCount ? 'warning' : 'default'"
      />
      <KpiCard
        label="Security Modules Enabled"
        :value="enabledModulesCount === null ? '—' : `${enabledModulesCount}/${totalModulesCount}`"
      />
      <KpiCard
        label="Blocked Events (recent)"
        :value="blockedEventsCount === null ? '—' : String(blockedEventsCount)"
        :tone="blockedEventsCount ? 'danger' : 'default'"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[var(--color-text-primary)]">Recent Security Events</h2>
          <RouterLink
            :to="{ name: 'security-events' }"
            class="text-xs text-[var(--color-accent)] hover:underline"
          >
            View all
          </RouterLink>
        </div>
        <LoadingSkeleton v-if="securityEvents.loading.value" :rows="6" height="2.25rem" />
        <ErrorState
          v-else-if="securityEvents.error.value"
          :message="securityEvents.error.value"
          :request-id="securityEvents.requestId.value"
          @retry="securityEvents.refresh"
        />
        <ul v-else-if="securityEvents.data.value?.length" class="divide-y divide-[var(--color-border)]">
          <li
            v-for="event in securityEvents.data.value"
            :key="event.id"
            class="flex items-center justify-between py-2.5"
          >
            <div>
              <p class="text-sm text-[var(--color-text-primary)]">{{ titleCase(event.eventType) }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">{{ formatRelativeTime(event.createdAt) }}</p>
            </div>
            <StatusBadge :tone="resultTone(event.result)" :label="event.result" />
          </li>
        </ul>
        <p v-else class="py-6 text-center text-sm text-[var(--color-text-muted)]">
          No recent security events.
        </p>
      </Card>

      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[var(--color-text-primary)]">Open Fraud Cases</h2>
          <RouterLink :to="{ name: 'fraud' }" class="text-xs text-[var(--color-accent)] hover:underline">
            View queue
          </RouterLink>
        </div>
        <LoadingSkeleton v-if="fraudCases.loading.value" :rows="4" height="2.5rem" />
        <ErrorState
          v-else-if="fraudCases.error.value"
          :message="fraudCases.error.value"
          :request-id="fraudCases.requestId.value"
          @retry="fraudCases.refresh"
        />
        <ul v-else-if="fraudCases.data.value?.items.length" class="space-y-2">
          <li
            v-for="fraudCase in fraudCases.data.value.items"
            :key="fraudCase.id"
            class="rounded-lg border border-[var(--color-border)] p-2.5"
          >
            <p class="text-xs font-medium text-[var(--color-text-primary)]">
              {{ titleCase(fraudCase.fraudType) }}
            </p>
            <p class="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
              {{ fraudCase.description }}
            </p>
          </li>
        </ul>
        <p v-else class="py-6 text-center text-sm text-[var(--color-text-muted)]">No open fraud cases.</p>
      </Card>
    </div>
  </div>
</template>
