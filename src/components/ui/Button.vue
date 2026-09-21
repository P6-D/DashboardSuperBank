<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'secondary', size: 'md', loading: false, disabled: false, type: 'button' },
)

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] focus-visible:ring-[var(--color-accent)]',
  secondary:
    'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] ring-1 ring-inset ring-[var(--color-border)] hover:bg-[var(--color-surface-3)]',
  danger: 'bg-[var(--color-danger)] text-white hover:brightness-110 focus-visible:ring-[var(--color-danger)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

const classes = computed(() => [variantClasses[props.variant], sizeClasses[props.size]])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="focus-ring inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
    :class="classes"
  >
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
