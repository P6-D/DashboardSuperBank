<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

import { useNotificationStore } from '@/stores/notification.store'

const notifications = useNotificationStore()

const toneClasses = {
  success: 'border-[var(--color-success)]/40 text-[var(--color-success)]',
  warning: 'border-[var(--color-warning)]/40 text-[var(--color-warning)]',
  danger: 'border-[var(--color-danger)]/40 text-[var(--color-danger)]',
  info: 'border-[var(--color-info)]/40 text-[var(--color-info)]',
} as const
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        <Motion
          v-for="toast in notifications.toasts"
          :key="toast.id"
          :initial="{ opacity: 0, x: 24 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: 24 }"
          :transition="{ duration: 0.18 }"
          class="pointer-events-auto rounded-lg border bg-[var(--color-surface-2)] p-4 shadow-lg"
          :class="toneClasses[toast.variant]"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ toast.title }}</p>
              <p v-if="toast.description" class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                {{ toast.description }}
              </p>
            </div>
            <button
              class="focus-ring shrink-0 rounded p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              aria-label="Dismiss notification"
              @click="notifications.dismiss(toast.id)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </Motion>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
