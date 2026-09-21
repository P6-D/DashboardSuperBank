<script setup lang="ts">
import { ref } from 'vue'

import Card from '@/components/ui/Card.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { usePermissionStore } from '@/stores/permission.store'
import { useNotificationStore } from '@/stores/notification.store'
import { securityApi } from '@/services/api/security.api'
import type { SecurityModule } from '@/types/domain'
import { ApiClientError } from '@/types/api'
import { formatDateTime } from '@/utils/format'

/** FR-BE-024 Module Toggle — FRD §7.6/§15 "requires confirmation + reason + audit event for critical modules". */
const { data, loading, error, requestId, refresh } = useAsyncData(() => securityApi.listModules())
const permissions = usePermissionStore()
const notifications = useNotificationStore()

const pendingModule = ref<SecurityModule | null>(null)
const submitting = ref(false)

function requestToggle(module: SecurityModule) {
  pendingModule.value = module
}

async function onConfirmToggle(reason: string | undefined) {
  if (!pendingModule.value) return
  submitting.value = true
  try {
    await securityApi.toggleModule(pendingModule.value.moduleName, !pendingModule.value.enabled)
    notifications.success(
      `${pendingModule.value.moduleName} ${pendingModule.value.enabled ? 'disabled' : 'enabled'}`,
      reason,
    )
    pendingModule.value = null
    refresh()
  } catch (err) {
    notifications.error('Failed to toggle module', err instanceof ApiClientError ? err.message : undefined)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <LoadingSkeleton v-if="loading" :rows="6" />
    <ErrorState v-else-if="error" :message="error" :request-id="requestId" @retry="refresh" />
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card v-for="module in data" :key="module.moduleId">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-[var(--color-text-primary)]">{{ module.moduleName }}</p>
            <p class="mt-0.5 font-mono text-xs text-[var(--color-text-muted)]">{{ module.moduleId }}</p>
          </div>
          <StatusBadge
            :tone="module.enabled ? 'success' : 'neutral'"
            :label="module.enabled ? 'Enabled' : 'Disabled'"
          />
        </div>
        <p class="mt-3 text-xs text-[var(--color-text-secondary)]">
          Last modified {{ formatDateTime(module.lastModifiedAt) }}
          <span v-if="module.lastModifiedBy" class="font-mono">by {{ module.lastModifiedBy }}</span>
        </p>
        <button
          v-if="permissions.can('security.modules.update')"
          class="focus-ring mt-4 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-surface-2)]"
          :class="module.enabled ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'"
          @click="requestToggle(module)"
        >
          {{ module.enabled ? 'Disable module' : 'Enable module' }}
        </button>
      </Card>
    </div>

    <ConfirmDialog
      :open="!!pendingModule"
      :title="`${pendingModule?.enabled ? 'Disable' : 'Enable'} ${pendingModule?.moduleName ?? ''}`"
      description="Toggling a security module affects live protection behavior in this environment. This action is recorded in the audit log."
      confirm-label="Confirm"
      variant="danger"
      require-reason
      :loading="submitting"
      @close="pendingModule = null"
      @confirm="onConfirmToggle"
    />
  </div>
</template>
