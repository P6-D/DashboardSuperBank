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
import type { UserStatus } from '@/types/domain'
import { formatDateTime, titleCase } from '@/utils/format'

/** FR-BO-006/007 (Users list) — FRD §7.2. */
const page = ref(1)
const pageSize = 20

const { data, loading, error, requestId, refresh } = useAsyncData(
  () => adminApi.listUsers(page.value, pageSize),
  { watch: [page] },
)

function statusTone(status: UserStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const
    case 'LOCKED':
    case 'SUSPENDED':
      return 'danger' as const
    case 'PENDING_VERIFICATION':
      return 'warning' as const
    default:
      return 'neutral' as const
  }
}
</script>

<template>
  <Card :padded="false">
    <LoadingSkeleton v-if="loading" :rows="8" class="p-4" />
    <ErrorState v-else-if="error" :message="error" :request-id="requestId" class="m-4" @retry="refresh" />
    <EmptyState v-else-if="!data?.items.length" title="No users found" icon="search" />
    <template v-else>
      <table class="w-full text-left text-sm">
        <thead class="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <tr>
            <th class="px-4 py-3 font-medium">Name</th>
            <th class="px-4 py-3 font-medium">Email</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium">MFA</th>
            <th class="px-4 py-3 font-medium">Last Login</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border)]">
          <tr
            v-for="user in data.items"
            :key="user.id"
            class="cursor-pointer hover:bg-[var(--color-surface-2)]"
            @click="$router.push({ name: 'user-detail', params: { userId: user.id } })"
          >
            <td class="px-4 py-3 text-[var(--color-text-primary)]">{{ user.fullName }}</td>
            <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">{{ user.email }}</td>
            <td class="px-4 py-3">
              <StatusBadge :tone="statusTone(user.status)" :label="titleCase(user.status)" />
            </td>
            <td class="px-4 py-3">
              <StatusBadge
                :tone="user.mfaEnabled ? 'success' : 'neutral'"
                :label="user.mfaEnabled ? 'Enabled' : 'Disabled'"
              />
            </td>
            <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              {{ formatDateTime(user.lastLoginAt) }}
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
</template>
