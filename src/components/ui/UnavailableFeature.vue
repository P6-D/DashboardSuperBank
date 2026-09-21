<script setup lang="ts">
/**
 * Transparency pattern: rather than mocking data for FRD modules the current
 * backend does not implement (accounts/transactions admin views,
 * cross-user session revoke, granular roles & permissions API — see
 * backend/README-BACKEND.md "Known Gaps"), this app states plainly what is
 * missing and what would be needed, instead of faking a working screen.
 */
defineProps<{
  title: string
  reason: string
  requiredEndpoint?: string
}>()
</script>

<template>
  <div
    class="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-8"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-base font-semibold text-[var(--color-text-primary)]">{{ title }}</h3>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{{ reason }}</p>
        <p
          v-if="requiredEndpoint"
          class="mt-3 rounded-md bg-[var(--color-surface-2)] px-3 py-2 font-mono text-xs text-[var(--color-text-muted)]"
        >
          Requires: {{ requiredEndpoint }}
        </p>
        <p class="mt-3 text-xs text-[var(--color-text-muted)]">
          This screen intentionally shows this notice instead of mock data, so the backoffice never
          misrepresents what the live SecureBank backend can currently do.
        </p>
      </div>
    </div>
  </div>
</template>
