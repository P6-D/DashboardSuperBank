<script setup lang="ts">
import Button from './Button.vue'

/** FRD §17.2: user-facing errors show message + requestId + retry, never a raw stack trace. */
defineProps<{
  message: string
  requestId?: string
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] py-12 text-center"
  >
    <svg class="h-8 w-8 text-[var(--color-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
    <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ message }}</p>
    <p v-if="requestId" class="font-mono text-xs text-[var(--color-text-muted)]">
      Request ID: {{ requestId }}
    </p>
    <Button size="sm" variant="secondary" @click="emit('retry')">Retry</Button>
  </div>
</template>
