<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { usePermissionStore } from '@/stores/permission.store'
import { useNotificationStore } from '@/stores/notification.store'
import { adminApi } from '@/services/api/admin.api'
import type { UserStatus } from '@/types/domain'
import { ApiClientError } from '@/types/api'
import { formatDateTime, titleCase } from '@/utils/format'

const props = defineProps<{ userId: string }>()
const router = useRouter()
const permissions = usePermissionStore()
const notifications = useNotificationStore()

const { data: user, loading, error, requestId, refresh } = useAsyncData(() => adminApi.getUser(props.userId))

const statusOptions: UserStatus[] = ['ACTIVE', 'LOCKED', 'SUSPENDED', 'CLOSED']
const statusDialogOpen = ref(false)
const pendingStatus = ref<UserStatus | null>(null)
const statusSubmitting = ref(false)

const deleteDialogOpen = ref(false)
const deleteSubmitting = ref(false)

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

function openStatusDialog(status: UserStatus) {
  pendingStatus.value = status
  statusDialogOpen.value = true
}

/** FRD §7.5 "requires reason, confirmation, audit event" for status changes. */
async function onConfirmStatusChange(reason: string | undefined) {
  if (!pendingStatus.value) return
  statusSubmitting.value = true
  try {
    await adminApi.updateUserStatus(props.userId, pendingStatus.value)
    notifications.success('Status updated', `${reason ?? ''}`.trim() || undefined)
    statusDialogOpen.value = false
    refresh()
  } catch (err) {
    notifications.error('Failed to update status', err instanceof ApiClientError ? err.message : undefined)
  } finally {
    statusSubmitting.value = false
  }
}

async function onConfirmDelete() {
  deleteSubmitting.value = true
  try {
    await adminApi.softDeleteUser(props.userId)
    notifications.success('User soft-deleted')
    deleteDialogOpen.value = false
    router.push({ name: 'users' })
  } catch (err) {
    notifications.error('Failed to delete user', err instanceof ApiClientError ? err.message : undefined)
  } finally {
    deleteSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <LoadingSkeleton v-if="loading" :rows="6" />
    <ErrorState v-else-if="error" :message="error" :request-id="requestId" @retry="refresh" />
    <template v-else-if="user">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">{{ user.fullName }}</h2>
          <p class="font-mono text-xs text-[var(--color-text-muted)]">{{ user.id }}</p>
        </div>
        <StatusBadge :tone="statusTone(user.status)" :label="titleCase(user.status)" />
      </div>

      <Card>
        <h3 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Details</h3>
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-xs text-[var(--color-text-muted)]">Email</dt>
            <dd class="font-mono text-[var(--color-text-secondary)]">{{ user.email }}</dd>
          </div>
          <div>
            <dt class="text-xs text-[var(--color-text-muted)]">Phone</dt>
            <dd class="text-[var(--color-text-secondary)]">{{ user.phone }}</dd>
          </div>
          <div>
            <dt class="text-xs text-[var(--color-text-muted)]">MFA</dt>
            <dd>
              <StatusBadge
                :tone="user.mfaEnabled ? 'success' : 'neutral'"
                :label="user.mfaEnabled ? 'Enabled' : 'Disabled'"
              />
            </dd>
          </div>
          <div>
            <dt class="text-xs text-[var(--color-text-muted)]">Created</dt>
            <dd class="text-[var(--color-text-secondary)]">{{ formatDateTime(user.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-[var(--color-text-muted)]">Last Login</dt>
            <dd class="text-[var(--color-text-secondary)]">{{ formatDateTime(user.lastLoginAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-[var(--color-text-muted)]">Last Login IP</dt>
            <dd class="font-mono text-[var(--color-text-secondary)]">{{ user.lastLoginIp ?? '—' }}</dd>
          </div>
        </dl>
      </Card>
      <Card v-if="permissions.can('users.update_status') || permissions.can('users.soft_delete')">
        <h3 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Administrative Actions</h3>
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="permissions.can('users.update_status')">
            <Button
              v-for="status in statusOptions.filter((s) => s !== user!.status)"
              :key="status"
              size="sm"
              variant="secondary"
              @click="openStatusDialog(status)"
            >
              Set {{ titleCase(status) }}
            </Button>
          </template>
          <Button
            v-if="permissions.can('users.soft_delete')"
            size="sm"
            variant="danger"
            @click="deleteDialogOpen = true"
          >
            Soft-delete User
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        :open="statusDialogOpen"
        title="Change user status"
        :description="`This will set the account status to ${pendingStatus ? titleCase(pendingStatus) : ''}. This action is recorded in the audit log.`"
        confirm-label="Change status"
        variant="primary"
        require-reason
        :loading="statusSubmitting"
        @close="statusDialogOpen = false"
        @confirm="onConfirmStatusChange"
      />

      <ConfirmDialog
        :open="deleteDialogOpen"
        title="Soft-delete user"
        description="This marks the account as deleted (deletedAt is set). The record is retained for audit purposes. This action is recorded in the audit log."
        confirm-label="Soft-delete"
        variant="danger"
        :loading="deleteSubmitting"
        @close="deleteDialogOpen = false"
        @confirm="onConfirmDelete"
      />
    </template>
  </div>
</template>
