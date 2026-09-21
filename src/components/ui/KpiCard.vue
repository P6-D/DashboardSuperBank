<script setup lang="ts">
import { Motion } from 'motion-v'

/** FRD §6.5 / §13.1: dashboard KPI tiles with optional trend indicator. */
withDefaults(
  defineProps<{
    label: string
    value: string
    trend?: 'up' | 'down' | 'flat'
    trendLabel?: string
    tone?: 'default' | 'danger' | 'warning'
  }>(),
  { tone: 'default' },
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
    class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5"
  >
    <p class="text-sm text-[var(--color-text-secondary)]">{{ label }}</p>
    <div class="mt-2 flex items-baseline gap-2">
      <span
        class="font-mono tabular-nums text-2xl font-semibold"
        :class="{
          'text-[var(--color-danger)]': tone === 'danger',
          'text-[var(--color-warning)]': tone === 'warning',
          'text-[var(--color-text-primary)]': tone === 'default',
        }"
      >
        {{ value }}
      </span>
      <span
        v-if="trendLabel"
        class="text-xs font-medium"
        :class="{
          'text-[var(--color-success)]': trend === 'up',
          'text-[var(--color-danger)]': trend === 'down',
          'text-[var(--color-text-muted)]': trend === 'flat' || !trend,
        }"
      >
        {{ trendLabel }}
      </span>
    </div>
  </Motion>
</template>
