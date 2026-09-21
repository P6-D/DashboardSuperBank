<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean }>(), { padded: true })
</script>

<template>
  <div
    class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]"
    :class="padded ? 'p-5' : ''"
  >
    <slot />
  </div>
</template>
