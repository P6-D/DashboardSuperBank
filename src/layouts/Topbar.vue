<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useEnvironmentStore } from '@/stores/environment.store'

const auth = useAuthStore()
const environment = useEnvironmentStore()
const router = useRouter()

const menuOpen = ref(false)

async function onLogout() {
  await auth.logout()
  menuOpen.value = false
  router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-1)] px-4"
  >
    <div class="flex items-center gap-3">
      <span class="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">SecureBank</span>
      <span class="text-xs text-[var(--color-text-muted)]">Backoffice</span>
      <StatusBadge :tone="environment.badgeColor" :label="environment.current" />
    </div>

    <div class="flex items-center gap-3">
      <div class="relative">
        <button
          class="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
          @click="menuOpen = !menuOpen"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white"
          >
            {{ auth.currentUser?.fullName?.charAt(0) ?? 'A' }}
          </span>
          <span class="hidden text-[var(--color-text-primary)] sm:inline">{{
            auth.currentUser?.fullName ?? 'Admin'
          }}</span>
          <StatusBadge tone="info" :label="auth.role ?? 'ADMIN'" />
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1 shadow-xl"
        >
          <p
            class="truncate border-b border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
          >
            {{ auth.currentUser?.email }}
          </p>
          <button
            class="focus-ring w-full px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-3)]"
            @click="onLogout"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
