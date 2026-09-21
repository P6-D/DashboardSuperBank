<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UnavailableFeature from '@/components/ui/UnavailableFeature.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { healthApi } from '@/services/api/health.api'

/** FR-BO Service Health — backed by real Spring Boot Actuator /actuator/health. */
const { data, loading, error, requestId, refresh } = useAsyncData(() => healthApi.check())

function statusTone(status: string) {
  if (status === 'UP') return 'success' as const
  if (status === 'DOWN') return 'danger' as const
  return 'neutral' as const
}
</script>

<template>
  <div class="space-y-6">
    <LoadingSkeleton v-if="loading" :rows="4" />
    <ErrorState v-else-if="error" :message="error" :request-id="requestId" @retry="refresh" />
    <template v-else-if="data">
      <Card>
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[var(--color-text-primary)]">Overall Status</h2>
          <StatusBadge :tone="statusTone(data.status)" :label="data.status" />
        </div>
      </Card>

      <Card v-if="data.components">
        <h2 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Components</h2>
        <ul class="divide-y divide-[var(--color-border)]">
          <li
            v-for="(component, name) in data.components"
            :key="name"
            class="flex items-center justify-between py-2.5"
          >
            <span class="text-sm text-[var(--color-text-primary)]">{{ name }}</span>
            <StatusBadge :tone="statusTone(component.status)" :label="component.status" />
          </li>
        </ul>
      </Card>
    </template>

    <UnavailableFeature
      title="API Health / Configuration / detailed uptime metrics"
      reason="Only Spring Boot Actuator's aggregate /actuator/health endpoint is exposed by the backend. There is no per-endpoint API health matrix, request-rate dashboard, or runtime configuration editor API."
      required-endpoint="GET /actuator/metrics, /admin/config (not implemented)"
    />
  </div>
</template>
