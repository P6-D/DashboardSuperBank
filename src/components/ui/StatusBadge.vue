<script setup lang="ts">
import { computed } from 'vue'

/**
 * FRD §6.3 Color Semantics: "Status must also have text/icon labels so color
 * is never the only indicator." Every badge renders a label, never color alone.
 */
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    label: string
  }>(),
  { tone: 'neutral' },
)

const toneClasses: Record<Tone, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/30',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/30',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/30',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/30',
  neutral: 'bg-[var(--color-neutral-bg)] text-[var(--color-text-secondary)] ring-[var(--color-border)]',
}

const classes = computed(() => toneClasses[props.tone])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
    :class="classes"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ label }}
  </span>
</template>
