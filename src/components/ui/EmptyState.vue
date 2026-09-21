<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: 'inbox' | 'search' | 'lock'
  }>(),
  { icon: 'inbox' },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div
      class="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
    >
      <svg v-if="icon === 'lock'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
        />
      </svg>
      <svg
        v-else-if="icon === 'search'"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-2.5 5H6.5L4 13m16 0h-4.5l-1 2h-5l-1-2H4"
        />
      </svg>
    </div>
    <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-sm text-[var(--color-text-secondary)]">{{ description }}</p>
    <slot />
  </div>
</template>
