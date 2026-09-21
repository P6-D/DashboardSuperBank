<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

/** FRD §6.6 motion guidance: overlay + panel fade/scale, respects prefers-reduced-motion via CSS media query in main.css. */
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

function onBackdrop() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.15 }"
          class="absolute inset-0 bg-black/60"
          @click="onBackdrop"
        />
        <Motion
          :initial="{ opacity: 0, scale: 0.96, y: 8 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.96, y: 8 }"
          :transition="{ duration: 0.18 }"
          role="dialog"
          aria-modal="true"
          class="relative z-10 w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-2xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold text-[var(--color-text-primary)]">{{ props.title }}</h2>
            <button
              class="focus-ring rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <slot />
        </Motion>
      </div>
    </AnimatePresence>
  </Teleport>
</template>
