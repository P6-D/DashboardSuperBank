<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-surface-0)] text-center"
  >
    <p class="text-5xl font-semibold text-[var(--color-text-primary)]">404</p>
    <p class="text-sm text-[var(--color-text-secondary)]">This page does not exist.</p>
    <RouterLink to="/dashboard" class="text-sm text-[var(--color-accent)] hover:underline">
      Back to dashboard
    </RouterLink>
  </div>
</template>
