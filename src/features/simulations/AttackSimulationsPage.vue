<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useEnvironmentStore } from '@/stores/environment.store'
import { useNotificationStore } from '@/stores/notification.store'
import { securityApi } from '@/services/api/security.api'
import {
  ATTACK_TYPES,
  ATTACK_TYPE_LABELS,
  type AttackSimulationResult,
  type AttackType,
} from '@/types/domain'
import { ApiClientError } from '@/types/api'

/**
 * FR-BE-025 Attack Simulation Trigger — FRD §20.2/§20.3 environment gating +
 * confirmation before executing. This is a red-team-style testbed tool, not
 * available in production-like environments (see environment.store.ts).
 */
const environment = useEnvironmentStore()
const notifications = useNotificationStore()

const attackType = ref<AttackType>('sql_injection')
const target = ref('/api/v1/auth/login')
const submitting = ref(false)
const results = ref<AttackSimulationResult[]>([])
const confirmOpen = ref(false)

async function onConfirmRun() {
  submitting.value = true
  try {
    const result = await securityApi.simulateAttack(attackType.value, target.value)
    results.value = [result, ...results.value].slice(0, 20)
    notifications.success(
      'Simulation completed',
      `${ATTACK_TYPE_LABELS[attackType.value]} against ${target.value}`,
    )
    confirmOpen.value = false
  } catch (err) {
    notifications.error('Simulation failed', err instanceof ApiClientError ? err.message : undefined)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="!environment.simulationsAvailable"
      class="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]"
    >
      Attack simulations are disabled in the {{ environment.current }} environment.
    </div>

    <Card>
      <h2 class="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Run Simulation</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]" for="attack-type"
            >Attack type</label
          >
          <select
            id="attack-type"
            v-model="attackType"
            class="focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          >
            <option v-for="type in ATTACK_TYPES" :key="type" :value="type">
              {{ ATTACK_TYPE_LABELS[type] }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]" for="target"
            >Target</label
          >
          <input
            id="target"
            v-model="target"
            class="focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)]"
          />
        </div>
      </div>
      <Button
        class="mt-4"
        variant="danger"
        :disabled="!environment.simulationsAvailable"
        @click="confirmOpen = true"
      >
        Run simulation
      </Button>
    </Card>

    <Card v-if="results.length" :padded="false">
      <h2
        class="border-b border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Recent Results
      </h2>
      <table class="w-full text-left text-sm">
        <thead class="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <tr>
            <th class="px-4 py-3 font-medium">Attack</th>
            <th class="px-4 py-3 font-medium">Target</th>
            <th class="px-4 py-3 font-medium">Detected</th>
            <th class="px-4 py-3 font-medium">Response Time</th>
            <th class="px-4 py-3 font-medium">Module</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border)]">
          <tr v-for="result in results" :key="result.simulationId">
            <td class="px-4 py-3 text-[var(--color-text-primary)]">{{ result.attackType }}</td>
            <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
              {{ result.target }}
            </td>
            <td class="px-4 py-3">
              <StatusBadge
                :tone="result.detected ? 'success' : 'danger'"
                :label="result.detected ? 'Detected' : 'Not Detected'"
              />
            </td>
            <td class="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
              {{ result.responseTimeMs }}ms
            </td>
            <td class="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              {{ result.triggeredModule ?? '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <ConfirmDialog
      :open="confirmOpen"
      title="Run attack simulation"
      :description="`This will execute a live ${ATTACK_TYPE_LABELS[attackType]} simulation against ${target} in the ${environment.current} environment. This action is recorded in the audit log.`"
      confirm-label="Run simulation"
      variant="danger"
      :loading="submitting"
      @close="confirmOpen = false"
      @confirm="onConfirmRun"
    />
  </div>
</template>
