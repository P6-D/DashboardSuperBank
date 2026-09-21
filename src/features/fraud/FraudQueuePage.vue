<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import PaginationBar from '@/components/data-table/PaginationBar.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { usePermissionStore } from '@/stores/permission.store'
import { useNotificationStore } from '@/stores/notification.store'
import { adminApi } from '@/services/api/admin.api'
import type { FraudCase, FraudCaseStatus } from '@/types/domain'
import { ApiClientError } from '@/types/api'
import { formatDateTime, titleCase } from '@/utils/format'

/** FR-BO fraud queue — FRD §7.7/§14.2 "Resolution requires resolution note, analyst identity, timestamp". */
const page = ref(1)
const pageSize = 20
const permissions = usePermissionStore()
const notifications = useNotificationStore()

const { data, loading, error, requestId, refresh } = useAsyncData(
  () => adminApi.listFraudCases(page.value, pageSize),
  { watch: [page] },
)

const resolveTarget = ref<FraudCase | null>(null)
const resolveSubmitting = ref(false)

function statusTone(status: FraudCaseStatus) {
  switch (status) {
    case 'RESOLVED':
      return 'success' as const
    case 'DISMISSED':
      return 'neutral' as const
    case 'UNDER_REVIEW':
      return 'info' as const
    default:
      return 'warning' as const
  }
}

async function onConfirmResolve(reason: string | undefined) {
  if (!resolveTarget.value) return
  resolveSubmitting.value = true
  try {
    await adminApi.resolveFraudCase(resolveTarget.value.id, reason)
    notifications.success('Fraud case resolved')
    resolveTarget.value = null
    refresh()
  } catch (err) {
    notifications.error('Failed to resolve case', err instanceof ApiClientError ? err.message : undefined)
  } finally {
    resolveSubmitting.value = false
  }
}

async function markUnderReview(fraudCase: FraudCase) {
  try {
    await adminApi.updateFraudCase(fraudCase.id, 'UNDER_REVIEW')
    notifications.success('Case marked under review')
    refresh()
  } catch (err) {
    notifications.error('Failed to update case', err instanceof ApiClientError ? err.message : undefined)
  }
}
</script>

<template>
  <Card :padded="false">
    <LoadingSkeleton v-if="loading" :rows="8" class="p-4" />
    <ErrorState v-else-if="error" :message="error" :request-id="requestId" class="m-4" @retry="refresh" />
    <EmptyState v-else-if="!data?.items.length" title="No fraud cases" icon="search" />
    <template v-else>
      <table class="w-full text-left text-sm">
        <thead class="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <tr>
            <th class="px-4 py-3 font-medium">Type</th>
            <th class="px-4 py-3 font-medium">Description</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium">Reported</th>
            <th class="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border)]">
          <tr v-for="fraudCase in data.items" :key="fraudCase.id">
            <td class="px-4 py-3 text-[var(--color-text-primary)]">{{ titleCase(fraudCase.fraudType) }}</td>
            <td class="max-w-xs truncate px-4 py-3 text-[var(--color-text-secondary)]">
              {{ fraudCase.description }}
            </td>
            <td class="px-4 py-3">
              <StatusBadge :tone="statusTone(fraudCase.status)" :label="titleCase(fraudCase.status)" />
            </td>
            <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              {{ formatDateTime(fraudCase.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div v-if="permissions.can('fraud.resolve')" class="flex gap-2">
                <Button
                  v-if="fraudCase.status === 'OPEN'"
                  size="sm"
                  variant="secondary"
                  @click="markUnderReview(fraudCase)"
                >
                  Review
                </Button>
                <Button
                  v-if="fraudCase.status !== 'RESOLVED' && fraudCase.status !== 'DISMISSED'"
                  size="sm"
                  variant="primary"
                  @click="resolveTarget = fraudCase"
                >
                  Resolve
                </Button>
              </div>
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

    <ConfirmDialog
      :open="!!resolveTarget"
      title="Resolve fraud case"
      description="This closes the case as resolved. A resolution note is required and recorded in the audit log alongside your identity and timestamp."
      confirm-label="Resolve case"
      variant="primary"
      require-reason
      :loading="resolveSubmitting"
      @close="resolveTarget = null"
      @confirm="onConfirmResolve"
    />
  </Card>
</template>
