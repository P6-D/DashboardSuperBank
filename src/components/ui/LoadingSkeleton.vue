<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; height?: string }>(), { rows: 5, height: '2.5rem' })
</script>

<template>
  <div class="space-y-2" role="status" aria-label="Loading">
    <div
      v-for="i in rows"
      :key="i"
      class="animate-pulse rounded-md bg-[var(--color-surface-2)]"
      :style="{ height }"
    />
  </div>
</template>
